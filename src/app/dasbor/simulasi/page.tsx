"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
    Wifi, ShieldX, ShieldCheck, Bot, Users, UserCheck,
    Zap, Activity, MapPin, Cpu, AlertTriangle, ArrowRight,
    Loader2, TerminalSquare, Send, RefreshCw, ChevronRight
} from "lucide-react";
import ModelStatusBadge from "@/komponen/ui/model-status-badge";

// ─── Types ────────────────────────────────────────────────
type Scenario = "normal" | "bot" | "syndicate";
type PipelineStage = "idle" | "capture" | "tensor" | "kafka" | "fds" | "done";

/** Hasil prediksi dari Python ML API */
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
    /** true = hasil dari ML nyata, false = fallback demo mode */
    is_live: boolean;
}

interface TelemetryData {
    dwellTimes: number[];
    flightTimes: number[];
    mousePoints: { x: number; y: number }[];
    hesitations: number;
    lastKeyDownTime: number;  // waktu keydown terakhir (untuk flight)
    lastKeyUpTime: number;    // waktu keyup terakhir (untuk flight antar-key)
    startTime: number;
}

interface FormData {
    senderName: string;
    receiverName: string;
    account: string;
    amount: string;
    note: string;
}

interface FormErrors {
    account?: string;
    amount?: string;
}

// ─── Scenario Config ──────────────────────────────────────
const scenarioConfig = {
    normal: {
        label: "Aktivitas Manusia Normal",
        icon: <UserCheck className="w-5 h-5" />,
        color: "text-status-success",
        border: "border-status-success/30",
        bg: "bg-status-success/5",
        glow: "shadow-sm",
        riskScore: () => Math.floor(Math.random() * 20) + 5,
        verdict: "TERVERIFIKASI",
        verdictColor: "text-status-success",
        description: "Input manual manusia yang lambat dan natural",
    },
    bot: {
        label: "Otomatisasi Berbasis Bot",
        icon: <Bot className="w-5 h-5" />,
        color: "text-status-error",
        border: "border-status-error/30",
        bg: "bg-status-error/5",
        glow: "shadow-sm",
        riskScore: () => Math.floor(Math.random() * 10) + 88,
        verdict: "DIBLOKIR",
        verdictColor: "text-status-error",
        description: "Input instan melalui script otomatis — tidak manusiawi",
    },
    syndicate: {
        label: "Sindikat / Pencucian Uang",
        icon: <Users className="w-5 h-5" />,
        color: "text-amber-400",
        border: "border-amber-400/30",
        bg: "bg-amber-400/5",
        glow: "shadow-sm",
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

// ─── Helpers ──────────────────────────────────────────────

/** Hitung deviasi rata-rata jalur mouse dari garis lurus (Hausdorff-lite) */
function computeMouseDeviation(points: { x: number; y: number }[]): number {
    if (points.length < 3) return 0;
    const start = points[0];
    const end = points[points.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return 0;

    // Jarak rata-rata setiap titik dari garis lurus start→end
    const totalDist = points.slice(1, -1).reduce((sum, p) => {
        const dist = Math.abs(dy * p.x - dx * p.y + end.x * start.y - end.y * start.x) / len;
        return sum + dist;
    }, 0);
    const avgDist = totalDist / (points.length - 2);
    // Normalkan terhadap panjang lintasan (persen)
    return Math.min(Math.round((avgDist / (len || 1)) * 100), 99);
}

/**
 * Rekening: murni angka/digit (0-9) sesuai standar perbankan nasional
 * Validasi: min 8 digit, max 16 digit
 */
function validateAccountDigits(digits: string): string | undefined {
    if (!digits) return undefined;
    if (digits.length < 8) return `Nomor rekening kurang — minimal 8 digit (${digits.length}/16)`;
    return undefined;
}

/** Format digit rekening dengan spasi tiap 4 digit untuk keterbacaan */
function formatAccountDisplay(digits: string): string {
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** Format angka ke Rupiah real-time (titik sebagai pemisah ribuan) */
function formatRupiah(raw: string): string {
    if (!raw) return "";
    const num = parseInt(raw, 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID");
}

/** Validasi nominal (dari raw digit) */
function validateAmountRaw(raw: string): string | undefined {
    if (!raw) return undefined;
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 10000) return "Nominal minimal Rp 10.000";
    if (num > 1_000_000_000_000) return "Nominal melebihi batas transfer harian";
    return undefined;
}

/** Parse raw User Agent string to a clean browser name + OS */
function getCleanUserAgent(ua: string): string {
    const lowercase = ua.toLowerCase();
    let os = "Unknown OS";
    if (lowercase.includes("windows")) os = "Windows";
    else if (lowercase.includes("macintosh") || lowercase.includes("mac os")) os = "macOS";
    else if (lowercase.includes("linux")) os = "Linux";
    else if (lowercase.includes("android")) os = "Android";
    else if (lowercase.includes("iphone") || lowercase.includes("ipad")) os = "iOS";

    let browser = "Unknown Browser";
    if (lowercase.includes("edg/")) browser = "Microsoft Edge";
    else if (lowercase.includes("opr/") || lowercase.includes("opera")) browser = "Opera";
    else if (lowercase.includes("chrome")) browser = "Chrome";
    else if (lowercase.includes("firefox")) browser = "Firefox";
    else if (lowercase.includes("safari")) browser = "Safari";

    return `${browser} (${os})`;
}

// ─── Component ────────────────────────────────────────────
export default function SimulasiPage() {
    const [scenario, setScenario] = useState<Scenario>("normal");
    const [form, setForm] = useState<FormData>({ senderName: "", receiverName: "", account: "", amount: "", note: "" });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    // Raw state untuk field khusus
    const [accountDigits, setAccountDigits] = useState<string>("");  // digit murni tanpa spasi
    const [amountRaw, setAmountRaw] = useState<string>("");           // angka murni tanpa titik
    const [amountDisplay, setAmountDisplay] = useState<string>("");   // tampilan terformat
    const [telemetry, setTelemetry] = useState<TelemetryData>({
        dwellTimes: [], flightTimes: [], mousePoints: [],
        hesitations: 0, lastKeyDownTime: 0, lastKeyUpTime: 0, startTime: 0,
    });
    const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle");
    const [riskScore, setRiskScore] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [completedSteps, setCompletedSteps] = useState<PipelineStage[]>([]);
    const [currentUserAgent, setCurrentUserAgent] = useState<string>("Detecting...");
    const [currentIp, setCurrentIp] = useState<string>("Detecting...");
    const [geoLocation, setGeoLocation] = useState<string>("Detecting...");
    const [viewportSize, setViewportSize] = useState({ w: 1280, h: 720 }); // default SSR-safe

    // ── ML Result State ──
    const [mlResult, setMlResult] = useState<MLResult | null>(null);

    // Refs untuk tracking tanpa re-render
    const keyDownTimeRef = useRef<number>(0);
    const lastKeyUpTimeRef = useRef<number>(0);

    // ── Side Effects ──
    useEffect(() => {
        // Aman diakses hanya di client
        if (typeof window !== "undefined") {
            const ua = window.navigator.userAgent;
            setCurrentUserAgent(getCleanUserAgent(ua));
        }
        setViewportSize({ w: window.innerWidth, h: window.innerHeight });

        const handleResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", handleResize);

        // Fetch IP & Geolocation asli dari ipapi.co
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data.ip) setCurrentIp(data.ip);
                if (data.latitude && data.longitude) {
                    setGeoLocation(`LAT: ${data.latitude.toFixed(4)} | LONG: ${data.longitude.toFixed(4)} (${data.city || 'Unknown'}, ${data.region_code || ''})`);
                } else {
                    setGeoLocation("LAT: -6.2088 | LONG: 106.8456 (Jakarta, Fallback)");
                }
            })
            .catch(() => {
                // Fallback jika ipapi.co diblokir adblocker
                fetch("https://api.ipify.org?format=json")
                    .then(res => res.json())
                    .then(data => {
                        setCurrentIp(data.ip);
                    })
                    .catch(() => setCurrentIp("192.168.1.xxx (Mock)"));
                setGeoLocation("LAT: -6.2088 | LONG: 106.8456 (Jakarta, Fallback)");
            });

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ── Event Handlers ──

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setTelemetry(prev => ({
            ...prev,
            mousePoints: [...prev.mousePoints.slice(-30), { x: e.clientX, y: e.clientY }],
        }));
    }, []);

    /**
     * handleKeyDown:
     * - Catat waktu tombol ditekan (untuk dwell time)
     * - Catat hesitation: jika sejak keyup terakhir > 800ms (user berhenti mengetik)
     */
    const handleKeyDown = useCallback(() => {
        const now = performance.now();
        keyDownTimeRef.current = now;

        setTelemetry(prev => {
            const timeSinceLastKeyUp = lastKeyUpTimeRef.current > 0 ? now - lastKeyUpTimeRef.current : 0;
            const isHesitation = timeSinceLastKeyUp > 800 && lastKeyUpTimeRef.current > 0;
            return {
                ...prev,
                startTime: prev.startTime || now,
                hesitations: prev.hesitations + (isHesitation ? 1 : 0),
            };
        });
    }, []);

    /**
     * handleKeyUp:
     * - Dwell time = selisih antara keyup dan keydown untuk tombol yang sama
     * - Flight time = selisih antara keyup saat ini dan keyup sebelumnya
     *   (waktu antar-pelepasan tombol — lebih konsisten daripada keydown→keydown)
     */
    const handleKeyUp = useCallback(() => {
        const now = performance.now();
        const dwell = now - keyDownTimeRef.current;
        const flight = lastKeyUpTimeRef.current > 0 ? now - lastKeyUpTimeRef.current : 0;
        lastKeyUpTimeRef.current = now;

        setTelemetry(prev => ({
            ...prev,
            dwellTimes: [...prev.dwellTimes.slice(-15), Math.round(dwell)],
            flightTimes: flight > 0 ? [...prev.flightTimes.slice(-15), Math.round(flight)] : prev.flightTimes,
        }));
    }, []);

    const handleFormChange = (field: keyof FormData, value: string) => {
        let cleanedValue = value;
        if (field === "senderName" || field === "receiverName") {
            // Hanya izinkan huruf, spasi, titik, koma, tanda hubung, dan kutip tunggal
            cleanedValue = value.replace(/[^a-zA-Z\s.,'-]/g, "");
        }
        setForm(prev => ({ ...prev, [field]: cleanedValue }));
    };

    /** Handler khusus field rekening — murni digit angka (0-9), max 16 */
    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
        setAccountDigits(digits);
        setForm(prev => ({ ...prev, account: digits }));   // simpan digit murni ke form
        setFormErrors(prev => ({ ...prev, account: validateAccountDigits(digits) }));
    };

    /** Handler khusus field nominal — hanya terima digit, format Rupiah real-time */
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");    // strip semua non-digit
        setAmountRaw(raw);
        setAmountDisplay(formatRupiah(raw));
        setForm(prev => ({ ...prev, amount: raw }));       // simpan raw ke form
        setFormErrors(prev => ({ ...prev, amount: validateAmountRaw(raw) }));
    };

    // ── Computed Telemetry (real-time user telemetry) ──
    const computedTelemetry = (() => {
        const avgDwell = telemetry.dwellTimes.length
            ? Math.round(telemetry.dwellTimes.reduce((a, b) => a + b, 0) / telemetry.dwellTimes.length)
            : 0;
        const avgFlight = telemetry.flightTimes.length
            ? Math.round(telemetry.flightTimes.reduce((a, b) => a + b, 0) / telemetry.flightTimes.length)
            : 0;

        // Deviasi mouse dihitung secara geometris (bukan random)
        const deviation = computeMouseDeviation(telemetry.mousePoints);

        return {
            avgDwell: avgDwell ? `${avgDwell}ms` : "—",
            avgFlight: avgFlight ? `${avgFlight}ms` : "—",
            mousePath: telemetry.mousePoints.length > 2
                ? `Natural (${deviation}% deviation)`
                : "Awaiting input...",
            hesitation: `${telemetry.hesitations} events`,
            confidence: "—",
            deviation,
        };
    })();

    // ── Pipeline Runner ──
    const runPipeline = async () => {
        const hasErrors = Object.values(formErrors).some(Boolean);
        if (hasErrors) return;
        if (!form.account || !form.amount || !form.senderName || !form.receiverName) return;

        setCompletedSteps([]);
        setMlResult(null);
        setPipelineStage("capture");

        // ── Jalankan animasi pipeline step-by-step ──
        for (const step of PIPELINE_STEPS) {
            if (step.stage === "done") break;
            setPipelineStage(step.stage);
            await new Promise(r => setTimeout(r, step.duration));
            setCompletedSteps(prev => [...prev, step.stage]);
        }

        // ── Panggil ML API (berjalan paralel saat animasi selesai) ──
        let finalResult: MLResult;
        try {
            // Tentukan payment_format & bank berdasarkan skenario
            const paymentMap: Record<Scenario, string> = {
                normal: "Wire",
                bot: "ACH",
                syndicate: "SWIFT",
            };
            const bankMap: Record<Scenario, string> = {
                normal: "BCA",
                bot: "Mandiri",
                syndicate: "HSBC",
            };
            // Sinyal jaringan yang lebih kuat untuk skenario bot/syndicate
            const graphSignals: Record<Scenario, { sender_degree: number; receiver_indegree: number; fan_out_ratio: number; fan_in_ratio: number; time_since_last_tx: number }> = {
                normal:    { sender_degree: 5,  receiver_indegree: 3,  fan_out_ratio: 0.15, fan_in_ratio: 0.10, time_since_last_tx: 3600 },
                bot:       { sender_degree: 1,  receiver_indegree: 2,  fan_out_ratio: 0.05, fan_in_ratio: 0.08, time_since_last_tx: 2   },
                syndicate: { sender_degree: 45, receiver_indegree: 60, fan_out_ratio: 0.85, fan_in_ratio: 0.90, time_since_last_tx: 120 },
            };

            const payload = {
                timestamp: new Date().toISOString(),
                sender_account: form.account,
                receiver_account: form.account.split("").reverse().join(""),
                amount_paid: parseFloat(form.amount),
                amount_received: parseFloat(form.amount) * (scenario === "syndicate" ? 0.97 : 1.0),
                payment_format: paymentMap[scenario],
                currency: "IDR",
                sender_bank: bankMap[scenario],
                receiver_bank: scenario === "syndicate" ? "Deutsche Bank" : bankMap[scenario],
                sender_account_age_days: scenario === "bot" ? 3 : scenario === "syndicate" ? 45 : 730,
                is_new_receiver_for_sender: scenario === "normal" ? 0 : 1,
                daily_tx_count: scenario === "bot" ? 98 : scenario === "syndicate" ? 25 : 2,
                ...graphSignals[scenario],
            };

            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok && res.status === 503) {
                throw new Error("ml_offline");
            }

            const data = await res.json();

            if (data.error === "ml_offline") throw new Error("ml_offline");

            finalResult = { ...data, is_live: true };
        } catch {
            // ── Fallback: Demo Mode (Python API offline) ──
            const score = scenarioConfig[scenario].riskScore();
            finalResult = {
                transaction_id: "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
                final_decision: scenario === "normal" ? "APPROVED" : "BLOCKED",
                is_fraud: scenario !== "normal",
                risk_score: score,
                threshold_used: 33.7,
                fraud_type: scenario === "syndicate" ? "Money Mule" : scenario === "bot" ? "Account Takeover" : "Legitimate",
                model_scores: {
                    xgboost: score * 0.9 + Math.random() * 5,
                    lightgbm_max: score * 0.85 + Math.random() * 5,
                    lightgbm_fraud_sum: score * 0.88 + Math.random() * 5,
                    graph_gnn: score * 0.82 + Math.random() * 5,
                    ensemble_final: score,
                },
                processing_time_ms: 0,
                is_live: false,
            };
        }

        setMlResult(finalResult);
        setRiskScore(Math.round(finalResult.risk_score));
        await new Promise(r => setTimeout(r, 400));
        setCompletedSteps(prev => [...prev, "done"]);
        setPipelineStage("done");
    };

    const resetSimulation = () => {
        setPipelineStage("idle");
        setRiskScore(null);
        setMlResult(null);
        setCompletedSteps([]);
        setForm({ senderName: "", receiverName: "", account: "", amount: "", note: "" });
        setFormErrors({});
        setAccountDigits("");
        setAmountRaw("");
        setAmountDisplay("");
        lastKeyUpTimeRef.current = 0;
        setTelemetry({
            dwellTimes: [], flightTimes: [], mousePoints: [],
            hesitations: 0, lastKeyDownTime: 0, lastKeyUpTime: 0, startTime: 0,
        });
    };

    const cfg = scenarioConfig[scenario];
    const isRunning = pipelineStage !== "idle" && pipelineStage !== "done";
    const isDone = pipelineStage === "done";
    const canSubmit =
        !isRunning &&
        !isDone &&
        !!form.senderName &&
        !!form.receiverName &&
        !!form.account &&
        !!form.amount &&
        !formErrors.account &&
        !formErrors.amount;

    return (
        <div className="p-4 sm:p-6 md:p-10 space-y-8 min-h-screen" onMouseMove={handleMouseMove}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-hyper-violet/10 rounded-xl border border-hyper-violet/20">
                        <Activity className="w-5 h-5 text-hyper-violet" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
                            Amankan Fraud <span className="text-hyper-violet">Terminal Virtual</span>
                        </h1>
                        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em] mt-0.5">
                            Mesin Simulasi Deteksi Fraud Berbasis Perilaku
                        </p>
                    </div>
                </div>
                {/* ML Engine Status */}
                <div className="flex-shrink-0">
                    <ModelStatusBadge showDetails pollInterval={30000} />
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
                        <div className="p-6 md:p-8 space-y-5" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
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

                            {/* ── Rekening Tujuan ── */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Rekening Tujuan</label>
                                    {/* Digit counter */}
                                    <span className={`text-[10px] font-black font-mono tabular-nums ${
                                        accountDigits.length === 0 ? "text-dark-600"
                                        : accountDigits.length < 8 ? "text-amber-400"
                                        : "text-status-success"
                                    }`}>
                                        {accountDigits.length}/16
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Contoh: 8185 8360 12 atau 1029 3847 56"
                                        value={formatAccountDisplay(accountDigits)}
                                        onChange={handleAccountChange}
                                        disabled={isRunning || isDone}
                                        maxLength={19} /* 16 digit + 3 spasi */
                                        className={`w-full bg-dark-950/80 border rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:bg-dark-950 transition disabled:opacity-40 ${
                                            formErrors.account
                                                ? "border-status-error/60 focus:border-status-error"
                                                : accountDigits.length >= 8
                                                ? "border-status-success/40 focus:border-status-success/60"
                                                : "border-white/8 focus:border-primary-blue/50"
                                        }`}
                                    />
                                </div>
                                {/* Helper text / error */}
                                {formErrors.account ? (
                                    <p className="text-[10px] text-status-error font-bold uppercase tracking-wide flex items-center gap-1">
                                        <span>⚠</span> {formErrors.account}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-dark-600 font-medium">
                                        Masukkan 10–16 digit nomor rekening bank tujuan
                                    </p>
                                )}
                            </div>

                            {/* ── Nominal Transfer ── */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Nominal Transfer</label>
                                    {/* Preview terbilang singkat */}
                                    {amountRaw && !formErrors.amount && (
                                        <span className="text-[10px] font-black text-status-success font-mono">
                                            Rp {formatRupiah(amountRaw)}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-dark-400 pointer-events-none select-none">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="25.000.000"
                                        value={amountDisplay}
                                        onChange={handleAmountChange}
                                        disabled={isRunning || isDone}
                                        className={`w-full bg-dark-950/80 border rounded-xl pl-12 pr-4 py-3.5 text-sm font-mono text-white placeholder-dark-600 focus:outline-none focus:bg-dark-950 transition disabled:opacity-40 ${
                                            formErrors.amount
                                                ? "border-status-error/60 focus:border-status-error"
                                                : amountRaw && parseInt(amountRaw) >= 10000
                                                ? "border-status-success/40 focus:border-status-success/60"
                                                : "border-white/8 focus:border-primary-blue/50"
                                        }`}
                                    />
                                </div>
                                {/* Helper / error */}
                                {formErrors.amount ? (
                                    <p className="text-[10px] text-status-error font-bold uppercase tracking-wide flex items-center gap-1">
                                        <span>⚠</span> {formErrors.amount}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-dark-600 font-medium">
                                        Batas transfer: Rp 10.000 – Rp 1.000.000.000.000
                                    </p>
                                )}
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
                                        disabled={!canSubmit}
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
                        <div className="bg-dark-950/60 rounded-2xl border border-white/5 divide-y divide-white/5 relative">
                            {[
                                { label: "Key Dwell Time (avg)", value: computedTelemetry.avgDwell, mono: true, desc: "Rata-rata durasi penekanan satu tombol keyboard (dari keydown ke keyup). Bot biasanya mengetik sangat cepat dengan dwell time seragam (<15ms), sedangkan manusia bervariasi (50-150ms)." },
                                { label: "Flight Time (avg)", value: computedTelemetry.avgFlight, mono: true, desc: "Rata-rata waktu jeda perpindahan antar tombol keyboard. Pola transisi penulisan yang terlalu konsisten atau terlalu cepat mengindikasikan otomatisasi skrip (bot)." },
                                { label: "Mouse Path", value: computedTelemetry.mousePath, mono: false, desc: "Analisis kelengkungan dan deviasi jalur gerakan kursor mouse. Manusia bergerak dengan kurva natural bergetar (deviasi tinggi), sedangkan bot bergerak lurus kaku atau instan (deviasi 0%)." },
                                { label: "Hesitation Events", value: computedTelemetry.hesitation, mono: true, desc: "Jumlah kejadian ketika user berhenti mengetik sejenak (>800ms) untuk berpikir. Manusia sering ragu-ragu saat mengisi data sensitif, sementara bot tidak pernah menunjukkan keraguan." },
                                { label: "User Agent", value: currentUserAgent, mono: true, desc: "Identitas browser, sistem operasi, dan mesin rendering perangkat yang digunakan untuk mengakses platform ini." },
                                { label: "Alamat IP", value: currentIp, mono: true, desc: "Alamat protokol internet publik dari koneksi internet perangkat Anda. Digunakan oleh mesin fraud untuk memeriksa reputasi jaringan & lokasi proxy." },
                                { label: "Lokasi Geografis", value: geoLocation, mono: true, desc: "Estimasi koordinat garis lintang (latitude) dan garis bujur (longitude) serta nama kota/wilayah Anda berdasarkan lookup IP publik." },
                            ].map((row, idx, arr) => (
                                <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 group/row hover:bg-white/[0.02] transition-colors relative ${
                                    idx === 0 ? "rounded-t-2xl" : idx === arr.length - 1 ? "rounded-b-2xl" : ""
                                }`}>
                                    <div className="flex items-center gap-1.5 relative group/tooltip">
                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest cursor-help border-b border-dashed border-dark-600/40 pb-0.5 hover:text-dark-300 transition-colors">
                                            {row.label}
                                        </span>
                                        {/* Tooltip Content */}
                                        <div className="absolute left-0 bottom-full mb-2.5 hidden group-hover/tooltip:block w-72 bg-[#0c152b] border border-white/10 rounded-2xl p-4 text-[11px] text-dark-300 shadow-2xl z-[1000] leading-relaxed">
                                            <div className="absolute top-full left-6 -mt-1 w-2.5 h-2.5 bg-[#0c152b] border-r border-b border-white/10 rotate-45" />
                                            <div className="font-bold text-neon-cyan uppercase tracking-wider mb-1.5 text-[10px]">{row.label}</div>
                                            {row.desc}
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-black text-right max-w-[55%] truncate ${row.mono ? "font-mono text-neon-cyan" : "text-white"}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Mouse path visualizer — menggunakan viewportSize dari state (SSR-safe) */}
                        <div className="mt-5 bg-dark-950/60 rounded-2xl border border-white/5 p-4 h-28 relative overflow-hidden">
                            <div className="absolute top-2 left-3 text-[9px] font-black text-dark-600 uppercase tracking-widest">Jejak Jalur Mouse</div>
                            <svg className="w-full h-full" viewBox="0 0 400 80">
                                {telemetry.mousePoints.length > 1 ? (
                                    <polyline
                                        points={telemetry.mousePoints
                                            .map(p => `${(p.x / viewportSize.w) * 400},${(p.y / viewportSize.h) * 80}`)
                                            .join(" ")}
                                        fill="none" 
                                        stroke={scenario === "bot" ? "rgba(239,68,68,0.6)" : scenario === "syndicate" ? "rgba(251,191,36,0.6)" : "rgba(6,182,212,0.6)"} 
                                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    />
                                ) : (
                                    scenario === "bot" ? (
                                        <line x1="20" y1="40" x2="380" y2="40" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
                                    ) : (
                                        <text x="200" y="45" textAnchor="middle" fill="rgba(255,255,255,0.15)" className="text-[9px] font-black uppercase tracking-widest select-none">
                                            Gerakkan mouse untuk merekam telemetri
                                        </text>
                                    )
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
                                    <div className={`mt-4 rounded-2xl border p-6 transition-all ${cfg.border} ${cfg.bg} ${cfg.glow} space-y-4`}>

                                        {/* Header Vonis */}
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-dark-400 uppercase tracking-[0.3em] mb-3">
                                                Vonis FDS
                                                {mlResult && (
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${
                                                        mlResult.is_live
                                                            ? "bg-status-success/10 text-status-success border border-status-success/20"
                                                            : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                                    }`}>
                                                        {mlResult.is_live ? "⚡ LIVE ML" : "🎭 DEMO MODE"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-center gap-3 mb-2">
                                                {(mlResult?.final_decision ?? cfg.verdict) === "BLOCKED" || cfg.verdict === "DIBLOKIR"
                                                    ? <ShieldX className="w-10 h-10 text-status-error" strokeWidth={2} />
                                                    : <ShieldCheck className="w-10 h-10 text-status-success" strokeWidth={2} />
                                                }
                                                <div className={`text-4xl font-black uppercase tracking-tight ${cfg.verdictColor}`}>
                                                    {mlResult ? (mlResult.final_decision === "BLOCKED" ? "DIBLOKIR" : "TERVERIFIKASI") : cfg.verdict}
                                                </div>
                                            </div>
                                            {mlResult?.fraud_type && mlResult.fraud_type !== "Legitimate" && (
                                                <div className="text-[10px] font-black text-status-error uppercase tracking-widest mt-1">
                                                    Jenis: {mlResult.fraud_type}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-dark-500" />
                                                <span className="text-[11px] text-dark-400 font-black uppercase tracking-widest">
                                                    Skor Risiko: <span className={cfg.verdictColor}>
                                                        {mlResult ? (mlResult.risk_score > 0 && mlResult.risk_score < 1 ? mlResult.risk_score.toFixed(2) : Math.round(mlResult.risk_score)) : riskScore}/100
                                                    </span>
                                                    {mlResult && <span className="text-dark-600 ml-1">(Threshold: {mlResult.threshold_used})</span>}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Model Breakdown Scores */}
                                        {mlResult?.model_scores && (
                                            <div className="bg-dark-950/60 rounded-xl border border-white/5 p-4">
                                                <div className="text-[9px] font-black text-dark-500 uppercase tracking-[0.25em] mb-3">Breakdown Skor per Model</div>
                                                <div className="space-y-2">
                                                    {([
                                                        { key: "xgboost",            label: "XGBoost",           color: "bg-blue-500" },
                                                        { key: "lightgbm_fraud_sum", label: "LightGBM (Fraud)",  color: "bg-purple-500" },
                                                        { key: "graph_gnn",          label: "Graph / GNN",       color: "bg-neon-cyan" },
                                                        { key: "sdk_behavioral",     label: "SDK Behavioral ML", color: "bg-emerald-400" },
                                                        { key: "ensemble_final",     label: "Ensemble Final",    color: "bg-hyper-violet" },
                                                    ] as const).map(({ key, label, color }) => {
                                                        const score = mlResult.model_scores[key] ?? 0;
                                                        return (
                                                            <div key={key} className="flex items-center gap-3">
                                                                <span className="text-[10px] text-dark-400 font-mono w-32 flex-shrink-0">{label}</span>
                                                                <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${color} rounded-full transition-all duration-700`}
                                                                        style={{ width: `${Math.min(score, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-[11px] font-black font-mono w-12 text-right ${
                                                                    score >= mlResult.threshold_used ? "text-status-error" : "text-status-success"
                                                                }`}>
                                                                    {score.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {mlResult.processing_time_ms > 0 && (
                                                    <div className="mt-3 text-[9px] text-dark-600 font-mono text-right">
                                                        Inferensi: {mlResult.processing_time_ms}ms
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
