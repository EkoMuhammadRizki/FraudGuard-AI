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

            {/* ════════ TOP: Console & Developer Integration Section ════════ */}
            <div className="space-y-4">
                {/* Tab Switcher */}
                <div className="flex items-center gap-1 bg-dark-950/60 rounded-2xl p-1 border border-white/5">
                    {[
                        { id: "console" as RightTab, label: "Console Execution", icon: <Terminal className="w-3.5 h-3.5" /> },
                        { id: "token" as RightTab, label: "Token Inspector", icon: <Code className="w-3.5 h-3.5" /> },
                        { id: "developer" as RightTab, label: "Integrasi Developer Mobile", icon: <BookOpen className="w-3.5 h-3.5" /> },
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

                {/* Tab Content 1: Console Logs & Inference Stage */}
                {rightTab === "console" && (
                    <div className="space-y-4">
                        {/* Real-time Pipeline Pipeline Stage Visualizer */}
                        {isProcessing && (
                            <div className="glass-panel p-4 rounded-2xl border-neon-cyan/20 bg-neon-cyan/5 animate-pulse">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-neon-cyan animate-spin" />
                                        <span className="text-xs font-black text-white uppercase tracking-wider">
                                            Proses Evaluasi SDK & Inference FDS Server...
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-neon-cyan uppercase">
                                        Tahap: {pipelineStage}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { key: "token", label: "1. Token Gen" },
                                        { key: "inference", label: "2. Telemetry ML" },
                                        { key: "meta", label: "3. Ensemble FDS" },
                                        { key: "done", label: "4. Keputusan" },
                                    ].map(stg => (
                                        <div key={stg.key} className={`p-2 rounded-xl text-center text-[8px] font-mono font-bold border ${
                                            pipelineStage === stg.key || (stg.key === "done" && pipelineStage === "done")
                                                ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                                                : "bg-dark-950/40 border-white/5 text-dark-500"
                                        }`}>
                                            {stg.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ML Evaluation Result Alert Box */}
                        {mlResult && (
                            <div className={`glass-panel p-5 rounded-2xl border ${
                                mlResult.blockTransaction ? "border-status-error/40 bg-status-error/5" : "border-status-success/40 bg-status-success/5"
                            }`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                            mlResult.blockTransaction ? "bg-status-error/20 border-status-error/40 text-status-error" : "bg-status-success/20 border-status-success/40 text-status-success"
                                        }`}>
                                            {mlResult.blockTransaction ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-black uppercase tracking-wider ${
                                                    mlResult.blockTransaction ? "text-status-error" : "text-status-success"
                                                }`}>
                                                    {mlResult.recommendation}
                                                </span>
                                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                                                    Score: {(mlResult.riskScore * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-dark-300 mt-1 leading-relaxed">{mlResult.reasoning}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Console Log Terminal Window */}
                        <div className="glass-panel rounded-2xl p-4 bg-dark-950/80 border-white/5 space-y-2">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5 text-neon-cyan" />
                                    <span className="text-[9px] font-black text-dark-400 uppercase tracking-wider">Log Eksekusi Real-Time Client SDK</span>
                                </div>
                                <button onClick={() => setLogs([])} className="text-[8px] font-bold text-dark-500 hover:text-white uppercase tracking-wider transition">Clear Log</button>
                            </div>
                            <div className="h-44 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar pr-2">
                                {logs.map((lg, i) => (
                                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                                        <span className="text-dark-600 shrink-0">[{lg.time}]</span>
                                        <span className={`shrink-0 font-bold ${
                                            lg.type === "error" ? "text-status-error" :
                                            lg.type === "warning" ? "text-amber-warning" :
                                            lg.type === "success" ? "text-status-success" :
                                            "text-neon-cyan"
                                        }`}>[{lg.type.toUpperCase()}]</span>
                                        <span className="text-dark-200">{lg.message}</span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content 2: Token Inspector */}
                {rightTab === "token" && (
                    <div className="glass-panel rounded-2xl p-4 bg-dark-950/80 border-white/5 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <Code className="w-3.5 h-3.5 text-hyper-violet" />
                                <span className="text-[9px] font-black text-dark-400 uppercase tracking-wider">Payload Token Kriptografi JWT SDK</span>
                            </div>
                            <button onClick={() => copyToClipboard(jwtPayload, "token")} className="flex items-center gap-1 text-[8px] font-bold text-neon-cyan hover:underline uppercase tracking-wider">
                                {copiedSnippet === "token" ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                                {copiedSnippet === "token" ? "Tersalin!" : "Salin JSON"}
                            </button>
                        </div>
                        <pre className="h-64 overflow-y-auto font-mono text-[10px] text-neon-cyan/90 bg-dark-950 p-3 rounded-xl border border-white/5 custom-scrollbar leading-relaxed">
                            {jwtPayload}
                        </pre>
                    </div>
                )}

                {/* Tab Content 3: Integrasi Developer */}
                {rightTab === "developer" && (
                    <div className="glass-panel rounded-2xl p-4 bg-dark-950/80 border-white/5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-primary-blue" />
                                <span className="text-[9px] font-black text-dark-400 uppercase tracking-wider">Kode Integrasi Mobile SDK</span>
                            </div>
                            <div className="flex items-center gap-1 bg-dark-900 rounded-lg p-0.5 border border-white/5">
                                {(["android", "ios", "reactNative", "flutter"] as const).map(plat => (
                                    <button key={plat} onClick={() => setDevPlatform(plat)}
                                        className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase transition ${
                                            devPlatform === plat ? "bg-primary-blue text-white" : "text-dark-500 hover:text-white"
                                        }`}>
                                        {plat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <pre className="h-56 overflow-y-auto font-mono text-[10px] text-white/90 bg-dark-950 p-3 rounded-xl border border-white/5 custom-scrollbar leading-relaxed">
                                {SDK_CODE_SNIPPETS[devPlatform]}
                            </pre>
                            <button onClick={() => copyToClipboard(SDK_CODE_SNIPPETS[devPlatform], devPlatform)}
                                className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white uppercase transition">
                                {copiedSnippet === devPlatform ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                                {copiedSnippet === devPlatform ? "Tersalin!" : "Salin Kode"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ════════ Bottom Grid Layout: Smartphone Simulator (Left) + Preset Scenarios & Telemetry (Right) ════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* ── LEFT: Smartphone Mockup + Threat Manual Toggle ── */}
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
                                        onKeyDown={handleKeyDown}
                                        onKeyUp={handleKeyUp}
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
                                            onKeyDown={handleKeyDown}
                                            onKeyUp={handleKeyUp}
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
                                    <p className="text-[7px] text-dark-600 font-mono text-center">SDK merekam ritme ketikan Anda pada seluruh form ini secara live.</p>
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
                </div>

                {/* ── RIGHT: Preset Scenario + Live Telemetry ── */}
                <div className="xl:col-span-7 space-y-6">

                    {/* Preset Skenario Simulasi Section */}
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

                    {/* Live Telemetry Display */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-neon-cyan" />
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">Live Behavioral Telemetry (Biometrik Ketikan)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <TelemetryBar label="Avg Dwell Time (Lama Ketik Key)" value={telemetryDisplay.avgDwell} max={500} unit="ms" color="bg-neon-cyan" />
                            <TelemetryBar label="Avg Flight Time (Jeda Antar Key)" value={telemetryDisplay.avgFlight} max={1000} unit="ms" color="bg-primary-blue" />
                            <TelemetryBar label="Hesitation Score (Keraguan Nasabah)" value={telemetryDisplay.hesitation} max={100} unit="%" color="bg-status-warning" />
                            <TelemetryBar label="Typing Consistency (Konsistensi Ritme)" value={telemetryDisplay.consistency} max={100} unit="%" color="bg-hyper-violet" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
