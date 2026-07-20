import { NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

export async function GET(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const txId = searchParams.get("id") || "";

        let doc: any = null;

        // Try to match the 8-char hex suffix in MongoDB _id
        if (txId && txId.length === 8) {
            const allDocs = await db.collection("dataset_transaksi").find({}).toArray();
            doc = allDocs.find(d => d._id.toString().slice(-8).toUpperCase() === txId);
        }

        // Fallback: If not found or no ID provided, get the single laundering document or the first transaction
        if (!doc) {
            doc = await db.collection("dataset_transaksi").findOne({ is_laundering: 1 });
        }
        if (!doc) {
            doc = await db.collection("dataset_transaksi").findOne({});
        }

        if (!doc) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const isFraud = doc.is_laundering === 1;
        const riskScore = isFraud ? 95 : 12;
        const displayId = doc._id.toString().slice(-8).toUpperCase();

        // 1. Build detail
        const detail = {
            id: displayId,
            pengirim: doc.sender_entity_name || `ACC:${doc.sender_account}`,
            penerima: `ACC:${doc.receiver_account}`,
            jumlah: doc.amount_paid * 15000,
            waktu: new Date(doc.timestamp).toLocaleString("id-ID"),
            metode: doc.payment_format || "Credit Card",
            lokasi: doc.location || "Bandung",
            bpsCode: doc.bps_code || "3273",
            ip: doc.ip || "76.77.56.31",
            device: doc.device || "Web-Chrome",
            merchant: "Merch_" + doc.receiver_bank,
            riskScore: riskScore,
            threshold: 0.38,
            modelVerdict: isFraud ? "BLOCKED" : "APPROVED",
            fraudType: isFraud ? "Money Laundering" : "Legitimate",
            anomalyScore: isFraud ? 88 : 15,
            analystAction: isFraud ? "Tahan" : "Lolos"
        };

        // 2. Build XAI features
        const xaiFeatures = isFraud ? [
            { name: "Indikasi Rekening Penampung (Mule Account)", importance: 0.42, impact: "tinggi" as const },
            { name: "Nominal transaksi outlier", importance: 0.28, impact: "tinggi" as const },
            { name: "IP atau device ada di threat intelligence", importance: 0.15, impact: "sedang" as const }
        ] : [
            { name: "Rasio Nominal & Saldo Kritis", importance: 0.02, impact: "rendah" as const },
            { name: "Kecepatan Alur Tidak Wajar (Velocity)", importance: 0.01, impact: "rendah" as const }
        ];

        // 3. Build Graph GNN nodes & edges
        const gnnNodes = [
            { id: "A", label: doc.sender_account, x: 300, y: 250, type: (isFraud ? "suspect" : "normal") as const, risk: riskScore },
            { id: "B", label: doc.receiver_account, x: 120, y: 150, type: "recipient" as const, risk: isFraud ? 85 : 10 },
            { id: "C", label: doc.device, x: 120, y: 350, type: "device" as const, risk: isFraud ? 75 : 8 },
            { id: "D", label: doc.ip, x: 480, y: 150, type: "ip" as const, risk: isFraud ? 80 : 12 },
            { id: "E", label: `Merchant #${doc.receiver_bank}`, x: 480, y: 350, type: "merchant" as const, risk: isFraud ? 45 : 5 },
            { id: "F", label: doc.location || "Bandung", x: 300, y: 90, type: "geo" as const, risk: isFraud ? 65 : 20 }
        ];

        const gnnEdges = [
            { from: "A", to: "B", weight: isFraud ? 8 : 2, suspicious: isFraud },
            { from: "A", to: "C", weight: 5, suspicious: isFraud },
            { from: "A", to: "D", weight: 6, suspicious: isFraud },
            { from: "A", to: "E", weight: 4, suspicious: false },
            { from: "A", to: "F", weight: 3, suspicious: false }
        ];

        return NextResponse.json({
            detail,
            xaiFeatures,
            gnnNodes,
            gnnEdges
        });
    } catch (err: any) {
        console.error("Failed to get investigation details from MongoDB:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
