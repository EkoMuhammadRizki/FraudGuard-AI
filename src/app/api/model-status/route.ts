/**
 * Next.js API Route: /api/model-status
 *
 * Mengecek apakah Python ML server aktif.
 * Dipanggil oleh ModelStatusBadge dan halaman-halaman dasbor.
 */
import { NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? "http://localhost:8000";

export async function GET() {
    try {
        const pyResponse = await fetch(`${PYTHON_API_URL}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(3_000), // timeout cepat (3 detik)
            cache: "no-store",
        });

        if (!pyResponse.ok) {
            return NextResponse.json({ online: false, reason: "unhealthy" }, { status: 200 });
        }

        const data = await pyResponse.json();

        return NextResponse.json({
            online: true,
            model_loaded: data.model_loaded ?? false,
            f1_score: data.f1_score,
            threshold: data.threshold,
            models_used: data.models_used,
            feature_count: data.feature_count,
            server: data.server,
        });

    } catch {
        return NextResponse.json({
            online: false,
            reason: "unreachable",
        });
    }
}
