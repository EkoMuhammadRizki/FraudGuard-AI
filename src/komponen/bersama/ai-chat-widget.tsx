"use client";
import { useState, useRef, useEffect } from "react";
import {
    Bot, X, Send, Sparkles, MessageSquare, ShieldAlert,
    Cpu, Zap, HelpCircle, ChevronDown, Minimize2, RefreshCw,
    AlertTriangle, CheckCircle2, Terminal
} from "lucide-react";

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: string;
    category?: "info" | "warning" | "success" | "code";
    codeSnippet?: string;
}

// Preset khusus REMI AI (Analisis Transaksi Fraud)
const LOCAL_PRESETS = [
    { label: ">_ Indikasi ATO (Account Takeover)", prompt: "Terindikasi ATO: Pengguna login dari HP Android baru di Jakarta Barat, ganti PIN 2 menit lalu, dan mencoba transfer Rp 15.000.000 ke rekening baru." },
    { label: ">_ Money Mule Ring (Pengepul)", prompt: "Rekening ID-994821 menerima 14x transfer pecahan Rp 2.500.000 dalam 10 menit dari pengirim berbeda." },
    { label: ">_ Deteksi Screen Mirroring / AnyDesk", prompt: "Sinyal Telemetri SDK: remoteDesktopActive=true, detectedApp=AnyDesk. Eksekusi cepat tanpa jeda ketikan manual." },
    { label: "Cari Transaksi TX000424", prompt: "Detail transaksi TX000424 di database" },
];

// Preset khusus Gemini (Tips Keamanan & Edukasi Proteksi Akun)
const GEMINI_PRESETS = [
    { label: "Tips Amankan M-Banking", prompt: "Bagaimana cara terbaik mengamankan aplikasi m-banking dari kejahatan rekayasa sosial (social engineering)?" },
    { label: "Ciri Phishing / APK Bodong", prompt: "Apa saja tanda-tanda aplikasi APK penipuan berkedok kurir atau undangan yang berbahaya?" },
    { label: "Proteksi Rekening Penampung", prompt: "Bagaimana cara memproteksi akun perbankan agar tidak dimanfaatkan sebagai rekening keledai (mule account)?" },
    { label: "Fitur Biometrik & OTP Safety", prompt: "Jelaskan mengapa otentikasi biometrik Wajah/Sidik Jari lebih aman daripada password statis." },
];

// Preset khusus Groq (Regulasi FDS, POJK, & Hukum Siber)
const GROQ_PRESETS = [
    { label: "Regulasi POJK 39 Anti-Fraud", prompt: "Jelaskan ringkasan kewajiban bank dalam menerapkan sistem deteksi fraud sesuai POJK No. 39/POJK.03/2019." },
    { label: "Kepatuhan UU PDP Finansial", prompt: "Bagaimana standar perlindungan data pribadi nasabah dalam analisis AI FDS sesuai UU PDP Indonesia?" },
    { label: "Prosedur Pembekuan Rekening", prompt: "Bagaimana alur hukum & standar operasional perbankan saat melakukan pembekuan sementara akun terindikasi fraud?" },
    { label: "Kategori Fraud Perbankan OJK", prompt: "Sebutkan 5 pilar strategi anti-fraud yang diwajibkan oleh Otoritas Jasa Keuangan (OJK)." },
];

// Preset gabungan (Auto Model)
const AUTO_PRESETS = [
    { label: "Statistik Real-time Database", prompt: "Berapa total transaksi & statistik risiko di database dasbor saat ini?" },
    { label: "Daftar Transaksi Kritis", prompt: "Tampilkan ringkasan transaksi berisiko paling tinggi di database" },
    { label: "Tips Proteksi Akun Nasabah", prompt: "Berikan tips keamanan akun m-banking dari serangan malware AnyDesk." },
    { label: "Regulasi Anti-Fraud POJK", prompt: "Jelaskan kewajiban FDS perbankan menurut POJK No. 39/2019." },
];

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState<"auto" | "local" | "groq" | "gemini">("auto");
    const [aiSource, setAiSource] = useState<string>("Auto Cascade Engine");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg-welcome",
            sender: "bot",
            text: "Halo Analis! Saya REMI AI Agent (AmankanGuard).\n\nAnda dapat memilih Model AI di header (AI Server Lokal / Groq Llama 70B / Gemini 2.0 Flash) untuk menjawab analisis transaksi, pertanyaan regulasi finansial, maupun pertanyaan umum.",
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

    // ── Formatter Teks Markdown (Tebal / Bold) ──
    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={index} className="font-extrabold text-neon-cyan drop-shadow-sm">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    // ── Generator Respon AI Cerdas (Fallback Lokasi) ──
    const generateAiResponse = (userPrompt: string): { text: string; category?: "info" | "warning" | "success" | "code"; codeSnippet?: string } => {
        const q = userPrompt.toLowerCase();

        if (q.includes("pengembang") || q.includes("pembuat") || q.includes("developer") || q.includes("creator") || q.includes("eko") || q.includes("ihya") || q.includes("muhibin") || q.includes("reza") || q === "ulang" || q.includes("ulangi")) {
            return {
                text: "🛡️ **Tim Pengembang FraudGuard-AI (AmankanGuard)**:\n\nPlatform **FraudGuard-AI (AmankanGuard)** dikembangkan oleh tim pengembang FDS AI & Cyber Security:\n1. **Eko Muhammad Rizki**\n2. **Ihya Abdillah**\n3. **Muhammad Muhibin**\n4. **Reza Asriano**\n\nSistem ini dirancang sebagai platform Real-Time Fraud Detection System (FDS) perbankan generasi baru berbasis Machine Learning Ensemble (XGBoost, LightGBM, Graph Neural Network / GNN) dan Biometric Mobile Telemetry SDK.",
                category: "info"
            };
        }

        return {
            text: "Sebagai asisten REMI AI, saya siap membantu Anda menganalisis transaksi suspicious, investigasi fraud perbankan, maupun pertanyaan regulasi POJK & UU PDP.",
            category: "info"
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

            // Cek apakah input mengandung ID Transaksi spesifik (misal TXN-xxxx atau ID 9948xxx)
            const idPattern = /(tx[0-9]+|ac[0-9]+|rec-[a-z0-9]+|[0-9a-f]{6,24}|9948[0-9]+|8888[0-9]+|5746[0-9]+)/i;
            const match = queryText.match(idPattern);
            const isSpecificTxForensics = match || qLower.includes("detail transaksi") || qLower.includes("investigasi transaksi");

            let res;
            if (isSpecificTxForensics) {
                // Panggil FDS Forensics Detector
                res = await fetch("/api/detect-fraud", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: queryText,
                        active_context: { id: match ? match[0].toUpperCase() : null },
                        temperature: 0.1,
                        max_tokens: 300
                    })
                });
            } else {
                // Panggil General LLM AI Chat (Groq / Gemini / Local AI Server)
                const chatHistory = messages.slice(-4).map(m => ({
                    role: m.sender === "user" ? "user" : "assistant",
                    content: m.text
                }));

                res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        provider: selectedModel,
                        messages: [...chatHistory, { role: "user", content: queryText }]
                    })
                });
            }

            const data = await res.json();
            
            let replyText = "";
            let cat: "info" | "warning" | "success" | "code" = "info";

            if (data.status === "success" && (data.response || data.result)) {
                replyText = data.response || data.result;
                
                // Update Badge Nama Engine di Header
                if (selectedModel === "local") {
                    setAiSource("REMI AI (Local Engine)");
                } else if (selectedModel === "groq") {
                    setAiSource("Groq (Llama 3.3 70B)");
                } else if (selectedModel === "gemini") {
                    setAiSource("Gemini 2.0 Flash");
                } else if (data.model_used) {
                    setAiSource(data.model_used);
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
                        pointer-events-auto mb-4 w-[92vw] sm:w-[440px] bg-dark-950/95 border border-white/10
                        rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden
                        transition-all duration-300 ease-out origin-bottom-right flex flex-col
                        ${isMinimized ? "h-16" : "h-[560px] max-h-[82vh]"}
                    `}
                >
                    {/* Header Widget */}
                    <div className="bg-gradient-to-r from-blue-950/90 via-dark-900 to-dark-950 p-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
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
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">REMI AI</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[8px] font-black uppercase tracking-wider">{aiSource}</span>
                                </div>
                                
                                {/* Model Selector Dropdown */}
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="text-[9px] text-dark-400 font-medium">Model:</span>
                                    <div className="relative inline-block">
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value as any)}
                                            className="appearance-none bg-dark-900/90 hover:bg-dark-850 border border-white/10 hover:border-neon-cyan/40 text-dark-200 hover:text-white text-[10px] font-semibold rounded-lg pl-2.5 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 backdrop-blur-md cursor-pointer transition-all duration-200 shadow-sm"
                                        >
                                            <option value="auto" className="bg-dark-900 text-white font-medium py-1">Auto (Smart Cascade)</option>
                                            <option value="local" className="bg-dark-900 text-white font-medium py-1">REMI AI (Local Engine)</option>
                                            <option value="groq" className="bg-dark-900 text-white font-medium py-1">Groq (Llama 3.3 70B)</option>
                                            <option value="gemini" className="bg-dark-900 text-white font-medium py-1">Gemini 2.0 Flash</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-dark-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
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
                                                {/* Text rendering dengan typography natural ala ChatGPT / Claude */}
                                                <div className="space-y-2 font-sans leading-relaxed text-xs text-dark-100">
                                                    {msg.text.split("\n").map((line, i) => {
                                                        if (!line.trim()) return <div key={i} className="h-1.5" />;
                                                        
                                                        // Render list bullet yang sangat halus dan rapi
                                                        if (line.trim().startsWith("•") || line.trim().startsWith("-") || /^[0-9]+\./.test(line.trim())) {
                                                            return (
                                                                <div key={i} className="flex items-start gap-2 pl-1 my-1">
                                                                    <span className="text-neon-cyan font-bold text-xs mt-0.5">•</span>
                                                                    <span className="text-dark-200">{formatText(line.replace(/^[•\-\d+\.]\s*/, ""))}</span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <p key={i} className="text-dark-100">
                                                                {formatText(line)}
                                                            </p>
                                                        );
                                                    })}
                                                </div>

                                                {/* Code Snippet pendukung bila ada */}
                                                {msg.codeSnippet && (
                                                    <div className="mt-3 bg-dark-950/80 p-3.5 rounded-2xl border border-white/10 font-mono text-[11px] text-neon-cyan overflow-x-auto shadow-inner">
                                                        <pre>{msg.codeSnippet}</pre>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`text-[9px] font-mono text-dark-500 flex items-center gap-1.5 pt-0.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                <span>{msg.timestamp}</span>
                                                {msg.sender === "user" && <span className="text-neon-cyan/80">✓ Terkirim</span>}
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

                            {/* Dynamic Preset Suggestions according to selected model */}
                            <div className="px-3 pt-2 pb-1.5 bg-dark-900/90 border-t border-white/10 shrink-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-dark-400 uppercase tracking-wider font-extrabold">
                                        {selectedModel === "local" ? "Preset Analisis Transaksi Fraud (REMI AI):" :
                                         selectedModel === "gemini" ? "Preset Keamanan Akun & Tips (Gemini 2.0):" :
                                         selectedModel === "groq" ? "Preset Analisis Regulasi & Perbankan (Groq Llama):" :
                                         "Preset Pertanyaan Populer (Auto):"}
                                    </span>
                                    {input && (
                                        <button
                                            type="button"
                                            onClick={() => setInput("")}
                                            className="text-[9px] font-bold text-dark-500 hover:text-white uppercase tracking-wider transition-colors"
                                        >
                                            Reset Input
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                                    {((selectedModel === "local" ? LOCAL_PRESETS :
                                       selectedModel === "gemini" ? GEMINI_PRESETS :
                                       selectedModel === "groq" ? GROQ_PRESETS :
                                       AUTO_PRESETS) as typeof LOCAL_PRESETS).map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setInput(item.prompt)}
                                            className={`shrink-0 px-2.5 py-1 rounded-xl border text-[9px] font-mono transition-all flex items-center gap-1 ${
                                                input === item.prompt
                                                    ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 font-bold shadow-sm shadow-neon-cyan/20"
                                                    : "bg-white/5 hover:bg-neon-cyan/10 text-dark-300 hover:text-neon-cyan border-white/10 hover:border-neon-cyan/30 font-medium"
                                            }`}
                                        >
                                            <Terminal className="w-3 h-3 text-neon-cyan shrink-0" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Template Input Form Bar */}
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="p-3 bg-dark-900 border-t border-white/10 flex flex-col gap-2 shrink-0"
                            >
                                <textarea
                                    ref={inputRef as any}
                                    rows={2}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={
                                        selectedModel === "local" ? "Masukkan ID transaksi / detail log aktivitas untuk dianalisis FDS Engine..." :
                                        selectedModel === "gemini" ? "Tanyakan tips amankan akun, perlindungan biometrik, atau proteksi fraud..." :
                                        selectedModel === "groq" ? "Tanyakan regulasi POJK, UU PDP, atau studi kasus kejahatan siber..." :
                                        "Pilih preset di atas atau ketik pertanyaan Anda (Tekan Enter untuk kirim)..."
                                    }
                                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-dark-500 outline-none focus:border-neon-cyan/50 transition-all font-sans leading-relaxed custom-scrollbar resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet text-dark-950 font-extrabold text-xs hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-neon-cyan/20 uppercase tracking-wider"
                                >
                                    {isTyping ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-dark-950" />
                                            <span>Memproses Permintaan...</span>
                                        </>
                                    ) : (
                                        <span>
                                            {selectedModel === "local" ? "Analisis Risiko Fraud dengan REMI AI" :
                                             selectedModel === "gemini" ? "Kirim Pertanyaan ke Gemini 2.0" :
                                             selectedModel === "groq" ? "Tanya Groq Llama 3.3 70B" :
                                             "Kirim Pesan (Enter)"}
                                        </span>
                                    )}
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
