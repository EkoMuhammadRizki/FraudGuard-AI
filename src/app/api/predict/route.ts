/**
 * Next.js API Route: /api/predict
 *
 * Proxy ke Python FastAPI ML server di localhost:8000.
 * Frontend tidak pernah langsung menyentuh Python server —
 * semua request melewati route ini.
 */
import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward ke Python FastAPI
        const pyResponse = await fetch(`${PYTHON_API_URL}/api/v1/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            // Timeout 15 detik (model loading mungkin perlu waktu)
            signal: AbortSignal.timeout(15_000),
        });

        if (!pyResponse.ok) {
            const errText = await pyResponse.text();
            return NextResponse.json(
                { error: "Python API error", detail: errText },
                { status: pyResponse.status }
            );
        }

        const data = await pyResponse.json();
        return NextResponse.json(data);

    } catch (err: unknown) {
        const isTimeout = err instanceof Error && err.name === "TimeoutError";
        const isConnRefused =
            err instanceof Error &&
            (err.message.includes("ECONNREFUSED") ||
                err.message.includes("fetch failed") ||
                err.message.includes("network"));

        if (isTimeout || isConnRefused) {
            return NextResponse.json(
                {
                    error: "ml_offline",
                    message:
                        "Python ML server tidak dapat dijangkau. Pastikan python-api sudah berjalan di port 8000.",
                },
                { status: 503 }
            );
        }

        console.error("[/api/predict] Unexpected error:", err);
        return NextResponse.json(
            { error: "internal_error", message: String(err) },
            { status: 500 }
        );
    }
}
