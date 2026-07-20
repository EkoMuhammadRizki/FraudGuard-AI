from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import datetime
import traceback
from pymongo import MongoClient

import inference

app = FastAPI(title="FraudGuard-AI Inference API", version="2.0")

MONGO_URI = "mongodb://fraudguard:AmankanFraud123@clusterfraud-shard-00-00.cw2s6z.mongodb.net:27017,clusterfraud-shard-00-01.cw2s6z.mongodb.net:27017,clusterfraud-shard-00-02.cw2s6z.mongodb.net:27017/fraud_detection?ssl=true&replicaSet=atlas-c6o9bq-shard-0&authSource=admin&appName=ClusterFraud"
DB_NAME = "fraud_detection"
db_client = None
db = None

# 1. Skema Data Behavioral (Dari Mobile SDK)
# Data ini TIDAK akan disimpan ke MongoDB, hanya menumpang lewat di RAM
class BehavioralTelemetry(BaseModel):
    dwell_avg: float
    flight_avg: float
    traj_avg: float
    cpm: Optional[float] = 40.0
    error_rate: Optional[float] = 0.05
    touch_pressure: Optional[float] = 0.5
    tilt_axis_x: Optional[float] = 0.0
    tilt_axis_y: Optional[float] = 0.0
    scroll_y: Optional[float] = 0.0

# 2. Skema Data Transaksi Utama
class TransactionRequest(BaseModel):
    transaction_id: str
    timestamp: str  
    sender_account: str
    receiver_account: str
    amount_paid: float
    amount_received: float
    payment_format: str
    currency: str
    sender_bank: str
    receiver_bank: str
    
    # SDK akan melampirkan data behavioral ke dalam request ini
    behavioral_data: Optional[BehavioralTelemetry] = None

@app.on_event("startup")
def startup_event():
    global db_client, db
    
    # Load ML Models
    print("Loading Transactional & Behavioral Machine Learning Models...")
    try:
        inference.load_models()
        print("All Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")
        
    # Connect to MongoDB
    print("Connecting to MongoDB Atlas...")
    try:
        db_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db_client.admin.command('ping')
        db = db_client[DB_NAME]
        print(f"Successfully connected to MongoDB Atlas (DB: {DB_NAME})!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

@app.on_event("shutdown")
def shutdown_event():
    if db_client:
        db_client.close()

def save_prediction_to_db(tx_dict: dict, aml_result: dict, is_bot: bool, behavioral_score: float, final_decision: str):
    """Menyimpan hasil prediksi dan alert ke MongoDB Atlas di background."""
    if db is None:
        return
        
    now = datetime.datetime.utcnow()
    tx_id = tx_dict.get("transaction_id", "UNKNOWN_TX_ID")
    
    aml_score_normalized = aml_result.get('risk_score', 0.0) / 100.0
    bot_score_normalized = behavioral_score / 100.0
    max_risk = max(aml_score_normalized, bot_score_normalized)

    # 1. Simpan Prediksi
    pred_doc = {
        "transaction_id": tx_id,
        "predicted_class": 1 if final_decision == "BLOCKED" else 0,
        "confidence_score": max_risk,
        "aml_fraud_score": aml_score_normalized,
        "behavioral_bot_score": bot_score_normalized,
        "model_version": "v2.0-fraudguard-fusion",
        "prediction_timestamp": now
    }
    try:
        db["model_predictions"].insert_one(pred_doc)
    except Exception as e:
        print(f"Failed to save prediction: {e}")

    # 2. Simpan Alert Jika Dicurigai
    if final_decision == "BLOCKED":
        alert_level = "critical" if max_risk > 0.85 else "high"
        alert_doc = {
            "transaction_id": tx_id,
            "risk_score": max_risk,
            "risk_level": alert_level,
            "status": "unresolved",
            "assigned_to": None,
            "created_at": now,
            "resolved_at": None,
            "flags": {
                "aml_alert": aml_result.get('is_fraud', False),
                "bot_alert": is_bot
            }
        }
        try:
            db["alerts"].insert_one(alert_doc)
        except Exception as e:
            print(f"Failed to save alert: {e}")

@app.post("/api/v1/predict")
async def predict_fraud(tx: TransactionRequest, background_tasks: BackgroundTasks):
    try:
        tx_dict = tx.dict()
        
        # 1. Analisis Transaksi (AML)
        aml_result = inference.predict_transaction(tx_dict)
        
        # 2. Analisis Behavioral (Bot/Emulator Detection) - Langsung di RAM
        behavioral_score = 0.0
        is_bot = False
        if tx.behavioral_data:
            behavior_result = inference.predict_behavior(tx_dict['behavioral_data'])
            behavioral_score = behavior_result['bot_score']
            is_bot = behavior_result['is_bot']
            
        # 3. Keputusan Final (Fusion)
        # Jika transaksi dicurigai AML ATAU yang ngetik adalah Bot -> BLOKIR
        final_block_decision = aml_result['is_fraud'] or is_bot
        final_decision_str = "BLOCKED" if final_block_decision else "APPROVED"
        
        # 4. Simpan ke MongoDB di Background
        background_tasks.add_task(
            save_prediction_to_db, 
            tx_dict, 
            aml_result, 
            is_bot, 
            behavioral_score, 
            final_decision_str
        )
        
        return {
            "transaction_id": tx_dict.get("transaction_id", "TBD"),
            "final_decision": final_decision_str,
            "scores": {
                "aml_fraud_score": aml_result['risk_score'],
                "behavioral_bot_score": behavioral_score
            },
            "flags": {
                "aml_alert": aml_result['is_fraud'],
                "bot_alert": is_bot
            }
            # Perhatikan: Data mentah 'dwell_time' dll tidak dikembalikan,
            # sehingga tidak akan pernah masuk ke MongoDB teman Fullstack Anda.
        }
        
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
