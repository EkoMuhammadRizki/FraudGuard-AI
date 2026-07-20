import { NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

function calculateRiskScore(doc: any) {
    if (doc.is_laundering === 1) {
        return {
            riskScore: 95,
            risiko: "kritis",
            status: "Tahan",
            modelVerdict: "BLOCKED",
            fraudType: "Money Laundering",
            analystAction: "Tahan",
            anomalyScore: 88
        };
    }

    const idStr = doc._id.toString();
    const idHash = idStr.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    let baseScore = 5 + (idHash % 25);

    if (doc.payment_format === "Cheque") baseScore += 15;
    else if (doc.payment_format === "Cash") baseScore += 10;

    if (doc.amount_paid > 5000) baseScore += 25;
    else if (doc.amount_paid > 1000) baseScore += 12;

    const riskScore = Math.min(baseScore, 85);

    let risiko = "rendah";
    let status = "Lolos";
    let modelVerdict = "APPROVED";
    let fraudType = "Legitimate";
    let analystAction = "Lolos";
    let anomalyScore = Math.max(5, riskScore - 5);

    if (riskScore >= 60) {
        risiko = "tinggi";
        status = "Review";
        modelVerdict = "SUSPICIOUS";
        fraudType = "Outlier Transaction";
        analystAction = "Eskalasi";
    } else if (riskScore >= 35) {
        risiko = "sedang";
        status = "Review";
        modelVerdict = "REVIEW";
        fraudType = "Anomalous Volume";
        analystAction = "Investigasi";
    }

    return {
        riskScore,
        risiko,
        status,
        modelVerdict,
        fraudType,
        analystAction,
        anomalyScore
    };
}

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

        const rs = calculateRiskScore(doc);
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
            riskScore: rs.riskScore,
            threshold: 0.38,
            modelVerdict: rs.modelVerdict,
            fraudType: rs.fraudType,
            anomalyScore: rs.anomalyScore,
            analystAction: rs.analystAction
        };

        // 2. Build XAI features
        const xaiFeatures = rs.riskScore >= 60 ? [
            { name: "Nominal transaksi outlier", importance: 0.38, impact: "tinggi" as const },
            { name: "Indikasi Rekening Penampung (Mule Account)", importance: 0.25, impact: "tinggi" as const },
            { name: "IP atau device berulang dalam kelompok sesi", importance: 0.12, impact: "sedang" as const }
        ] : rs.riskScore >= 35 ? [
            { name: "Anomali frekuensi aktivitas jangka pendek", importance: 0.22, impact: "sedang" as const },
            { name: "Penggunaan opsi transfer tidak lazim", importance: 0.15, impact: "sedang" as const }
        ] : [
            { name: "Rasio Nominal & Saldo Kritis", importance: 0.02, impact: "rendah" as const },
            { name: "Kecepatan Alur Tidak Wajar (Velocity)", importance: 0.01, impact: "rendah" as const }
        ];

        // 3. Build Graph GNN nodes & edges
        const gnnNodes = [
            { id: "A", label: doc.sender_account, x: 300, y: 250, type: (rs.riskScore >= 60 ? "suspect" : "normal") as const, risk: rs.riskScore },
            { id: "B", label: doc.receiver_account, x: 120, y: 150, type: "recipient" as const, risk: Math.round(rs.riskScore * 0.9) },
            { id: "C", label: doc.device, x: 120, y: 350, type: "device" as const, risk: Math.round(rs.riskScore * 0.7) },
            { id: "D", label: doc.ip, x: 480, y: 150, type: "ip" as const, risk: Math.round(rs.riskScore * 0.8) },
            { id: "E", label: `Merchant #${doc.receiver_bank}`, x: 480, y: 350, type: "merchant" as const, risk: Math.round(rs.riskScore * 0.5) },
            { id: "F", label: doc.location || "Bandung", x: 300, y: 90, type: "geo" as const, risk: Math.round(rs.riskScore * 0.6) }
        ];

        const gnnEdges = [
            { from: "A", to: "B", weight: rs.riskScore >= 35 ? 7 : 2, suspicious: rs.riskScore >= 35 },
            { from: "A", to: "C", weight: 5, suspicious: rs.riskScore >= 60 },
            { from: "A", to: "D", weight: 6, suspicious: rs.riskScore >= 60 },
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
