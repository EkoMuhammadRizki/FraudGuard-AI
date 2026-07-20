"use client";
import { useState, useEffect, useCallback } from "react";
import { Cpu, Wifi, WifiOff, RefreshCw } from "lucide-react";

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
        <div className="flex flex-col gap-1.5">
            {/* Main badge */}
            <div
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest
                    transition-all duration-300 cursor-default select-none
                    ${loading
                        ? "border-white/10 bg-white/5 text-dark-500"
                        : isOnline
                            ? "border-status-success/30 bg-status-success/10 text-status-success"
                            : "border-status-error/30 bg-status-error/10 text-status-error"
                    }
                `}
            >
                {/* Animated pulse dot */}
                <span className="relative flex h-2 w-2 flex-shrink-0">
                    {!loading && isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
                    )}
                    <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                            loading
                                ? "bg-dark-500 animate-pulse"
                                : isOnline
                                    ? "bg-status-success"
                                    : "bg-status-error"
                        }`}
                    />
                </span>

                <Cpu className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />

                <span>
                    {loading
                        ? "Mengecek Model..."
                        : isOnline
                            ? "ML Engine Online"
                            : "ML Engine Offline"
                    }
                </span>

                {/* Refresh button */}
                <button
                    onClick={checkStatus}
                    disabled={loading}
                    title="Refresh status"
                    className="ml-1 opacity-60 hover:opacity-100 transition disabled:animate-spin"
                >
                    <RefreshCw className="w-2.5 h-2.5" strokeWidth={3} />
                </button>
            </div>

            {/* Detail panel — hanya tampil jika showDetails=true dan online */}
            {showDetails && isOnline && status && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
                    {status.f1_score !== undefined && (
                        <span className="text-[10px] text-dark-400 font-mono">
                            F1 <span className="text-white font-bold">{(status.f1_score * 100).toFixed(1)}%</span>
                        </span>
                    )}
                    {status.threshold !== undefined && (
                        <span className="text-[10px] text-dark-400 font-mono">
                            Threshold <span className="text-white font-bold">{(status.threshold * 100).toFixed(1)}%</span>
                        </span>
                    )}
                    {status.feature_count !== undefined && (
                        <span className="text-[10px] text-dark-400 font-mono">
                            <span className="text-white font-bold">{status.feature_count}</span> Fitur
                        </span>
                    )}
                    {status.models_used && (
                        <span className="text-[10px] text-dark-400 font-mono">
                            <span className="text-white font-bold">{status.models_used.length}</span> Models
                        </span>
                    )}
                </div>
            )}

            {/* Offline hint */}
            {!loading && !isOnline && (
                <p className="text-[10px] text-dark-500 px-1">
                    Jalankan: <code className="text-amber-400 font-mono">uvicorn main:app</code> di folder <code className="text-amber-400">python-api/</code>
                </p>
            )}

            {lastChecked && !loading && (
                <p className="text-[10px] text-dark-600 px-1 font-mono">
                    Dicek: {lastChecked.toLocaleTimeString("id-ID")}
                </p>
            )}
        </div>
    );
}
