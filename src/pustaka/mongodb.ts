import { MongoClient, Db } from "mongodb";

const DB_NAME = process.env.DB_NAME || "fraud_detection";

function getMongoUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is required. Copy .env.example to .env.local and configure it.");
    }
    return uri;
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (db && client) {
        return { client, db };
    }

    try {
        const _client = new MongoClient(getMongoUri(), {
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
