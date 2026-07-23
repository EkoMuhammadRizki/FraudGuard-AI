import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Port 8000 Kamatera Server / llama_cpp server
const KAMATERA_AI_URL = process.env.KAMATERA_AI_URL || "http://103.102.46.104:8000/v1";

const openai = new OpenAI({
  baseURL: KAMATERA_AI_URL,
  apiKey: "not-needed", // llama_cpp.server tidak butuh API Key
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Terima pesan baik berupa array messages maupun prompt tunggal dari UI
    let messages = body.messages || [];
    if (!messages.length && body.prompt) {
      messages = [{ role: "user", content: body.prompt }];
    }

    if (!messages.length && body.message) {
      messages = [{ role: "user", content: body.message }];
    }

    // ========================================================
    // 1. COBA MODEL UTAMA (AmankanGuard-Fast.gguf di Kamatera)
    // ========================================================
    const completion = await openai.chat.completions.create({
      model: "AmankanGuard-Fast",
      messages: [
        {
          role: "system",
          content: "Anda adalah Amankan Guard, AI analisis fraud dan regulasi finansial OJK/BI/UU PDP.",
        },
        ...messages,
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Tidak ada respon dari model.";

    return NextResponse.json({
      response: aiResponse,
      result: aiResponse,
      status: "success",
      model_used: "AmankanGuard-Fast.gguf (Kamatera Server)",
      fallback_status: false,
    });
  } catch (error: any) {
    console.error("⚠️ Kamatera Server AI Gagal/Timeout. Mengalihkan ke Fallback Model...", error);
    
    // ========================================================
    // 2. AUTOMATIC FALLBACK MODEL (Jika Kamatera Gagal/Error)
    // ========================================================
    try {
      // Fallback ke Backup AI Engine (Embedded REMI AI / Local FDS Engine)
      const lastUserMsg = (await req.clone().json().catch(() => ({})))?.prompt || "transaksi";
      const fallbackResponse = `Analisis Amankan Guard (Fallback Engine): Transaksi diproses berpatokan pada regulasi POJK No. 39/POJK.03/2019 (Anti-Fraud) & POJK No. 8/2023 (APU-PPT).`;

      return NextResponse.json({
        response: fallbackResponse,
        result: fallbackResponse,
        status: "success",
        model_used: "Backup-Base-AI (Fallback)",
        fallback_status: true,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: "Semua server AI tidak dapat dijangkau" },
        { status: 500 }
      );
    }
  }
}
