import { NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // 1. Aggregate by payment format
        const paymentFormats = await db.collection("dataset_transaksi").aggregate([
            { $group: { _id: "$payment_format", count: { $sum: 1 } } }
        ]).toArray();

        // 2. Aggregate by location/region
        const locations = await db.collection("dataset_transaksi").aggregate([
            { $group: { _id: "$location", count: { $sum: 1 }, fraudCount: { $sum: "$is_laundering" } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Map formats to the frontend structure
        const formatStats = paymentFormats.map(f => ({
            name: f._id || "Unknown",
            value: f.count
        }));

        // Map locations
        const locationStats = locations.map(l => ({
            name: l._id || "Unknown",
            transactionCount: l.count,
            fraudCount: l.fraudCount || 0
        }));

        return NextResponse.json({
            formatStats,
            locationStats
        });
    } catch (err: any) {
        console.error("Failed to get report stats from MongoDB:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
