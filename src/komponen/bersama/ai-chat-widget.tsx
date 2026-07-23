"use client";
import { useState, useRef, useEffect } from "react";
import {
    Bot, X, Send, Sparkles, MessageSquare, ShieldAlert,
    Cpu, Zap, HelpCircle, ChevronDown, Minimize2, RefreshCw,
    AlertTriangle, CheckCircle2
} from "lucide-react";

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: string;
    category?: "info" | "warning" | "success" | "code";
    codeSnippet?: string;
}

const QUICK_SUGGESTIONS = [
    { label: ">_ Terindikasi ATO (Account Takeover)", prompt: "Terindikasi ATO: Pengguna melakukan login dari perangkat baru Android-Xiaomi di Jakarta Barat, diikuti pergantian PIN m-banking 2 menit lalu, dan langsung mencoba transfer sebesar Rp 15.000.000 ke rekening baru yang belum pernah ditransaksikan." },
    { label: ">_ Jaringan Keledai (Money Mule Ring)", prompt: "Rekening ID-994821 menerima 14 kali transfer pecahan Rp 2.500.000 dari pengirim berbeda dalam 10 menit. Seluruh dana langsung diteruskan ke 1 rekening penampung utama." },
    { label: ">_ Sesi AnyDesk / Remote Control", prompt: "Aktivitas m-banking berjalan dengan sinyal Mobile SDK: remoteDesktopActive=true, detectedApp=AnyDesk, dwell_avg=1.2ms, flight_avg=0.5ms. Terdeteksi eksekusi otomatis tanpa jeda ketikan manual." },
    { label: "Cari Transaksi TX000424", prompt: "Detail transaksi TX000424 di database" },
    { label: "Statistik Real-time Database", prompt: "Berapa total transaksi & statistik di database dasbor?" },
    { label: "Daftar Transaksi Kritis", prompt: "Tampilkan transaksi berisiko kritis terbaru di database" },
];

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [aiSource, setAiSource] = useState<string>("MongoDB Atlas & Model Engine");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg-welcome",
            sender: "bot",
            text: "Halo Analis! Saya REMI AI Agent, terhubung langsung dengan Database MongoDB Atlas & Model Inference Server (103.102.46.104:8000).\n\nSaya dapat menjawab pertanyaan transaksi dari dataset, mencari ID transaksi, menghitung statistik dasbor, atau menganalisis log anomali.",
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            category: "info",
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const lastDiscussedTxIdRef = useRef<string | null>(null);
    const lastTopicRef = useRef<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-close ketika mengklik di luar area pop-up REMI AI
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [messages, isOpen, isMinimized]);

    // ── Listener Event Global (Pemicu dari Card Dashboard / Halaman lain) ──
    useEffect(() => {
        const handleOpenRemi = (e: CustomEvent<{ prompt?: string }>) => {
            setIsOpen(true);
            setIsMinimized(false);
            if (e.detail?.prompt) {
                setTimeout(() => {
                    handleSend(e.detail.prompt);
                }, 100);
            }
        };

        window.addEventListener("open-remi-chat", handleOpenRemi as EventListener);
        return () => window.removeEventListener("open-remi-chat", handleOpenRemi as EventListener);
    }, []);

    // ── Generator Respon AI Cerdas (Fallback Lokasi) ──
    const generateAiResponse = (userPrompt: string): { text: string; category?: "info" | "warning" | "success" | "code"; codeSnippet?: string } => {
        const q = userPrompt.toLowerCase();

        if (q.includes("pengembang") || q.includes("pembuat") || q.includes("developer") || q.includes("creator") || q.includes("eko") || q.includes("ihya") || q.includes("muhibin") || q.includes("reza") || q === "ulang" || q.includes("ulangi")) {
            return {
                text: "🛡️ **Tim Pengembang FraudGuard-AI (AmankanGuard)**:\n\nPlatform **FraudGuard-AI (AmankanGuard)** dikembangkan oleh tim pengembang FDS AI & Cyber Security:\n1. **Eko Muhammad Rizki**\n2. **Ihya Abdillah**\n3. **Muhammad Muhibin**\n4. **Reza Asriano**\n\nSistem ini dirancang sebagai platform Real-Time Fraud Detection System (FDS) perbankan generasi baru berbasis Machine Learning Ensemble (XGBoost, LightGBM, Graph Neural Network / GNN) dan Biometric Mobile Telemetry SDK.",
                category: "info"
            };
        }

        if (q.includes("ato") || q.includes("account takeover") || q.includes("skor risiko")) {
            return {
                text: "Skor risiko Account Takeover (ATO) diukur dari gabungan 3 sinyal utama:\n\n1. XGBoost (Binary ML): Menilai deviasi nominal dari kebiasaan transaksi 30 hari terakhir.\n2. Behavioral Telemetry (SDK): Menilai ketikan yang terlalu cepat (bot script) atau sangat hesitant/ragu-ragu (dituntun penipu).\n3. Threat Intel IP/Device: Menilai reputasi alamat IP dan perangkat pengirim.\n\nJika skor > 33.74%, sistem merekomendasikan Pembekuan Sementara & Verifikasi OTP Biometrik.",
                category: "warning"
            };
        }

        if (q.includes("gnn") || q.includes("graph") || q.includes("sindikat") || q.includes("pencucian")) {
            return {
                text: "Graph Neural Network (GNN) memetakan hubungan antar-rekening sebagai Simpul (Node) dan transaksi sebagai Sisi (Edge).\n\nGNN mendeteksi 2 pola utama:\n• High Fan-Out (Penyebaran): 1 rekening pengirim mentransfer uang ke puluhan rekening baru dalam waktu singkat.\n• Aggregation/Mule Ring: Rekening-rekening penampung yang saling mentransfer kembali ke 1 rekening utama (hub).",
                category: "info"
            };
        }

        if (q.includes("anydesk") || q.includes("sdk") || q.includes("remote") || q.includes("layar")) {
            return {
                text: "FraudGuard Mobile SDK (v2.4.1) menggunakan Native Accessibility Service Hook & MediaProjection Monitor pada OS Android/iOS untuk mendeteksi paket aktif AnyDesk, TeamViewer, atau QuickSupport.\n\nKetika AnyDesk terdeteksi aktif saat nasabah membuka m-banking, SDK langsung mengirimkan flag remoteDesktopActive: true ke FDS Engine untuk memblokir transaksi instan.",
                category: "code",
                codeSnippet: `// Sinyal Telemetri SDK ke Backend BI
{
  "deviceIntegrity": {
    "remoteDesktopActive": true,
    "detectedApp": "com.anydesk.anydeskandroid",
    "isRooted": false
  }
}`
            };
        }

        return {
            text: "⚠️ **Maaf, Batasan Domain Terdeteksi**:\n\nSebagai asisten cerdas REMI AI pada platform FraudGuard-AI (AmankanGuard), saya ditugaskan khusus untuk menjawab pertanyaan seputar deteksi fraud perbankan, analisis forensik transaksi, pencarian database FDS, model machine learning (SHAP/GNN/XGBoost), serta telemetri Mobile SDK.",
            category: "warning"
        };
    };

    const handleSend = async (textToSend?: string) => {
        const queryText = textToSend || input;
        if (!queryText.trim()) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "user",
            text: queryText,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput("");
        setIsTyping(true);

        try {
            const qLower = queryText.toLowerCase();
            if (qLower.includes("pengembang") || qLower.includes("pembuat") || qLower.includes("developer") || qLower.includes("creator") || qLower.includes("eko") || qLower.includes("ihya") || qLower.includes("muhibin") || qLower.includes("reza")) {
                lastTopicRef.current = "developer";
            }

            // Check for explicit ID in prompt
            const idPattern = /(tx[0-9]+|ac[0-9]+|rec-[a-z0-9]+|[0-9a-f]{6,24}|9948[0-9]+|8888[0-9]+|5746[0-9]+)/i;
            const match = queryText.match(idPattern);
            if (match) {
                lastDiscussedTxIdRef.current = match[0].toUpperCase();
                lastTopicRef.current = "transaction";
            }

            const getActiveTxId = () => {
                if (typeof window !== "undefined") {
                    return new URLSearchParams(window.location.search).get("txid");
                }
                return null;
            };

            const activeTxId = getActiveTxId();
            const isTxQuery = match || qLower.includes("transaksi") || qLower.includes("tersebut") || qLower.includes("apakah fraud") || qLower.includes("pengirim") || qLower.includes("penerima");
            const targetTxId = match ? match[0].toUpperCase() : (isTxQuery ? (lastDiscussedTxIdRef.current || activeTxId) : null);

            // Sambungkan ke API Proxy /api/detect-fraud (Menghubungkan ke MongoDB Atlas & Model Open-Source AI)
            const res = await fetch("/api/detect-fraud", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: queryText,
                    active_context: {
                        id: targetTxId || null,
                        topic: lastTopicRef.current || "general"
                    },
                    temperature: 0.1,
                    max_tokens: 300
                })
            });

            const data = await res.json();
            
            let replyText = "";
            let cat: "info" | "warning" | "success" | "code" = "info";

            if (data.status === "success" && data.result) {
                replyText = data.result;
                if (data.source) {
                    if (data.source === "database_intelligence") {
                        setAiSource("Database & FDS Intelligence");
                    } else if (data.source === "kamatera_cloud_ai") {
                        setAiSource("Kamatera AI (103.102.46.104)");
                    } else {
                        setAiSource(data.source);
                    }
                }
                if (replyText.includes("🚨") || replyText.includes("BLOKIR") || replyText.includes("ATO")) {
                    cat = "warning";
                }
            } else {
                const fallback = generateAiResponse(queryText);
                replyText = fallback.text;
                cat = fallback.category || "info";
            }

            const botMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: replyText,
                timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                category: cat,
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Error in chatbot fetch:", error);
            const fallback = generateAiResponse(queryText);
            const botMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: fallback.text,
                timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                category: fallback.category || "info",
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div ref={widgetRef} className="fixed bottom-6 right-6 z-[999] flex flex-col items-end pointer-events-none">

            {/* ─── CHAT MODAL WINDOW ─── */}
            {isOpen && (
                <div
                    className={`
                        pointer-events-auto mb-4 w-[92vw] sm:w-[420px] bg-dark-950/95 border border-white/10
                        rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden
                        transition-all duration-300 ease-out origin-bottom-right flex flex-col
                        ${isMinimized ? "h-16" : "h-[540px] max-h-[80vh]"}
                    `}
                >
                    {/* Header Widget */}
                    <div className="bg-gradient-to-r from-blue-950/90 via-dark-900 to-dark-950 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Avatar AI Robot */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-cyan via-primary-blue to-hyper-violet p-0.5 shadow-lg shadow-neon-cyan/20">
                                    <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-neon-cyan animate-pulse" />
                                    </div>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-success rounded-full border-2 border-dark-950 shadow-sm" />
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">REMI AI</h3>
                                    <span className="px-1.5 py-0.2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[8px] font-black uppercase tracking-wider">{aiSource}</span>
                                </div>
                                <p className="text-[10px] text-dark-400 font-bold tracking-tight">Asisten Deteksi Fraud (103.102.46.104:8000)</p>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-dark-400 hover:text-white transition-all"
                                title={isMinimized ? "Maximize" : "Minimize"}
                            >
                                {isMinimized ? <Sparkles className="w-4 h-4 text-neon-cyan" /> : <Minimize2 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-dark-400 hover:text-white transition-all"
                                title="Tutup Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-dark-950/50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.sender === "bot" && (
                                            <div className="w-7 h-7 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shrink-0 mt-1">
                                                <Bot className="w-4 h-4 text-neon-cyan" />
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] space-y-1.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                                            <div
                                                className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium transition-all ${
                                                    msg.sender === "user"
                                                        ? "bg-primary-blue text-white rounded-tr-none shadow-md shadow-primary-blue/20"
                                                        : "bg-dark-900 border border-white/10 text-dark-200 rounded-tl-none"
                                                }`}
                                            >
                                                {/* Text rendering dengan line breaks */}
                                                <div className="whitespace-pre-wrap font-sans">
                                                    {msg.text.replace(/\*\*/g, "").split("\n").map((line, i) => (
                                                        <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line}</p>
                                                    ))}
                                                </div>

                                                {/* Code Snippet pendukung bila ada */}
                                                {msg.codeSnippet && (
                                                    <div className="mt-2.5 bg-dark-950 p-2.5 rounded-xl border border-white/5 font-mono text-[10px] text-neon-cyan overflow-x-auto">
                                                        <pre>{msg.codeSnippet}</pre>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`text-[9px] font-mono text-dark-500 flex items-center gap-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                <span>{msg.timestamp}</span>
                                                {msg.sender === "user" && <span>• Terkirim</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing Loader Dots */}
                                {isTyping && (
                                    <div className="flex gap-3 justify-start items-center">
                                        <div className="w-7 h-7 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-neon-cyan animate-spin" />
                                        </div>
                                        <div className="bg-dark-900 border border-white/10 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="px-3 py-2 bg-dark-900/60 border-t border-white/5 flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
                                {QUICK_SUGGESTIONS.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(item.prompt)}
                                        className="shrink-0 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-neon-cyan/10 border border-white/10 hover:border-neon-cyan/30 text-[10px] text-dark-300 hover:text-neon-cyan transition-all font-medium"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            {/* Input Form Bar */}
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="p-3 bg-dark-900 border-t border-white/10 flex items-center gap-2 shrink-0"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Tanyakan sesuatu pada REMI AI..."
                                    className="flex-1 bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-dark-500 outline-none focus:border-neon-cyan/50 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-primary-blue text-dark-950 font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* ─── FLOATING AVATAR BUTTON (POJOK KANAN BAWAH) ─── */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsMinimized(false);
                }}
                className="pointer-events-auto group relative flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br from-neon-cyan via-primary-blue to-hyper-violet shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] transition-all duration-300 active:scale-90"
                title="Tanya REMI AI"
            >
                {/* Glowing Radar Pulse Effect */}
                <div className="absolute inset-0 rounded-full bg-neon-cyan/30 animate-ping opacity-75 pointer-events-none" />

                {/* Inner Avatar Container */}
                <div className="w-14 h-14 rounded-full bg-dark-950 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                    {/* Background Cyber Grid effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent opacity-60" />

                    {/* Robot Avatar Icon */}
                    <Bot className="w-7 h-7 text-neon-cyan group-hover:rotate-12 transition-transform duration-300 relative z-10" />

                    {/* Badge Icon */}
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-status-success rounded-full border-2 border-dark-950 shadow-sm" />
                </div>
            </button>

        </div>
    );
}
