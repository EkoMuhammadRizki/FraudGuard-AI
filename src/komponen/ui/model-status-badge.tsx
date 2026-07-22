"use client";
import { useState, useEffect, useCallback } from "react";
import { Cpu, RefreshCw, Zap, ShieldCheck, Layers, Activity, Radio } from "lucide-react";

interface ModelStatus {
    online: boolean;
    model_loaded?: boolean;
    f1_score?: number;
    threshold?: number;
    models_used?: string[];
    feature_count?: number;
}

interface ModelStatusBadgeProps {
    /** Interval polling dalam ms. Default: 30000 (30 detik) */
    pollInterval?: number;
    /** Tampilkan detail model (F1, threshold, dll) */
    showDetails?: boolean;
    /** Callback saat status berubah */
    onStatusChange?: (status: ModelStatus) => void;
}

export default function ModelStatusBadge({
    pollInterval = 30_000,
    showDetails = false,
    onStatusChange,
}: ModelStatusBadgeProps) {
    const [status, setStatus] = useState<ModelStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const checkStatus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/model-status", { cache: "no-store" });
            const data: ModelStatus = await res.json();
            setStatus(data);
            setLastChecked(new Date());
            onStatusChange?.(data);
        } catch {
            setStatus({ online: false });
        } finally {
            setLoading(false);
        }
    }, [onStatusChange]);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, pollInterval);
        return () => clearInterval(interval);
    }, [checkStatus, pollInterval]);

    const isOnline = status?.online && status?.model_loaded;

    return (
        <div className="inline-flex items-center max-w-full">
            {/* Unified Single-Line Capsule Bar */}
            <div 
                className={`
                    inline-flex flex-nowrap items-center whitespace-nowrap gap-2.5 pl-4 pr-3 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-300 shadow-md text-[10px] font-mono max-w-full overflow-x-auto no-scrollbar
                    ${isOnline 
                        ? "bg-dark-950/90 border-emerald-500/30 shadow-[0_2px_15px_rgba(16,185,129,0.12)] text-emerald-400" 
                        : "bg-dark-950/90 border-rose-500/30 shadow-[0_2px_15px_rgba(244,63,94,0.12)] text-rose-400"
                    }
                `}
            >
                {/* 1. ML ENGINE ONLINE (Indikator Dot Hijau Pulse + Icon CPU) */}
                <div className="flex items-center gap-2 pr-2.5 border-r border-white/10">
                    <span className="relative flex h-2 w-2">
                        {!loading && isOnline && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                                loading
                                    ? "bg-amber-400 animate-pulse"
                                    : isOnline
                                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                                        : "bg-rose-500 shadow-[0_0_6px_#f43f5e]"
                            }`}
                        />
                    </span>

                    <Cpu className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-400" : "text-rose-400"}`} />

                    <span className="font-bold uppercase tracking-wider text-[10px]">
                        {loading
                            ? "SYNCING..."
                            : isOnline
                                ? "ML ENGINE ONLINE"
                                : "ML ENGINE OFFLINE"
                        }
                    </span>
                </div>

                {/* 2. SINYAL LANGSUNG (Indikator Hotspot / Radio Icon Pulse) */}
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
                    <Radio className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                    <span className="font-black text-neon-cyan uppercase tracking-widest text-[10px]">
                        SINYAL LANGSUNG
                    </span>
                </div>

                {/* 3. Inline Stats (F1, Threshold, Features, Models) */}
                {showDetails && isOnline && status && (
                    <div className="flex items-center gap-2.5 text-[10px]">
                        {/* F1 Score */}
                        {status.f1_score !== undefined && (
                            <div className="flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-neon-cyan" />
                                <span className="text-dark-400">F1:</span>
                                <span className="text-emerald-400 font-bold">{(status.f1_score * 100).toFixed(1)}%</span>
                            </div>
                        )}

                        {/* Threshold */}
                        {status.threshold !== undefined && (
                            <div className="flex items-center gap-1 pl-2.5 border-l border-white/10">
                                <ShieldCheck className="w-2.5 h-2.5 text-primary-blue" />
                                <span className="text-dark-400">Thresh:</span>
                                <span className="text-neon-cyan font-bold">{(status.threshold * 100).toFixed(1)}%</span>
                            </div>
                        )}

                        {/* Features */}
                        {status.feature_count !== undefined && (
                            <div className="flex items-center gap-1 pl-2.5 border-l border-white/10">
                                <Activity className="w-2.5 h-2.5 text-hyper-violet" />
                                <span className="text-white font-bold">{status.feature_count}</span>
                                <span className="text-dark-400">Fitur</span>
                            </div>
                        )}

                        {/* Models */}
                        {status.models_used && (
                            <div className="flex items-center gap-1 pl-2.5 border-l border-white/10">
                                <Layers className="w-2.5 h-2.5 text-amber-400" />
                                <span className="text-white font-bold">{status.models_used.length}</span>
                                <span className="text-dark-400">Models</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Offline hint */}
                {!loading && !isOnline && (
                    <span className="text-[9px] text-dark-400">
                        Jalankan: <code className="text-amber-400">uvicorn main:app</code>
                    </span>
                )}

                {/* Timestamp */}
                {lastChecked && !loading && (
                    <span className="text-[9px] text-dark-500 border-l border-white/10 pl-2.5">
                        {lastChecked.toLocaleTimeString("id-ID")}
                    </span>
                )}

                {/* Refresh button */}
                <button
                    onClick={checkStatus}
                    disabled={loading}
                    title="Perbarui Status Model"
                    className="pl-0.5 text-dark-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`w-2.5 h-2.5 ${loading ? "animate-spin text-neon-cyan" : ""}`} />
                </button>
            </div>
        </div>
    );
}
