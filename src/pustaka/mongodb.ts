import { MongoClient, Db } from "mongodb";

const MONGO_URI = "mongodb://fraudguard:AmankanFraud123@clusterfraud-shard-00-00.cw2s6z.mongodb.net:27017,clusterfraud-shard-00-01.cw2s6z.mongodb.net:27017,clusterfraud-shard-00-02.cw2s6z.mongodb.net:27017/transactions?ssl=true&replicaSet=atlas-c6o9bq-shard-0&authSource=admin&appName=ClusterFraud";
const DB_NAME = "transactions";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (db && client) {
        return { client, db };
    }

    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    return { client, db };
}
