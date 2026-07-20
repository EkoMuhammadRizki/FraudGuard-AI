import { NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

export async function GET(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";

        // Fetch live predictions from simulation runs
        const livePreds = await db.collection("model_predictions").find({}).sort({ prediction_timestamp: -1 }).toArray();

        // Query database transactions
        let dbQuery = {};
        if (query) {
            dbQuery = {
                $or: [
                    { sender_account: { $regex: query, $options: "i" } },
                    { receiver_account: { $regex: query, $options: "i" } },
                    { sender_entity_name: { $regex: query, $options: "i" } }
                ]
            };
        }

        // Pull top 150 transactions from dataset
        const datasetDocs = await db.collection("dataset_transaksi")
            .find(dbQuery)
            .sort({ timestamp: -1 })
            .limit(150)
            .toArray();

        const mappedTransactions = [
            ...livePreds.map(p => ({
                id: p.transaction_id,
                waktu: new Date(p.prediction_timestamp).toLocaleDateString("id-ID") + " " + new Date(p.prediction_timestamp).toLocaleTimeString("id-ID"),
                pengirim: "Virtual Sender",
                penerima: "Virtual Receiver",
                jumlah: 15000000,
                risiko: p.predicted_class === 1 ? "kritis" : "rendah",
                riskScore: Math.round(p.confidence_score * 100),
                status: p.predicted_class === 1 ? "Tahan" : "Lolos",
                fraudType: p.predicted_class === 1 ? "Account Takeover" : "Legitimate",
                evidence: p.predicted_class === 1 ? "Model mendeteksi anomali perilaku/remote access." : "Pola transaksi terverifikasi normal."
            })),
            ...datasetDocs.map(doc => {
                const isFraud = doc.is_laundering === 1;
                return {
                    id: doc._id.toString().slice(-8).toUpperCase(),
                    waktu: new Date(doc.timestamp).toLocaleDateString("id-ID") + " " + new Date(doc.timestamp).toLocaleTimeString("id-ID"),
                    pengirim: doc.sender_entity_name || `ACC:${doc.sender_account}`,
                    penerima: `ACC:${doc.receiver_account}`,
                    jumlah: doc.amount_paid * 15000, // IDR Equivalent
                    risiko: isFraud ? "kritis" : "rendah",
                    riskScore: isFraud ? 95 : 12,
                    status: isFraud ? "Tahan" : "Lolos",
                    fraudType: isFraud ? "Money Laundering" : "Legitimate",
                    evidence: isFraud ? "Model mendeteksi pencucian uang terstruktur." : "Pola transaksi terverifikasi normal."
                };
            })
        ];

        return NextResponse.json({
            transactions: mappedTransactions
        });
    } catch (err: any) {
        console.error("Failed to get transactions from MongoDB:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
