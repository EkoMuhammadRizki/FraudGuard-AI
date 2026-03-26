"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
    Wifi, ShieldX, ShieldCheck, Bot, Users, UserCheck,
    Zap, Activity, MapPin, Cpu, AlertTriangle, ArrowRight,
    Loader2, TerminalSquare, Send, RefreshCw, ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type Scenario = "normal" | "bot" | "syndicate";
type PipelineStage = "idle" | "capture" | "tensor" | "kafka" | "fds" | "done";

interface TelemetryData {
    dwellTimes: number[];
    flightTimes: number[];
    mousePoints: { x: number; y: number }[];
    hesitations: number;
    lastKeyTime: number;
    startTime: number;
}

// ─── Scenario Config ──────────────────────────────────────
const scenarioConfig = {
    normal: {
        label: "Aktivitas Manusia Normal",
        icon: <UserCheck className="w-5 h-5" />,
        color: "text-status-success",
        border: "border-status-success/40",
        bg: "bg-status-success/10",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
        riskScore: () => Math.floor(Math.random() * 20) + 5,
        verdict: "TERVERIFIKASI",
        verdictColor: "text-status-success",
        description: "Input manual manusia yang lambat dan natural",
    },
    bot: {
        label: "Otomatisasi Berbasis Bot",
        icon: <Bot className="w-5 h-5" />,
        color: "text-status-error",
        border: "border-status-error/40",
        bg: "bg-status-error/10",
        glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]",
        riskScore: () => Math.floor(Math.random() * 10) + 88,
        verdict: "DIBLOKIR",
        verdictColor: "text-status-error",
        description: "Input instan melalui script otomatis — tidak manusiawi",
    },
    syndicate: {
        label: "Sindikat / Pencucian Uang",
        icon: <Users className="w-5 h-5" />,
        color: "text-amber-400",
        border: "border-amber-400/40",
        bg: "bg-amber-400/10",
        glow: "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
        riskScore: () => Math.floor(Math.random() * 8) + 90,
        verdict: "DIBLOKIR",
        verdictColor: "text-status-error",
        description: "Perangkat / akun masuk daftar hitam jaringan penipuan",
    },
};

const PIPELINE_STEPS: { stage: PipelineStage; label: string; detail: string; duration: number }[] = [
    { stage: "capture", label: "Data Perilaku Ditangkap", detail: "108 sinyal mentah diekstrak dari sesi", duration: 600 },
    { stage: "tensor", label: "Feature Tensor Dibuat", detail: "Vector shape [1, 47] — Siap XGBoost", duration: 900 },
    { stage: "kafka", label: "Dikirim ke Pipeline Kafka", detail: "Topik: pending-tx | Partisi: 0 | Offset: 8821", duration: 1200 },
    { stage: "fds", label: "Mesin FDS Sedang Menganalisis", detail: "GNN + XGBoost inferensi paralel berjalan...", duration: 1800 },
    { stage: "done", label: "Vonis Dikeluarkan", detail: "", duration: 0 },
];

// ─── Component ────────────────────────────────────────────
export default function SimulasiPage() {
    const [scenario, setScenario] = useState<Scenario>("normal");
    const [form, setForm] = useState({ senderName: "", receiverName: "", account: "", amount: "", note: "" });
    const [telemetry, setTelemetry] = useState<TelemetryData>({
        dwellTimes: [], flightTimes: [], mousePoints: [],
        hesitations: 0, lastKeyTime: 0, startTime: 0,
    });
    const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle");
    const [riskScore, setRiskScore] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [completedSteps, setCompletedSteps] = useState<PipelineStage[]>([]);
    const [currentUserAgent, setCurrentUserAgent] = useState<string>("Detecting...");
    const [currentIp, setCurrentIp] = useState<string>("Detecting...");
    const formRef = useRef<HTMLDivElement>(null);
    const keyDownTime = useRef<number>(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentUserAgent(window.navigator.userAgent);
        }

        // Fetch user IP
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => setCurrentIp(data.ip))
            .catch(() => setCurrentIp("192.168.1.xxx (Mock)"));
    }, []);

    // Mouse Tracker
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setTelemetry(prev => ({
            ...prev,
            mousePoints: [...prev.mousePoints.slice(-20), { x: e.clientX, y: e.clientY }]
        }));
    }, []);

    // Key dwell tracking
    const handleKeyDown = useCallback(() => {
        keyDownTime.current = performance.now();
        const now = performance.now();
        setTelemetry(prev => {
            const timeSinceLast = prev.lastKeyTime ? now - prev.lastKeyTime : 0;
            const isHesitation = timeSinceLast > 800 && prev.lastKeyTime > 0;
            return {
                ...prev,
                startTime: prev.startTime || now,
                lastKeyTime: now,
                hesitations: prev.hesitations + (isHesitation ? 1 : 0),
            };
        });
    }, []);

    const handleKeyUp = useCallback(() => {
        const dwell = performance.now() - keyDownTime.current;
        setTelemetry(prev => {
            const flight = prev.lastKeyTime ? performance.now() - prev.lastKeyTime : 0;
            return {
                ...prev,
                dwellTimes: [...prev.dwellTimes.slice(-10), Math.round(dwell)],
                flightTimes: [...prev.flightTimes.slice(-10), Math.round(flight)],
            };
        });
    }, []);

    const handleFormChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Get computed telemetry values (override based on scenario)
    const computedTelemetry = (() => {
        if (scenario === "bot") {
            return {
                avgDwell: "8ms", avgFlight: "2ms",
                mousePath: "Linear (0.0% deviation)",
                hesitation: "0 events", confidence: "99.2%"
            };
        }
        if (scenario === "syndicate") {
            return {
                avgDwell: "142ms", avgFlight: "89ms",
                mousePath: "Natural (18.3% deviation)",
                hesitation: "2 events", confidence: "97.8%"
            };
        }
        const avgDwell = telemetry.dwellTimes.length
            ? Math.round(telemetry.dwellTimes.reduce((a, b) => a + b, 0) / telemetry.dwellTimes.length)
            : 0;
        const avgFlight = telemetry.flightTimes.length
            ? Math.round(telemetry.flightTimes.reduce((a, b) => a + b, 0) / telemetry.flightTimes.length)
            : 0;
        const pts = telemetry.mousePoints;
        const deviation = pts.length > 2
            ? Math.round(Math.random() * 30 + 15)
            : 0;
        return {
            avgDwell: avgDwell ? `${avgDwell}ms` : "—",
            avgFlight: avgFlight ? `${avgFlight}ms` : "—",
            mousePath: pts.length > 2 ? `Natural (${deviation}% deviation)` : "Awaiting input...",
            hesitation: `${telemetry.hesitations} events`,
            confidence: "—",
        };
    })();

    // Run pipeline
    const runPipeline = async () => {
        if (!form.account || !form.amount || !form.senderName || !form.receiverName) return;
        setCompletedSteps([]);
        setPipelineStage("capture");
        const score = scenarioConfig[scenario].riskScore();
        setRiskScore(score);

        for (const step of PIPELINE_STEPS) {
            if (step.stage === "done") {
                await new Promise(r => setTimeout(r, 400));
                setCompletedSteps(prev => [...prev, step.stage]);
                setPipelineStage("done");
                break;
            }
            setPipelineStage(step.stage);
            await new Promise(r => setTimeout(r, step.duration));
            setCompletedSteps(prev => [...prev, step.stage]);
        }
    };

    const resetSimulation = () => {
        setPipelineStage("idle");
        setRiskScore(null);
        setCompletedSteps([]);
        setForm({ senderName: "", receiverName: "", account: "", amount: "", note: "" });
        setTelemetry({ dwellTimes: [], flightTimes: [], mousePoints: [], hesitations: 0, lastKeyTime: 0, startTime: 0 });
    };

    const cfg = scenarioConfig[scenario];
    const isRunning = pipelineStage !== "idle" && pipelineStage !== "done";
    const isDone = pipelineStage === "done";

    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen" onMouseMove={handleMouseMove}>
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-hyper-violet/10 rounded-xl border border-hyper-violet/20">
                        <Activity className="w-5 h-5 text-hyper-violet" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
                            FraudGuard <span className="text-hyper-violet">Terminal Virtual</span>
                        </h1>
                        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em] mt-0.5">
                            Mesin Simulasi Deteksi Fraud Berbasis Perilaku
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* ── LEFT COLUMN ── */}
                <div className="flex flex-col gap-8">

                    {/* Section 1: Banking Interface */}
                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        {/* Bank Header */}
                        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-8 py-5 flex items-center justify-between border-b border-white/5">
                            <div>
                                <div className="text-[9px] font-black text-blue-300 tracking-[0.3em] uppercase mb-0.5">Perbankan Aman</div>
                                <div className="text-lg font-black text-white tracking-tight uppercase italic">
                                    Bank <span className="text-blue-300">Rakyat</span> Digital
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-status-success" />
                                <span className="text-[10px] font-black text-status-success tracking-widest uppercase">Terlindungi</span>
                            </div>
                        </div>

                        {/* Form */}
                        <div ref={formRef} className="p-6 md:p-8 space-y-5" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Nama Pengirim</label>
                                    <input
                                        type="text"
                                        placeholder="cth: Ahmad Rizki"
                                        value={form.senderName}
                                        onChange={e => handleFormChange("senderName", e.target.value)}
                                        disabled={isRunning || isDone}
                                        className="w-full bg-dark-950/80 border border-white/8 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:border-primary-blue/50 focus:bg-dark-950 transition disabled:opacity-40"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Nama Penerima</label>
                                    <input
                                        type="text"
                                        placeholder="cth: Maya S."
                                        value={form.receiverName}
                                        onChange={e => handleFormChange("receiverName", e.target.value)}
                                        disabled={isRunning || isDone}
                                        className="w-full bg-dark-950/80 border border-white/8 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:border-primary-blue/50 focus:bg-dark-950 transition disabled:opacity-40"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Rekening Tujuan</label>
                                <input
                                    type="text"
                                    placeholder="cth: 098-000-112-9931"
                                    value={form.account}
                                    onChange={e => handleFormChange("account", e.target.value)}
                                    disabled={isRunning || isDone}
                                    className="w-full bg-dark-950/80 border border-white/8 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:border-primary-blue/50 focus:bg-dark-950 transition disabled:opacity-40"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Nominal Transfer</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-dark-400">IDR</span>
                                    <input
                                        type="text"
                                        placeholder="25.000.000"
                                        value={form.amount}
                                        onChange={e => handleFormChange("amount", e.target.value)}
                                        disabled={isRunning || isDone}
                                        className="w-full bg-dark-950/80 border border-white/8 rounded-xl pl-14 pr-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:border-primary-blue/50 focus:bg-dark-950 transition disabled:opacity-40"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Catatan Transaksi</label>
                                <input
                                    type="text"
                                    placeholder="cth: Bayar Cicilan"
                                    value={form.note}
                                    onChange={e => handleFormChange("note", e.target.value)}
                                    disabled={isRunning || isDone}
                                    className="w-full bg-dark-950/80 border border-white/8 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:border-primary-blue/50 focus:bg-dark-950 transition disabled:opacity-40"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                {!isDone ? (
                                    <button
                                        onClick={runPipeline}
                                        disabled={isRunning || !form.account || !form.amount || !form.senderName || !form.receiverName}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary-blue text-white text-sm font-black uppercase tracking-widest transition-all hover:bg-primary-blue-hover active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isRunning ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Transfer Sekarang</>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={resetSimulation}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-dark-800 border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Reset Simulasi
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Scenario Injector */}
                    <div className="glass-panel rounded-[2rem] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-hyper-violet/10 rounded-xl border border-hyper-violet/20">
                                <Zap className="w-4 h-4 text-hyper-violet" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Injektor Skenario</h3>
                                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-tight">Pilih profil perilaku untuk diuji</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {(Object.keys(scenarioConfig) as Scenario[]).map(key => {
                                const s = scenarioConfig[key];
                                const isActive = scenario === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => !isRunning && !isDone && setScenario(key)}
                                        disabled={isRunning || isDone}
                                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed ${isActive
                                            ? `${s.bg} ${s.border} ${s.glow}`
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                        }`}
                                    >
                                        <div className={`shrink-0 ${isActive ? s.color : "text-dark-500"} transition-colors`}>
                                            {s.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-black uppercase tracking-wide ${isActive ? s.color : "text-dark-300"} transition-colors`}>{s.label}</div>
                                            <div className="text-[10px] text-dark-500 font-bold uppercase tracking-tight mt-0.5 truncate">{s.description}</div>
                                        </div>
                                        {isActive && <ChevronRight className={`w-4 h-4 shrink-0 ${s.color}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="flex flex-col gap-8">

                    {/* Section 3: Live Behavioral Telemetry */}
                    <div className="glass-panel rounded-[2rem] p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20">
                                    <TerminalSquare className="w-4 h-4 text-neon-cyan" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Feed Telemetri Langsung</h3>
                                    <p className="text-[10px] text-dark-500 font-bold uppercase tracking-tight">Tangkapan sinyal perilaku mentah</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                                <span className="text-[9px] font-black text-neon-cyan tracking-widest uppercase">Menangkap</span>
                            </div>
                        </div>

                        {/* Telemetry rows */}
                        <div className="bg-dark-950/60 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                            {[
                                { label: "Key Dwell Time (avg)", value: computedTelemetry.avgDwell, mono: true },
                                { label: "Flight Time (avg)", value: computedTelemetry.avgFlight, mono: true },
                                { label: "Mouse Path", value: computedTelemetry.mousePath, mono: false },
                                { label: "Hesitation Events", value: computedTelemetry.hesitation, mono: true },
                                { label: "User Agent", value: currentUserAgent, mono: true },
                                { label: "Alamat IP", value: currentIp, mono: true },
                                { label: "Lokasi Geografis", value: "LAT: -6.2088 | LONG: 106.8456", mono: true },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between px-5 py-3.5 group hover:bg-white/[0.02] transition-colors">
                                    <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{row.label}</span>
                                    <span className={`text-[11px] font-black text-right ${row.mono ? "font-mono text-neon-cyan" : "text-white"}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Mouse path visualizer */}
                        <div className="mt-5 bg-dark-950/60 rounded-2xl border border-white/5 p-4 h-28 relative overflow-hidden">
                            <div className="absolute top-2 left-3 text-[9px] font-black text-dark-600 uppercase tracking-widest">Jejak Jalur Mouse</div>
                            <svg className="w-full h-full" viewBox="0 0 400 80">
                                {telemetry.mousePoints.length > 1 && scenario === "normal" && (
                                    <polyline
                                        points={telemetry.mousePoints.map(p => `${(p.x / window.innerWidth) * 400},${(p.y / window.innerHeight) * 80}`).join(" ")}
                                        fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    />
                                )}
                                {scenario === "bot" && (
                                    <line x1="20" y1="40" x2="380" y2="40" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
                                )}
                                {scenario === "syndicate" && telemetry.mousePoints.length > 1 && (
                                    <polyline
                                        points={telemetry.mousePoints.map(p => `${(p.x / window.innerWidth) * 400},${(p.y / window.innerHeight) * 80}`).join(" ")}
                                        fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    />
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* Section 4: Pipeline Output */}
                    <div className="glass-panel rounded-[2rem] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary-blue/10 rounded-xl border border-primary-blue/20">
                                <Cpu className="w-4 h-4 text-primary-blue" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Output Pipeline</h3>
                                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-tight">Feature Tensor → Kafka → Hybrid FDS Engine</p>
                            </div>
                        </div>

                        {pipelineStage === "idle" ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
                                <Cpu className="w-10 h-10 text-dark-600" strokeWidth={1.5} />
                                <p className="text-[10px] font-black text-dark-600 uppercase tracking-widest">Menunggu sinyal transaksi...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {PIPELINE_STEPS.filter(s => s.stage !== "done").map(step => {
                                    const isCompleted = completedSteps.includes(step.stage);
                                    const isActive = pipelineStage === step.stage && !isCompleted;
                                    return (
                                        <div key={step.stage} className={`flex items-start gap-4 px-4 py-3.5 rounded-xl border transition-all ${isCompleted ? "border-status-success/20 bg-status-success/5" : isActive ? "border-primary-blue/30 bg-primary-blue/5" : "border-white/5 bg-dark-950/40 opacity-40"}`}>
                                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-black ${isCompleted ? "bg-status-success border-status-success text-white" : isActive ? "border-primary-blue" : "border-white/20"}`}>
                                                {isCompleted ? "✓" : isActive ? <Loader2 className="w-3 h-3 text-primary-blue animate-spin" /> : ""}
                                            </div>
                                            <div>
                                                <div className={`text-xs font-black uppercase tracking-wide ${isCompleted ? "text-status-success" : isActive ? "text-primary-blue" : "text-dark-500"}`}>{step.label}</div>
                                                <div className="text-[10px] text-dark-500 font-mono mt-0.5">{step.detail}</div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Vonis */}
                                {isDone && riskScore !== null && (
                                    <div className={`mt-4 rounded-2xl border p-6 text-center transition-all ${cfg.border} ${cfg.bg} ${cfg.glow}`}>
                                        <div className="text-[10px] font-black text-dark-400 uppercase tracking-[0.3em] mb-3">Vonis FDS</div>
                                        <div className="flex items-center justify-center gap-3 mb-3">
                                            {cfg.verdict === "DIBLOKIR"
                                                ? <ShieldX className="w-10 h-10 text-status-error" strokeWidth={2} />
                                                : <ShieldCheck className="w-10 h-10 text-status-success" strokeWidth={2} />
                                            }
                                            <div className={`text-4xl font-black uppercase tracking-tight ${cfg.verdictColor}`}>{cfg.verdict}</div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <AlertTriangle className="w-3.5 h-3.5 text-dark-500" />
                                            <span className="text-[11px] text-dark-400 font-black uppercase tracking-widest">Skor Risiko: <span className={cfg.verdictColor}>{riskScore}/100</span></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
