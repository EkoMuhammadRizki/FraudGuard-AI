import { NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

export async function POST(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();
        const { txId, status, action } = body;

        if (!txId || !status || !action) {
            return NextResponse.json({ error: "Missing required fields: txId, status, action" }, { status: 400 });
        }

        // Upsert analyst action log into MongoDB Atlas
        await db.collection("investigation_logs").updateOne(
            { txId: txId.toUpperCase() },
            {
                $set: {
                    txId: txId.toUpperCase(),
                    status,
                    action,
                    timestamp: new Date(),
                    reviewedBy: "Eko Muhammad Rizki"
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, message: `Action ${status} persisted for transaction ${txId}` });
    } catch (err: any) {
        console.error("Failed to save analyst action to MongoDB:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
