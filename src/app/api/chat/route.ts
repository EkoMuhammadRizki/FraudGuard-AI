import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const KAMATERA_AI_URL = process.env.KAMATERA_AI_URL || process.env.AI_SERVER_URL || "http://100.113.232.83:8000/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const selectedProvider = body.provider || "auto"; // "local", "groq", "gemini", "auto"

    let messages = body.messages || [];
    if (!messages.length && body.prompt) {
      messages = [{ role: "user", content: body.prompt }];
    }
    if (!messages.length && body.message) {
      messages = [{ role: "user", content: body.message }];
    }

    const systemMessage = {
      role: "system",
      content: "Anda adalah REMI AI Agent (AmankanGuard), analis keamanan transaksi & regulasi finansial OJK/BI/UU PDP.",
    };

    const fullMessages = [systemMessage, ...messages];

    // ========================================================
    // 1. DIBUTUHKAN: PROV/MODEL SPESIFIK JIKA DILIHAT DARI UI
    // ========================================================
    if (selectedProvider === "groq" && GROQ_API_KEY) {
      try {
        const groqClient = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: GROQ_API_KEY,
        });
        const completion = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: fullMessages,
          temperature: 0.3,
          max_tokens: 1024,
        });
        const aiResponse = completion.choices[0]?.message?.content || "";
        return NextResponse.json({
          response: aiResponse,
          result: aiResponse,
          status: "success",
          model_used: "Groq (Llama-3.3-70B)",
          fallback_status: false,
        });
      } catch (err: any) {
        console.error("Groq Provider error, fallthrough to cascade...", err?.message);
      }
    }

    if (selectedProvider === "gemini" && GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullMessages.map(m => `${m.role}: ${m.content}`).join("\n") }] }]
          })
        });
        const gData = await geminiRes.json();
        const aiResponse = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (aiResponse) {
          return NextResponse.json({
            response: aiResponse,
            result: aiResponse,
            status: "success",
            model_used: "Google Gemini 1.5 Flash",
            fallback_status: false,
          });
        }
      } catch (err: any) {
        console.error("Gemini Provider error, fallthrough to cascade...", err?.message);
      }
    }

    // ========================================================
    // 2. AUTOMATIC CASCADE: LOCAL AI SERVER -> GROQ -> GEMINI -> FALLBACK ENGINE
    // ========================================================

    // Langkah A: Coba AI Server Lokal terlebih dahulu
    try {
      const localOpenai = new OpenAI({
        baseURL: KAMATERA_AI_URL,
        apiKey: "not-needed",
        timeout: 5000,
      });

      const completion = await localOpenai.chat.completions.create({
        model: "AmankanGuard-Fast",
        messages: fullMessages,
        temperature: 0.3,
        max_tokens: 512,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (aiResponse) {
        return NextResponse.json({
          response: aiResponse,
          result: aiResponse,
          status: "success",
          model_used: "AmankanGuard AI Server Lokal",
          fallback_status: false,
        });
      }
    } catch (localError: any) {
      console.warn("⚠️ AI Server Lokal tidak dapat dijangkau. Mencoba Provider Cadangan (Groq/Gemini)...");
    }

    // Langkah B: Cadangan Groq
    if (GROQ_API_KEY) {
      try {
        const groqClient = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: GROQ_API_KEY,
        });
        const completion = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: fullMessages,
          temperature: 0.3,
          max_tokens: 1024,
        });
        const aiResponse = completion.choices[0]?.message?.content;
        if (aiResponse) {
          return NextResponse.json({
            response: aiResponse,
            result: aiResponse,
            status: "success",
            model_used: "Groq Cloud (Llama-3.3-70B)",
            fallback_status: false,
          });
        }
      } catch (groqErr) {
        console.warn("⚠️ Groq API gagal, mencoba Gemini...");
      }
    }

    // Langkah C: Cadangan Gemini
    if (GEMINI_API_KEY) {
      try {
        const geminiClient = new OpenAI({
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          apiKey: GEMINI_API_KEY,
        });
        const completion = await geminiClient.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: fullMessages,
          temperature: 0.3,
          max_tokens: 1024,
        });
        const aiResponse = completion.choices[0]?.message?.content;
        if (aiResponse) {
          return NextResponse.json({
            response: aiResponse,
            result: aiResponse,
            status: "success",
            model_used: "Google Gemini 2.0 Flash",
            fallback_status: false,
          });
        }
      } catch (geminiErr) {
        console.warn("⚠️ Gemini API gagal...");
      }
    }

    // Langkah D: Embedded Backup Engine (Fallback Terakhir)
    const fallbackResponse = `[REMI AI Fallback] Berdasarkan Regulasi POJK No. 39/POJK.03/2019 & POJK No. 8/2023: Sistem menganalisis indikator risiko transaksi dari parameter transaksi, frekuensi, dan anomali perilaku pengirim/penerima.`;

    return NextResponse.json({
      response: fallbackResponse,
      result: fallbackResponse,
      status: "success",
      model_used: "Embedded Rules Engine (Rule Fallback)",
      fallback_status: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Semua server AI gagal memproses permintaan" },
      { status: 500 }
    );
  }
}

