# -*- coding: utf-8 -*-
import os
import json
import time
import threading
import traceback
from datetime import datetime
import inference

KAFKA_BROKERS = os.getenv("KAFKA_BROKER", "100.103.158.30:9094,103.102.46.104:9094,localhost:9094").split(",")

def start_kafka_consumer_background():
    """
    Background worker untuk consume event transaksi real-time dari Kafka topic 'transactions'.
    Mengeksekusi ML pipeline (inference.predict_transaction) secara asinkron.
    """
    def _run_loop():
        try:
            from kafka import KafkaConsumer
            print(f"[FraudGuard Kafka] Initializing Consumer for topic 'transactions' on brokers: {KAFKA_BROKERS}")
            
            consumer = KafkaConsumer(
                'transactions',
                bootstrap_servers=[b.strip() for b in KAFKA_BROKERS if b.strip()],
                api_version=(2, 5, 0),
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='fraudguard-python-ml-consumer',
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                consumer_timeout_ms=5000
            )

            print("[FraudGuard Kafka] OK Consumer listening on topic 'transactions'")

            while True:
                for message in consumer:
                    try:
                        tx_payload = message.value
                        print(f"[FraudGuard Kafka] Event received: {tx_payload.get('transaction_id')}")
                        
                        # Run Real Machine Learning Inference
                        ml_result = inference.predict_transaction(tx_payload)
                        print(f"[FraudGuard Kafka] ML Decision for {ml_result['transaction_id']}: {ml_result['final_decision']} ({ml_result['risk_score']}%)")

                    except Exception as err:
                        print(f"[FraudGuard Kafka] Error processing message: {err}")
                
                time.sleep(1)

        except Exception as e:
            print(f"[FraudGuard Kafka] Standalone Mode (Broker Kafka VPS offline/belum aktif: {e}). Engine ML & Chatbot tetap berjalan 100% normal.")

    thread = threading.Thread(target=_run_loop, daemon=True)
    thread.start()
    print("[FraudGuard Kafka] Background worker thread started successfully.")
