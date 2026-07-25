import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://fraudguard:amankan_fraud@clusterfraud.cw2s6z.mongodb.net/fraud_detection?retryWrites=true&w=majority";
const DB_NAME = process.env.DB_NAME || "fraud_detection";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (db && client) {
        return { client, db };
    }

    try {
        const _client = new MongoClient(MONGO_URI, {
            serverSelectionTimeoutMS: 2500,
            connectTimeoutMS: 2500,
        });
        await _client.connect();
        const _db = _client.db(DB_NAME);
        client = _client;
        db = _db;
        return { client: _client, db: _db };
    } catch (err) {
        client = null;
        db = null;
        throw err;
    }
}
