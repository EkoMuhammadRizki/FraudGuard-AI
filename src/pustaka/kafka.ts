import { Kafka, Partitioners } from "kafkajs";

const brokerString = process.env.KAFKA_BROKER || "100.103.158.30:9094,103.102.46.104:9094,localhost:9094";
const brokers = brokerString.split(",").map(b => b.trim()).filter(Boolean);

const kafka = new Kafka({
  clientId: "fraudguard-vercel",
  brokers: brokers.length > 0 ? brokers : ["103.102.46.104:9094"],
  connectionTimeout: 4000,
  requestTimeout: 8000,
  retry: {
    initialRetryTime: 300,
    retries: 3
  }
});

export const kafkaProducer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
