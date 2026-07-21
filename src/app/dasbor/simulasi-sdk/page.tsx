"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Smartphone, ShieldAlert, ShieldCheck, Cpu, Layers,
    Wifi, Send, RefreshCw, Terminal, Code,
    Zap, BarChart3, BookOpen,
    Copy, Check
} from "lucide-react";
import ModelStatusBadge from "@/komponen/ui/model-status-badge";
import {
    FraudGuardSDK,
    SDK_PRESETS,
    SDK_CODE_SNIPPETS,
    type SDKLog,
    type SDKLogType,
    type SDKEvaluationResult,
    type PresetScenario,
} from "@/pustaka/fraudguard-sdk";

// ─── Right Panel Tab Type ────────────────────────────────────────────────────
type RightTab = "console" | "token" | "developer";

export default function SimulasiSDKPage() {
    // SDK Instance (stable across renders)
    const sdkRef = useRef<FraudGuardSDK | null>(null);

    // Phone form state
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");

    // Logs & pipeline
    const [logs, setLogs] = useState<SDKLog[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pipelineStage, setPipelineStage] = useState<"idle" | "token" | "inference" | "meta" | "done">("idle");
    const [mlResult, setMlResult] = useState<SDKEvaluationResult | null>(null);

    // Token JWT payload
    const [jwtPayload, setJwtPayload] = useState<string>("{}");

    // Active preset
    const [activePreset, setActivePreset] = useState<string | null>(null);

    // Threat toggles (for manual mode)
    const [simulateAnyDesk, setSimulateAnyDesk] = useState(false);
    const [simulateRoot, setSimulateRoot] = useState(false);

    // Telemetry display
    const [telemetryDisplay, setTelemetryDisplay] = useState({
        avgDwell: 0, avgFlight: 0, hesitation: 0, consistency: 0
    });

    // Right panel tab
    const [rightTab, setRightTab] = useState<RightTab>("console");

    // Developer snippet tab
    const [devPlatform, setDevPlatform] = useState<keyof typeof SDK_CODE_SNIPPETS>("android");
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    // Log scroll ref
    const logEndRef = useRef<HTMLDivElement>(null);

    // ── SDK Log Callback ──
    const addLog = useCallback((message: string, type: SDKLogType = "info") => {
        const time = new Date().toLocaleTimeString("id-ID", { hour12: false }) +
            `.${String(new Date().getMilliseconds()).padStart(3, "0")}`;
        setLogs(prev => [...prev.slice(-40), { time, type, message }]);
    }, []);

    // ── Initialize SDK on mount ──
    useEffect(() => {
        const sdk = new FraudGuardSDK();
        sdk.onLog(addLog);
        sdk.initialize("BI-DEMO-00001", "DEMO", "Bank Rakyat Digital");
        sdk.startTelemetry();
        sdkRef.current = sdk;
    }, [addLog]);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // ── Update JWT token display whenever inputs change ──
    useEffect(() => {
        if (!sdkRef.current) return;
        const token = sdkRef.current.generateSecureToken();
        setJwtPayload(JSON.stringify(token, null, 2));

        const telemetry = sdkRef.current.getLiveTelemetry();
        setTelemetryDisplay({
            avgDwell: telemetry.avgDwellMs,
            avgFlight: telemetry.avgFlightMs,
            hesitation: telemetry.hesitationScore,
            consistency: telemetry.typingConsistency,
        });
    }, [pin, amount, recipient, simulateAnyDesk, simulateRoot, activePreset]);

    // ── Manual threat toggle sync ──
    useEffect(() => {
        if (!sdkRef.current || activePreset) return;
        sdkRef.current.setDeviceIntegrity({ remoteDesktopActive: simulateAnyDesk });
    }, [simulateAnyDesk, activePreset]);

    useEffect(() => {
        if (!sdkRef.current || activePreset) return;
        sdkRef.current.setDeviceIntegrity({ rooted: simulateRoot });
    }, [simulateRoot, activePreset]);

    // ── Keystroke handlers ──
    const handleKeyDown = () => { sdkRef.current?.onKeyDown(); };
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!sdkRef.current) return;
        const { dwellMs, flightMs } = sdkRef.current.onKeyUp(e.key);
        addLog(`Keystroke [${e.key}] Dwell: ${dwellMs}ms | Flight: ${flightMs > 0 ? flightMs + "ms" : "N/A"}`, "info");

        // Re-derive telemetry display
        const t = sdkRef.current.getLiveTelemetry();
        setTelemetryDisplay({ avgDwell: t.avgDwellMs, avgFlight: t.avgFlightMs, hesitation: t.hesitationScore, consistency: t.typingConsistency });

        // Update JWT
        const token = sdkRef.current.generateSecureToken();
        setJwtPayload(JSON.stringify(token, null, 2));
    };

    // ── Input formatters ──
    const handleRecipientChange = (val: string) => setRecipient(val.replace(/\D/g, "").slice(0, 16));
    const formatRecipient = (raw: string) => raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    const handleAmountChange = (val: string) => setAmount(val.replace(/\D/g, ""));
    const formatAmount = (raw: string) => raw ? parseInt(raw, 10).toLocaleString("id-ID") : "";

    // ── Apply Preset ──
    const applyPreset = (preset: PresetScenario) => {
        if (!sdkRef.current) return;

        setActivePreset(preset.id);
        sdkRef.current.applyPreset(preset);

        // Auto fill form
        setRecipient(preset.id === "bot_attack" ? "9999888877" : preset.id === "social_engineering" ? "1234567890" : "8801234567");
        setAmount(preset.id === "bot_attack" ? "150000000" : preset.id === "social_engineering" ? "50000000" : "500000");
        setPin(preset.id === "bot_attack" ? "000000" : preset.id === "social_engineering" ? "123456" : "887766");

        setSimulateAnyDesk(preset.threats.remoteDesktop);
        setSimulateRoot(preset.threats.rooted);

        // Update telemetry display
        setTelemetryDisplay({
            avgDwell: preset.telemetry.avgDwellMs,
            avgFlight: preset.telemetry.avgFlightMs,
            hesitation: preset.telemetry.hesitationScore,
            consistency: preset.telemetry.typingConsistency,
        });

        // Update JWT
        const token = sdkRef.current.generateSecureToken();
        setJwtPayload(JSON.stringify(token, null, 2));

        addLog(`Preset "${preset.name}" selected. Form auto-populated.`, "info");
    };

    // ── Run Transfer Simulation ──
    const runTransferSimulation = async () => {
        if (!sdkRef.current) return;
        if (!recipient || !amount || pin.length < 4) {
            alert("Harap lengkapi semua kolom m-banking (Penerima, Nominal, dan PIN)!");
            return;
        }

        setIsProcessing(true);
        setMlResult(null);

        // Step 1: Token
        setPipelineStage("token");
        await new Promise(r => setTimeout(r, 700));

        // Step 2: Gateway
        setPipelineStage("inference");
        await new Promise(r => setTimeout(r, 800));

        // Step 3: ML inference
        setPipelineStage("meta");

        const preset = SDK_PRESETS.find(p => p.id === activePreset);
        const result = await sdkRef.current.evaluateTransaction(
            {
                senderAccount: "8888777766",
                receiverAccount: recipient,
                amountPaid: parseFloat(amount),
                senderBank: "Bank Rakyat Digital",
                receiverBank: "Bank Penerima",
            },
            preset || undefined
        );

        setMlResult(result);
        setPipelineStage("done");
        setIsProcessing(false);
    };

    // ── Reset ──
    const resetSDKSimulation = () => {
        setRecipient(""); setAmount(""); setPin("");
        setMlResult(null); setPipelineStage("idle");
        setActivePreset(null);
        setSimulateAnyDesk(false); setSimulateRoot(false);
        setTelemetryDisplay({ avgDwell: 0, avgFlight: 0, hesitation: 0, consistency: 0 });
        if (sdkRef.current) {
            sdkRef.current.setDeviceIntegrity({ remoteDesktopActive: false, rooted: false });
            sdkRef.current.startTelemetry();
        }
        addLog("SDK simulation reset. Awaiting new interaction.", "info");
    };

    // ── Copy snippet helper ──
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    // ── Telemetry bar helper ──
    const TelemetryBar = ({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) => (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-dark-500 uppercase tracking-widest">{label}</span>
                <span className="text-[10px] font-mono font-bold text-white">{value}{unit}</span>
            </div>
            <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
            </div>
        </div>
    );

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

            {/* ════════ Preset Scenario Selector ════════ */}
            <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neon-cyan" />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Preset Skenario Simulasi</h3>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 uppercase tracking-widest">
                        Pilih Profil Ancaman
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SDK_PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            disabled={isProcessing}
                            className={`group p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                                activePreset === preset.id
                                    ? "border-white/20 bg-white/5 ring-1 ring-white/10"
                                    : "border-white/5 bg-dark-950/40 hover:border-white/10 hover:bg-white/[0.03]"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{preset.icon}</span>
                                <span className="text-xs font-black text-white uppercase tracking-wider">{preset.name}</span>
                                {activePreset === preset.id && (
                                    <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white uppercase tracking-widest">Aktif</span>
                                )}
                            </div>
                            <p className="text-[10px] text-dark-400 leading-relaxed">{preset.description}</p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] font-mono">
                                <div className="text-dark-500">Dwell: <span className="text-white font-bold">{preset.telemetry.avgDwellMs}ms</span></div>
                                <div className="text-dark-500">Flight: <span className="text-white font-bold">{preset.telemetry.avgFlightMs}ms</span></div>
                                <div className="text-dark-500">Hesitasi: <span className="text-white font-bold">{preset.telemetry.hesitationScore}%</span></div>
                                <div className="text-dark-500">Konsistensi: <span className="text-white font-bold">{preset.telemetry.typingConsistency}%</span></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ════════ Grid Layout: Phone + Right Panel ════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* ── LEFT: Smartphone Mockup ── */}
                <div className="xl:col-span-5 flex flex-col items-center">

                    {/* Threat Toggle Panel */}
                    <div className="w-full max-w-[320px] mb-4 bg-dark-950/80 border border-white/5 rounded-2xl p-4 space-y-3">
                        <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Simulator Sinyal Bahaya (Manual)</div>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-dark-300 group-hover:text-white transition-colors">
                                Aktifkan AnyDesk (Screen Share)
                            </span>
                            <div className="relative">
                                <input type="checkbox" checked={simulateAnyDesk}
                                    onChange={e => { setSimulateAnyDesk(e.target.checked); setActivePreset(null); }}
                                    className="sr-only peer" />
                                <div className="w-9 h-5 bg-dark-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-500 peer-checked:after:bg-status-error after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-status-error/20 border border-white/5" />
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-dark-300 group-hover:text-white transition-colors">
                                Simulasikan Perangkat Rooted
                            </span>
                            <div className="relative">
                                <input type="checkbox" checked={simulateRoot}
                                    onChange={e => { setSimulateRoot(e.target.checked); setActivePreset(null); }}
                                    className="sr-only peer" />
                                <div className="w-9 h-5 bg-dark-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-500 peer-checked:after:bg-status-error after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-status-error/20 border border-white/5" />
                            </div>
                        </label>
                    </div>

                    {/* Smartphone Body */}
                    <div className="relative w-[320px] h-[640px] bg-[#0c0f1d] rounded-[3rem] border-4 border-dark-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
                        {/* Camera notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-dark-800 rounded-b-2xl z-50 flex items-center justify-center">
                            <span className="w-3 h-3 bg-black rounded-full" />
                        </div>

                        {/* M-Banking Header */}
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

                        {/* App Content */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar pt-4">
                            <div className="text-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Layanan Transfer Dana</h3>
                                <p className="text-[8px] text-dark-500 uppercase tracking-wider mt-0.5">Metode Instan Online</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">Rekening Tujuan</label>
                                    <input type="text" placeholder="cth: 1029 3847 56"
                                        value={formatRecipient(recipient)}
                                        onChange={e => handleRecipientChange(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full bg-dark-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">Nominal Transfer (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-dark-500">Rp</span>
                                        <input type="text" placeholder="150.000"
                                            value={formatAmount(amount)}
                                            onChange={e => handleAmountChange(e.target.value)}
                                            disabled={isProcessing}
                                            className="w-full bg-dark-950/60 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-dark-400 uppercase tracking-widest">PIN Transaksi (Biometrik Keyboard)</label>
                                    <input type="password" placeholder="••••••" maxLength={6}
                                        value={pin}
                                        onKeyDown={handleKeyDown}
                                        onKeyUp={handleKeyUp}
                                        onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                                        disabled={isProcessing}
                                        className="w-full bg-dark-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-center tracking-widest text-white placeholder-dark-600 focus:outline-none focus:border-neon-cyan/50" />
                                    <p className="text-[7px] text-dark-600 font-mono text-center">SDK merekam ritme ketikan Anda pada form ini.</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button onClick={runTransferSimulation} disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan hover:bg-neon-cyan/80 text-dark-950 text-[10px] font-black uppercase tracking-widest transition active:scale-95 disabled:opacity-40">
                                    <Send className="w-3.5 h-3.5" /> Transfer Sekarang
                                </button>
                            </div>

                            <div className="text-center">
                                <button onClick={resetSDKSimulation}
                                    className="text-[8px] font-bold text-dark-500 hover:text-white uppercase tracking-wider transition">
                                    Reset Form
                                </button>
                            </div>
                        </div>

                        {/* Home bar */}
                        <div className="h-10 bg-dark-950/40 flex items-center justify-center border-t border-white/5">
                            <div className="w-24 h-1.5 bg-dark-700 rounded-full" />
                        </div>
                    </div>

                    {/* ── Live Telemetry Bars (below phone) ── */}
                    <div className="w-full max-w-[320px] mt-4 bg-dark-950/80 border border-white/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-neon-cyan" />
                            <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Live Behavioral Telemetry</span>
                        </div>
                        <TelemetryBar label="Avg Dwell Time" value={telemetryDisplay.avgDwell} max={500} unit="ms" color="bg-neon-cyan" />
                        <TelemetryBar label="Avg Flight Time" value={telemetryDisplay.avgFlight} max={1000} unit="ms" color="bg-primary-blue" />
                        <TelemetryBar label="Hesitation Score" value={telemetryDisplay.hesitation} max={100} unit="%" color="bg-status-warning" />
                        <TelemetryBar label="Typing Consistency" value={telemetryDisplay.consistency} max={100} unit="%" color="bg-hyper-violet" />
                    </div>
                </div>

                {/* ── RIGHT: SDK Debugger Panel ── */}
                <div className="xl:col-span-7 space-y-6">

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 bg-dark-950/60 rounded-2xl p-1 border border-white/5">
                        {[
                            { id: "console" as RightTab, label: "Console", icon: <Terminal className="w-3.5 h-3.5" /> },
                            { id: "token" as RightTab, label: "Token Inspector", icon: <Code className="w-3.5 h-3.5" /> },
                            { id: "developer" as RightTab, label: "Integrasi Developer", icon: <BookOpen className="w-3.5 h-3.5" /> },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setRightTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                    rightTab === tab.id
                                        ? "bg-white/5 text-white border border-white/10"
                                        : "text-dark-500 hover:text-dark-300"
                                }`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ────── TAB: Console ────── */}
                    {rightTab === "console" && (
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

                            <div className="bg-[#040712] border border-white/5 rounded-2xl p-4 h-72 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <div className="text-dark-600 italic select-none pt-28 text-center uppercase tracking-widest">
                                        Menunggu interaksi perangkat...
                                    </div>
                                ) : (
                                    logs.map((log, idx) => (
                                        <div key={idx} className="flex items-start gap-2 leading-relaxed">
                                            <span className="text-dark-500 select-none shrink-0">{log.time}</span>
                                            <span className={
                                                log.type === "success" ? "text-status-success" :
                                                log.type === "warn" ? "text-status-warning" :
                                                log.type === "danger" ? "text-status-error font-bold" :
                                                "text-dark-300"
                                            }>
                                                {log.message}
                                            </span>
                                        </div>
                                    ))
                                )}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    )}

                    {/* ────── TAB: Token Inspector ────── */}
                    {rightTab === "token" && (
                        <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <div className="flex items-center gap-2">
                                    <Code className="w-4 h-4 text-neon-cyan" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">HTTP Request Header & Secure Token</h3>
                                </div>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-white/5 text-dark-400 border border-white/10 uppercase tracking-widest">
                                    JWT/JWS Inspector
                                </span>
                            </div>

                            <div className="bg-[#040712] border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-dark-300 space-y-3 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                                <div>
                                    <span className="text-hyper-violet font-bold">POST</span> <span className="text-white">http://api.bankrakyat.id/v1/transfer</span>
                                </div>
                                <div className="space-y-1 border-b border-white/5 pb-2.5">
                                    <div><span className="text-neon-cyan">Content-Type:</span> application/json</div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-neon-cyan">X-FraudGuard-Token:</span>
                                        <span className="text-status-success font-black truncate max-w-[280px]">
                                            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                        </span>
                                    </div>
                                </div>
                                <pre className="text-[9px] text-[#8ea6ff] pt-1 whitespace-pre-wrap">{jwtPayload}</pre>
                            </div>
                        </div>
                    )}

                    {/* ────── TAB: Developer Integration ────── */}
                    {rightTab === "developer" && (
                        <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-neon-cyan" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Panduan Integrasi Developer</h3>
                                </div>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-hyper-violet/10 text-hyper-violet border border-hyper-violet/20 uppercase tracking-widest">
                                    SDK v2.4.1
                                </span>
                            </div>

                            {/* Platform Tabs */}
                            <div className="flex items-center gap-1 bg-dark-950/60 rounded-xl p-1 border border-white/5">
                                {(Object.keys(SDK_CODE_SNIPPETS) as Array<keyof typeof SDK_CODE_SNIPPETS>).map(key => (
                                    <button key={key} onClick={() => setDevPlatform(key)}
                                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                            devPlatform === key
                                                ? "bg-white/5 text-white border border-white/10"
                                                : "text-dark-500 hover:text-dark-300"
                                        }`}>
                                        {SDK_CODE_SNIPPETS[key].label}
                                    </button>
                                ))}
                            </div>

                            {/* Install Snippet */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Instalasi</span>
                                    <button onClick={() => copyToClipboard(SDK_CODE_SNIPPETS[devPlatform].install, "install")}
                                        className="text-[8px] font-bold text-dark-500 hover:text-neon-cyan flex items-center gap-1 transition-colors uppercase tracking-widest">
                                        {copiedSnippet === "install" ? <><Check className="w-3 h-3" /> Disalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                                    </button>
                                </div>
                                <pre className="bg-[#040712] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-[#8ea6ff] overflow-x-auto custom-scrollbar whitespace-pre-wrap">
                                    {SDK_CODE_SNIPPETS[devPlatform].install}
                                </pre>
                            </div>

                            {/* Usage Snippet */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">Penggunaan</span>
                                    <button onClick={() => copyToClipboard(SDK_CODE_SNIPPETS[devPlatform].usage, "usage")}
                                        className="text-[8px] font-bold text-dark-500 hover:text-neon-cyan flex items-center gap-1 transition-colors uppercase tracking-widest">
                                        {copiedSnippet === "usage" ? <><Check className="w-3 h-3" /> Disalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                                    </button>
                                </div>
                                <pre className="bg-[#040712] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-[#8ea6ff] overflow-x-auto max-h-72 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                    {SDK_CODE_SNIPPETS[devPlatform].usage}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* ────── ML Decision Box ────── */}
                    {pipelineStage !== "idle" && (
                        <div className="glass-panel rounded-[2rem] p-6 space-y-4 animate-fade-in relative overflow-hidden">
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
                                                mlResult.isLive
                                                    ? "bg-status-success/10 text-status-success border border-status-success/20"
                                                    : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                            }`}>
                                                {mlResult.isLive ? "⚡ LIVE ML" : "🎭 DEMO MODE"}
                                            </span>
                                        </div>

                                        <div className={`rounded-2xl border p-5 flex flex-col items-center text-center space-y-2 ${
                                            mlResult.finalDecision === "BLOCKED"
                                                ? "border-status-error/30 bg-status-error/5 text-status-error"
                                                : "border-status-success/30 bg-status-success/5 text-status-success"
                                        }`}>
                                            <div className="flex items-center gap-2 text-2xl font-black uppercase tracking-wider">
                                                {mlResult.finalDecision === "BLOCKED" ? (
                                                    <><ShieldAlert className="w-6 h-6" /> DIBLOKIR</>
                                                ) : (
                                                    <><ShieldCheck className="w-6 h-6" /> APPROVED (AMAN)</>
                                                )}
                                            </div>
                                            {mlResult.finalDecision === "BLOCKED" && (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-status-error">
                                                    Ancaman: {mlResult.fraudType}
                                                </div>
                                            )}
                                            <div className="text-dark-400 font-mono text-[10px] tracking-wide mt-1">
                                                Skor Risiko Final: <span className="font-bold">{Math.round(mlResult.riskScore)}/100</span> | Threshold: {mlResult.thresholdUsed}
                                            </div>
                                        </div>

                                        <div className="bg-dark-950/40 rounded-xl p-4 border border-white/5 space-y-2.5">
                                            <div className="text-[8px] font-black text-dark-500 uppercase tracking-widest">Ensemble Decision Scores (Live ML Models)</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">XGBoost Binary:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.modelScores.xgboost)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">LightGBM Multiclass:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.modelScores.lightgbmFraudSum)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-dark-400">Graph Neural Network:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.modelScores.graphGnn)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className="text-neon-cyan font-bold">SDK Behavioral ML:</span>
                                                    <span className="text-neon-cyan font-bold">{Math.round(mlResult.modelScores.sdkBehavioral ?? 0)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono col-span-2 pt-1 border-t border-white/5">
                                                    <span className="text-dark-300 font-bold">Meta-Learner Stacker Final:</span>
                                                    <span className="text-white font-bold">{Math.round(mlResult.modelScores.ensembleFinal)}%</span>
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
