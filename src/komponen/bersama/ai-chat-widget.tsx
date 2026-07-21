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
    { label: "⚡ Jelaskan skor risiko ATO", prompt: "Bagaimana cara membaca skor risiko transaksi Account Takeover (ATO)?" },
    { label: "🕸️ Cara kerja Graph GNN", prompt: "Jelaskan bagaimana Graph Neural Network (GNN) mendeteksi sindikat pencucian uang?" },
    { label: "📱 Deteksi AnyDesk di SDK", prompt: "Bagaimana FraudGuard SDK mendeteksi aplikasi remote desktop AnyDesk pada HP nasabah?" },
    { label: "🛡️ Tindakan untuk kasus Kritis", prompt: "Saran tindakan terbaik untuk kasus berisiko Kritis (Risk Score > 85%)?" },
];

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg-welcome",
            sender: "bot",
            text: "Halo Analis! Saya REMI, asisten inteligensi siber FDS Bank Indonesia. Ada yang bisa saya bantu terkait analisis transaksi, deteksi anomali biometrik, atau integrasi Mobile SDK?",
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            category: "info",
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [messages, isOpen, isMinimized]);

    // ── Generator Respon AI Cerdas (Mock Agent AI / Siap Sambung ke LLM) ──
    const generateAiResponse = (userPrompt: string): { text: string; category?: "info" | "warning" | "success" | "code"; codeSnippet?: string } => {
        const q = userPrompt.toLowerCase();

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

        if (q.includes("kritis") || q.includes("tindakan") || q.includes("rekomendasi") || q.includes("analis")) {
            return {
                text: "Untuk transaksi berstatus KRITIS (Risk Score > 85%), standar operasional analis fraud (Best Practice) adalah:\n\n1. Hentikan & Blokir sementara dana di rekening penerima.\n2. Konfirmasi Langsung (Call-out) ke nasabah pengirim untuk memverifikasi apakah ia sedang dituntun penipu.\n3. Tandai Investigasi: Klik tombol Tandai Investigasi di dasbor untuk mengunci kasus dan mencatat catatan analisis.",
                category: "warning"
            };
        }

        if (q.includes("halo") || q.includes("hai") || q.includes("pagi") || q.includes("siang") || q.includes("malam")) {
            return {
                text: "Halo! Saya REMI AI Agent. Silakan tanyakan hal seputar analisis data transaksi, grafik GNN, sinyal biometrik SDK, atau panduan operasional analis fraud.",
                category: "info"
            };
        }

        return {
            text: `Terima kasih atas pertanyaannya! Berdasarkan basis pengetahuan FDS Amankan Fraud BI:\n\nSistem mengidentifikasi topik terkait "${userPrompt}".\n\nAnda dapat mengecek detail laporan di menu Investigasi atau memanfaatkan tab Simulasi SDK untuk menguji kasus ini secara live. (Model AI kustom Anda siap disambungkan ke endpoint backend bila pelatihan model tambahan selesai).`,
            category: "info"
        };
    };

    const handleSend = (textToSend?: string) => {
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

        // Simulasi respon delay AI Agent (700ms)
        setTimeout(() => {
            const aiResp = generateAiResponse(queryText);
            const botMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: aiResp.text,
                timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                category: aiResp.category,
                codeSnippet: aiResp.codeSnippet,
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 750);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end pointer-events-none">

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
                                    <span className="px-1.5 py-0.2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[8px] font-black uppercase">v1.0 Agent</span>
                                </div>
                                <p className="text-[10px] text-dark-400 font-bold tracking-tight">Asisten Cerdas Analis Fraud BI</p>
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
