"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Smartphone, ShieldAlert, ShieldCheck, Cpu, Layers,
    Wifi, Send, RefreshCw, Terminal, Code, Settings, AlertTriangle, Play, HelpCircle
} from "lucide-react";
import ModelStatusBadge from "@/komponen/ui/model-status-badge";

// --- Types ---
interface SDKLog {
    time: string;
    type: "info" | "warn" | "success" | "danger";
    message: string;
}

interface MLResult {
    transaction_id: string;
    final_decision: "BLOCKED" | "APPROVED";
    is_fraud: boolean;
    risk_score: number;
    threshold_used: number;
    fraud_type: string;
    model_scores: {
        xgboost: number;
        lightgbm_max: number;
        lightgbm_fraud_sum: number;
        graph_gnn: number;
        ensemble_final: number;
    };
    processing_time_ms: number;
    is_live: boolean;
}

export default function SimulasiSDKPage() {
    // State Handphone
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    
    // State Switch Ancaman
    const [simulateAnyDesk, setSimulateAnyDesk] = useState(false);
    const [simulateRoot, setSimulateRoot] = useState(false);
    
    // Keystroke Telemetry
    const [dwellTimes, setDwellTimes] = useState<number[]>([]);
    const [flightTimes, setFlightTimes] = useState<number[]>([]);
    const lastKeyUpTimeRef = useRef<number>(0);
    const keyDownTimeRef = useRef<number>(0);

    // Logs & Token states
    const [logs, setLogs] = useState<SDKLog[]>([]);
    const [jwtPayload, setJwtPayload] = useState<string>("");
    
    // Pipeline & ML states
    const [isProcessing, setIsProcessing] = useState(false);
    const [pipelineStage, setPipelineStage] = useState<"idle" | "token" | "inference" | "meta" | "done">("idle");
    const [mlResult, setMlResult] = useState<MLResult | null>(null);

    // User metadata
    const [userIp, setUserIp] = useState("Detecting...");
    const [userAgentCleaned, setUserAgentCleaned] = useState("Detecting...");

    // Helper log function
    const addLog = useCallback((message: string, type: "info" | "warn" | "success" | "danger" = "info") => {
        const time = new Date().toLocaleTimeString("id-ID", { hour12: false }) + `.${String(new Date().getMilliseconds()).padStart(3, "0")}`;
        setLogs(prev => [...prev.slice(-30), { time, type, message }]);
    }, []);

    // Parse UA on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const ua = window.navigator.userAgent.toLowerCase();
            let os = "OS Lain";
            if (ua.includes("windows")) os = "Windows";
            else if (ua.includes("macintosh")) os = "macOS";
            else if (ua.includes("android")) os = "Android";
            else if (ua.includes("iphone")) os = "iOS";
            else if (ua.includes("linux")) os = "Linux";

            let browser = "Browser";
            if (ua.includes("edg/")) browser = "Microsoft Edge";
            else if (ua.includes("chrome")) browser = "Google Chrome";
            else if (ua.includes("firefox")) browser = "Mozilla Firefox";
            else if (ua.includes("safari")) browser = "Apple Safari";

            setUserAgentCleaned(`${browser} (${os})`);
        }

        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => setUserIp(data.ip))
            .catch(() => setUserIp("103.176.97.239 (Proxy/Mock)"));

        // Initial SDK logs
        addLog("FraudGuard Mobile SDK initialized successfully for Mobile Banking.", "success");
        addLog("SDK Version: v2.4.1 | Build: 2026-07-20 | License: VALID", "info");
        addLog("Security check: Cryptographic integrity check passed.", "info");
    }, [addLog]);

    // Handle anydesk toggle log
    useEffect(() => {
        if (simulateAnyDesk) {
            addLog("WARN: Active screen-sharing / remote control app detected (AppID: AnyDesk).", "danger");
        } else {
            addLog("Security status: Remote control applications cleared.", "success");
        }
    }, [simulateAnyDesk, addLog]);

    // Handle root toggle log
    useEffect(() => {
        if (simulateRoot) {
            addLog("WARN: Superuser binaries detected in path (/system/xbin/su). OS integrity compromised.", "danger");
        } else {
            addLog("Security status: OS integrity check verified (Non-Rooted device).", "success");
        }
    }, [simulateRoot, addLog]);

    // Keystroke handlers inside the PIN input
    const handleKeyDown = () => {
        keyDownTimeRef.current = performance.now();
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const now = performance.now();
        const dwell = Math.round(now - keyDownTimeRef.current);
        const flight = lastKeyUpTimeRef.current > 0 ? Math.round(now - lastKeyUpTimeRef.current) : 0;
        lastKeyUpTimeRef.current = now;

        if (dwell > 0) setDwellTimes(prev => [...prev.slice(-10), dwell]);
        if (flight > 0) setFlightTimes(prev => [...prev.slice(-10), flight]);

        addLog(`Keystroke captured: [Key: ${e.key}] Dwell: ${dwell}ms | Flight: ${flight > 0 ? flight + "ms" : "N/A"}`, "info");
    };

    // Recipient account formatting
    const handleRecipientChange = (val: string) => {
        const cleaned = val.replace(/\D/g, "").slice(0, 16);
        setRecipient(cleaned);
    };

    const formatRecipient = (raw: string) => {
        return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    };

    // Amount formatting
    const handleAmountChange = (val: string) => {
        const cleaned = val.replace(/\D/g, "");
        setAmount(cleaned);
    };

    const formatAmount = (raw: string) => {
        if (!raw) return "";
        return parseInt(raw, 10).toLocaleString("id-ID");
    };

    // Generate simulated Token JWT
    const generateTokenPayload = useCallback(() => {
        const avgDwell = dwellTimes.length ? Math.round(dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length) : 95;
        const avgFlight = flightTimes.length ? Math.round(flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length) : 120;

        const payload = {
            header: {
                alg: "HS256",
                typ: "JWT",
                sdk_version: "2.4.1"
            },
            payload: {
                device_integrity: {
                    rooted: simulateRoot,
                    remote_desktop_active: simulateAnyDesk,
                    usb_debugging: false,
                    emulated: false
                },
                keystroke_biometrics: {
                    avg_dwell_ms: avgDwell,
                    avg_flight_ms: avgFlight,
                    keystroke_count: pin.length + amount.length
                },
                device_metadata: {
                    ip_address: userIp,
                    user_agent: userAgentCleaned
                }
            }
        };

        setJwtPayload(JSON.stringify(payload, null, 2));
    }, [dwellTimes, flightTimes, simulateRoot, simulateAnyDesk, pin, amount, userIp, userAgentCleaned]);

    // Update JWT dynamically as inputs change
    useEffect(() => {
        generateTokenPayload();
    }, [generateTokenPayload]);

    const runTransferSimulation = async () => {
        if (!recipient || !amount || pin.length < 4) {
            alert("Harap lengkapi semua kolom m-banking (Penerima, Nominal, dan PIN)!");
            return;
        }

        setIsProcessing(true);
        setMlResult(null);
        
        // Step 1: Token Packaging
        setPipelineStage("token");
        addLog("KIRIM DANA dipicu. Mengepak payload telemetri m-banking...", "info");
        await new Promise(r => setTimeout(r, 700));
        addLog("Secure Token X-FraudGuard-Token berhasil di-generate.", "success");

        // Step 2: Server API forwarding
        setPipelineStage("inference");
        addLog("Mengirim request ke Gateway Bank Rakyat Digital...", "info");
        await new Promise(r => setTimeout(r, 800));
        addLog("Core banking meneruskan Token ke FraudGuard FDS Engine.", "info");

        // Step 3: FDS Stacking Inference
        setPipelineStage("meta");
        addLog("FDS Engine: Menjalankan paralel klasifikasi (XGBoost + LightGBM + Graph GNN)...", "info");

        // Mempersiapkan payload real untuk ML backend.
        // Kita simulasikan variabel-variabel velocity berdasarkan toggle ancaman.
        let dailyTxCount = 2;
        let isNewReceiver = 0;
        let senderAccountAge = 730; // 2 tahun (normal)

        if (simulateAnyDesk) {
            // Skenario AnyDesk = pembajakan/menguras rekening instan.
            // Kita ubah variabel velocity menjadi pola serangan terdeteksi bot/pencucian uang.
            dailyTxCount = 145; // Frekuensi transfer super cepat dalam sehari
            isNewReceiver = 1;
            senderAccountAge = 1; // Akun korban yang baru diambil alih/dikuras
        } else if (simulateRoot) {
            // Skenario Rooted device.
            dailyTxCount = 85;
            isNewReceiver = 1;
            senderAccountAge = 5;
        }

        const payload = {
            timestamp: new Date().toISOString(),
            sender_account: "8888777766", // Mock sender m-banking account
            receiver_account: recipient,
            amount_paid: parseFloat(amount),
            amount_received: parseFloat(amount) * (simulateAnyDesk ? 0.95 : 1.0),
            payment_format: simulateAnyDesk ? "ACH" : "Wire",
            currency: "IDR",
            sender_bank: "Bank Rakyat Digital",
            receiver_bank: "Bank Penerima",
            sender_account_age_days: senderAccountAge,
            is_new_receiver_for_sender: isNewReceiver,
            daily_tx_count: dailyTxCount,
            // Sinyal graph (AML)
            sender_degree: simulateAnyDesk ? 25 : 4,
            receiver_indegree: simulateAnyDesk ? 55 : 3,
            fan_out_ratio: simulateAnyDesk ? 0.75 : 0.12,
            fan_in_ratio: simulateAnyDesk ? 0.85 : 0.08,
            time_since_last_tx: simulateAnyDesk ? 4 : 3600
        };

        try {
            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            // Override nama ancaman jika terindikasi AnyDesk/Root untuk visualisasi detail SDK
            let updatedData = { ...data, is_live: true };
            if (data.final_decision === "BLOCKED" || data.risk_score > 33.7) {
                if (simulateAnyDesk) {
                    updatedData.fraud_type = "Remote Access Takeover (AnyDesk)";
                    addLog("CRITICAL: FDS memblokir transaksi! Terdeteksi pembajakan layar AnyDesk.", "danger");
                } else if (simulateRoot) {
                    updatedData.fraud_type = "Compromised Device (Rooted OS)";
                    addLog("CRITICAL: FDS memblokir transaksi! Device compromised / rooted.", "danger");
                } else {
                    addLog("CRITICAL: FDS memblokir transaksi karena anomali transaksi berat.", "danger");
                }
            } else {
                addLog("FDS Verdict: Transaksi dinyatakan AMAN (APPROVED).", "success");
            }

            setMlResult(updatedData);
        } catch (err) {
            // Fallback jika Python backend offline
            const dummyScore = simulateAnyDesk ? 98.4 : simulateRoot ? 82.5 : 3.8;
            const mockData: MLResult = {
                transaction_id: "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
                final_decision: (simulateAnyDesk || simulateRoot) ? "BLOCKED" : "APPROVED",
                is_fraud: (simulateAnyDesk || simulateRoot),
                risk_score: dummyScore,
                threshold_used: 33.7,
                fraud_type: simulateAnyDesk 
                    ? "Remote Access Takeover (AnyDesk)" 
                    : simulateRoot 
                        ? "Compromised Device (Rooted OS)" 
                        : "Legitimate",
                model_scores: {
                    xgboost: dummyScore * 0.9,
                    lightgbm_max: dummyScore * 0.95,
                    lightgbm_fraud_sum: dummyScore * 0.92,
                    graph_gnn: dummyScore * 0.88,
                    ensemble_final: dummyScore
                },
                processing_time_ms: 12,
                is_live: false
            };
            setMlResult(mockData);
            if (mockData.final_decision === "BLOCKED") {
                addLog(`CRITICAL (Fallback): FDS memblokir transaksi! Jenis: ${mockData.fraud_type}`, "danger");
            } else {
                addLog("FDS Verdict (Fallback): Transaksi dinyatakan AMAN (APPROVED).", "success");
            }
        } finally {
            setPipelineStage("done");
            setIsProcessing(false);
        }
    };

    const resetSDKSimulation = () => {
        setRecipient("");
        setAmount("");
        setPin("");
        setDwellTimes([]);
        setFlightTimes([]);
        setMlResult(null);
        setPipelineStage("idle");
        lastKeyUpTimeRef.current = 0;
        addLog("Simulasi SDK di-reset. Standby menunggu interaksi.", "info");
    };

    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20">
                        <Smartphone className="w-5 h-5 text-neon-cyan" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
                            Integrasi <span className="text-neon-cyan">Mobile SDK</span>
                        </h1>
                        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em] mt-0.5">
                            Simulasi Perlindungan Client-Side Finansial (PIDI x Digdaya BI)
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <ModelStatusBadge showDetails pollInterval={30000} />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* --- LAYAR KIRI: SMARTPHONE MOCKUP --- */}
                <div className="xl:col-span-5 flex flex-col items-center">
                    
                    {/* Device switch indicators */}
                    <div className="w-full max-w-[320px] mb-4 bg-dark-950/80 border border-white/5 rounded-2xl p-4 space-y-3">
                        <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Simulator Sinyal Bahaya</div>
                        
                        {/* Toggle AnyDesk */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-dark-300 group-hover:text-white transition-colors">
                                Aktifkan AnyDesk (Screen Share)
                            </span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={simulateAnyDesk}
                                    onChange={(e) => setSimulateAnyDesk(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-500 peer-checked:after:bg-status-error after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-status-error/20 border border-white/5" />
                            </div>
                        </label>

                        {/* Toggle Root */}
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-dark-300 group-hover:text-white transition-colors">
                                Simulasikan Perangkat Rooted
                            </span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={simulateRoot}
                                    onChange={(e) => setSimulateRoot(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-500 peer-checked:after:bg-status-error after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-status-error/20 border border-white/5" />
                            </div>
                        </label>
                    </div>

                    {/* Smartphone Body */}
                    <div className="relative w-[320px] h-[640px] bg-[#0c0f1d] rounded-[3rem] border-4 border-dark-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
                        {/* Phone Camera Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-dark-800 rounded-b-2xl z-50 flex items-center justify-center">
                            <span className="w-3 h-3 bg-black rounded-full" />
                        </div>

                        {/* M-Banking App Header */}
                        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-blue-900 pt-9 pb-4 px-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                                    <Cpu className="w-3 h-3 text-neon-cyan" />
                                </div>
                                <span className="text-[10px] font-black text-white tracking-widest uppercase italic">Rakyat Digital</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Wifi className="w-3.5 h-3.5 text-status-success" />
                                <span className="text-[9px] font-mono text-white/50">LTE</span>
                            </div>
                        </div>

                        {/* App Screens Content */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar pt-4">
                            
                            {/* App title */}
                            <div className="text-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Layanan Transfer Dana</h3>
                                <p className="text-[8px] text-dark-500 uppercase tracking-wider mt-0.5">Metode Instan Online</p>
                            </div>

                            {/* App Form */}
                            <div className="space-y-4">
                                {/* Recipient */}
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">Rekening Tujuan</label>
                                    <input 
                                        type="text"
                                        placeholder="cth: 1029 3847 56"
                                        value={formatRecipient(recipient)}
                                        onChange={e => handleRecipientChange(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full bg-dark-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50"
                                    />
                                </div>

                                {/* Amount */}
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">Nominal Transfer (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-dark-500">Rp</span>
                                        <input 
                                            type="text"
                                            placeholder="150.000"
                                            value={formatAmount(amount)}
                                            onChange={e => handleAmountChange(e.target.value)}
                                            disabled={isProcessing}
                                            className="w-full bg-dark-950/60 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50"
                                        />
                                    </div>
                                </div>

                                {/* Transaksi PIN (Telemetry collection source) */}
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">PIN Transaksi (Biometrik Keyboard)</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••"
                                        maxLength={6}
                                        value={pin}
                                        onKeyDown={handleKeyDown}
                                        onKeyUp={handleKeyUp}
                                        onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                                        disabled={isProcessing}
                                        className="w-full bg-dark-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-center tracking-widest text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50"
                                    />
                                    <p className="text-[7px] text-dark-600 font-mono text-center">SDK merekam ritme ketikan Anda pada form ini.</p>
                                </div>
                            </div>

                            {/* CTA Action */}
                            <div className="pt-2">
                                <button
                                    onClick={runTransferSimulation}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan hover:bg-neon-cyan/80 text-dark-950 text-[10px] font-black uppercase tracking-widest transition active:scale-95 disabled:opacity-40"
                                >
                                    <Send className="w-3.5 h-3.5" /> Transfer Sekarang
                                </button>
                            </div>

                            {/* Reset Button */}
                            <div className="text-center">
                                <button 
                                    onClick={resetSDKSimulation}
                                    className="text-[8px] font-bold text-dark-500 hover:text-white uppercase tracking-wider transition"
                                >
                                    Reset Form
                                </button>
                            </div>
                        </div>

                        {/* Phone Home Button Bar */}
                        <div className="h-10 bg-dark-950/40 flex items-center justify-center border-t border-white/5">
                            <div className="w-24 h-1.5 bg-dark-700 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* --- KANAN: SDK DEBUGGER --- */}
                <div className="xl:col-span-7 space-y-6">
                    
                    {/* Live Console Output */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-neon-cyan" />
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Console Debugger Mobile SDK</h3>
                            </div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 uppercase tracking-widest">
                                Client Logs
                            </span>
                        </div>

                        {/* Console Body */}
                        <div className="bg-[#040712] border border-white/5 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="text-dark-600 italic select-none pt-16 text-center uppercase tracking-widest">
                                    Menunggu interaksi perangkat...
                                </div>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                                        <span className="text-dark-500 select-none shrink-0">{log.time}</span>
                                        <span className={
                                            log.type === "success" ? "text-status-success" :
                                            log.type === "warn" ? "text-amber-warning" :
                                            log.type === "danger" ? "text-status-error font-bold" :
                                            "text-dark-300"
                                        }>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Token & HTTP Header Inspector */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-neon-cyan" />
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">HTTP Request Header & Secure Token Payload</h3>
                            </div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-white/5 text-dark-400 border border-white/10 uppercase tracking-widest">
                                JWT/JWS Inspector
                            </span>
                        </div>

                        {/* Header preview */}
                        <div className="bg-[#040712] border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-dark-300 space-y-3 overflow-x-auto">
                            <div>
                                <span className="text-hyper-violet font-bold">POST</span> <span className="text-white">http://api.bankrakyat.id/v1/transfer</span>
                            </div>
                            <div className="space-y-1 border-b border-white/5 pb-2.5">
                                <div><span className="text-neon-cyan">Content-Type:</span> application/json</div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-neon-cyan">X-FraudGuard-Token:</span>
                                    <span className="text-status-success font-black truncate max-w-[280px]">
                                        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaW50ZWdyaXR5Ijp7InJvb3RlZCI6dHJ1ZX0s...
                                    </span>
                                </div>
                            </div>
                            
                            {/* JSON Payload viewer */}
                            <pre className="text-[9px] text-[#8ea6ff] pt-1">
                                {jwtPayload || "{}"}
                            </pre>
                        </div>
                    </div>

                    {/* ML Decision Box */}
                    {pipelineStage !== "idle" && (
                        <div className="glass-panel rounded-[2rem] p-6 space-y-4 animate-fade-in relative overflow-hidden">
                            
                            {/* Loading state indicator */}
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center py-6 gap-3">
                                    <RefreshCw className="w-8 h-8 text-neon-cyan animate-spin" />
                                    <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest animate-pulse">
                                        {pipelineStage === "token" && "Mengepak Token Perilaku SDK..."}
                                        {pipelineStage === "inference" && "Mengirim Payload ke FDS API..."}
                                        {pipelineStage === "meta" && "Model ML FDS sedang menguji..."}
                                    </span>
                                </div>
                            ) : (
                                mlResult && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-neon-cyan" />
                                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Hasil Uji Mesin FDS (Live ML)</h3>
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                                mlResult.is_live 
                                                    ? "bg-status-success/10 text-status-success border border-status-success/20"
                                                    : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                            }`}>
                                                {mlResult.is_live ? "⚡ LIVE ML" : "🎭 DEMO MODE"}
                                            </span>
                                        </div>

                                        {/* Result visual */}
                                        <div className={`rounded-2xl border p-5 flex flex-col items-center text-center space-y-2 ${
                                            mlResult.final_decision === "BLOCKED"
                                                ? "border-status-error/30 bg-status-error/5 text-status-error"
                                                : "border-status-success/30 bg-status-success/5 text-status-success"
                                        }`}>
                                            <div className="flex items-center gap-2 text-2xl font-black uppercase tracking-wider">
                                                {mlResult.final_decision === "BLOCKED" ? (
                                                    <><ShieldAlert className="w-6 h-6" /> DIBLOKIR</>
                                                ) : (
                                                    <><ShieldCheck className="w-6 h-6" /> APPROVED (AMAN)</>
                                                )}
                                            </div>
                                            {mlResult.final_decision === "BLOCKED" && (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-status-error">
                                                    Ancaman: {mlResult.fraud_type}
                                                </div>
                                            )}
                                            <div className="text-dark-400 font-mono text-[10px] tracking-wide mt-1">
                                                Skor Risiko Final: <span className="font-bold">{Math.round(mlResult.risk_score)}/100</span> | Threshold: {mlResult.threshold_used}
                                            </div>
                                        </div>

                                        {/* Model breakdown details */}
                                        <div className="bg-dark-950/40 rounded-xl p-4 border border-white/5 space-y-2.5">
                                            <div className="text-[8px] font-black text-dark-500 uppercase tracking-widest">Ensemble Decision Scores</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">XGBoost Binary:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.model_scores.xgboost)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">LightGBM Multiclass:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.model_scores.lightgbm_fraud_sum)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">Graph Neural Network:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.model_scores.graph_gnn)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">Meta-Learner Stacker:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.model_scores.ensemble_final)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
