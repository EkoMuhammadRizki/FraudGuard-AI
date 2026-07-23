'use client';
import { useState, useEffect } from 'react';
import { Bot, Sparkles, ShieldAlert, Cpu, RefreshCw, Copy, Check, Terminal } from 'lucide-react';
import InfoTooltip from '@/komponen/ui/info-tooltip';

interface XaiFeature {
    name: string;
    importance: number;
    impact: 'tinggi' | 'sedang' | 'rendah';
}

const PRESET_LOGS = [
    {
        label: "Terindikasi ATO (Account Takeover)",
        prompt: "Ditemukan login dari IP 185.220.101.4 (Tor Exit Node) pada pukul 03:14 WIB. Kata sandi diubah, diikuti transfer Rp 45.000.000 ke rekening baru dalam kurun waktu 45 detik."
    },
    {
        label: "Jaringan Keledai (Money Mule Ring)",
        prompt: "Rekening ID-994821 menerima 14 kali transfer pecahan Rp 2.500.000 dari pengirim berbeda dalam 10 menit. Seluruh dana langsung diteruskan ke 1 rekening penampung utama."
    },
    {
        label: "Sesi AnyDesk / Remote Control",
        prompt: "Mobile SDK mengirimkan sinyal telemetri Android: remoteDesktopActive: true, package: com.anydesk.anydeskandroid. Nasabah sedang melakukan transaksi transfer Rp 15.000.000."
    }
];

export default function FraudDetectorComponent() {
    const [inputData, setInputData] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverInfo, setServerInfo] = useState<{ ip: string; online: boolean; source?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // XAI SHAP & Forensic Log State
    const [xaiFeatures, setXaiFeatures] = useState<XaiFeature[]>([]);
    const [forensicNarrative, setForensicNarrative] = useState<string>('');
    const [riskScore, setRiskScore] = useState<number>(0);
    const [thresholdUsed, setThresholdUsed] = useState<number>(38);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Cek status koneksi AI Server
    useEffect(() => {
        async function checkServer() {
            try {
                const res = await fetch('/api/detect-fraud', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setServerInfo({
                        ip: data.kamatera_server?.ip || '103.102.46.104:8000',
                        online: data.kamatera_server?.online ?? true,
                    });
                }
            } catch {
                setServerInfo({ ip: '103.102.46.104:8000', online: false });
            }
        }
        checkServer();
    }, []);

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputData.trim()) return;

        // Buka widget REMI AI secara otomatis dan kirimkan prompt ke Chatbot UI
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-remi-chat", {
                detail: { prompt: inputData }
            }));
        }
    };

    const handlePresetClick = (promptText: string) => {
        setInputData(promptText);
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-remi-chat", {
                detail: { prompt: promptText }
            }));
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-dark-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden space-y-6">
            {/* Header / Cyber Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan via-primary-blue to-hyper-violet p-0.5 shadow-lg shadow-neon-cyan/20">
                        <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                            <Bot className="w-6 h-6 text-neon-cyan animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">REMI AI — ASISTEN DETEKSI FRAUD</h2>
                            <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-black uppercase tracking-wider">DATABASE & FDS INTELLIGENCE</span>
                        </div>
                        <p className="text-xs text-dark-400 font-medium">Asisten Analisis Real-Time Log, Metadata Transaksi, & Compliance Regulasi OJK/BI/UU PDP</p>
                    </div>
                </div>

                {/* Server Connectivity Status Pill */}
                <div className="flex items-center gap-2 bg-dark-950 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${serverInfo?.online ? 'bg-status-success animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-xs font-mono text-dark-300 font-bold">
                        {serverInfo?.online ? `Kamatera AI (${serverInfo.ip})` : `Engine REMI AI Active (103.102.46.104:8000)`}
                    </span>
                </div>
            </div>

            {/* Template Presets */}
            <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Preset Log Contoh Transaksi:</p>
                <div className="flex flex-wrap gap-2">
                    {PRESET_LOGS.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handlePresetClick(item.prompt)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-neon-cyan/10 border border-white/10 hover:border-neon-cyan/30 text-xs text-dark-300 hover:text-neon-cyan transition-all font-medium flex items-center gap-1.5"
                        >
                            <Terminal className="w-3.5 h-3.5 text-neon-cyan" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleCheck} className="space-y-4">
                <div className="relative">
                    <textarea
                        className="w-full p-4 bg-dark-950 border border-white/10 rounded-2xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all font-mono leading-relaxed custom-scrollbar"
                        rows={5}
                        placeholder="Tanyakan sesuatu pada REMI AI atau masukkan detail transaksi, log aktivitas, & prompt narasi untuk dianalisis..."
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                    />
                    {inputData && (
                        <button
                            type="button"
                            onClick={() => setInputData('')}
                            className="absolute top-3 right-3 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-dark-400 hover:text-white transition-all"
                        >
                            Reset Input
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !inputData.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet text-dark-950 font-black text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100 shadow-lg shadow-neon-cyan/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin text-dark-950" />
                            <span>Menganalisis Risiko Fraud via REMI AI...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-dark-950" />
                            <span>Analisis Risiko Fraud dengan REMI AI</span>
                        </>
                    )}
                </button>
            </form>

            {/* Hasil Analisis Output Box */}
            {result && (
                <div className="p-5 bg-dark-950/90 border border-neon-cyan/30 rounded-2xl space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-neon-cyan" />
                            <h3 className="font-black text-sm text-white uppercase tracking-wider">Hasil Analisis Model AI</h3>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-dark-300 hover:text-white transition-all border border-white/10"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Tersalin' : 'Salin Hasil'}</span>
                        </button>
                    </div>

                    <div className="text-xs text-dark-200 font-sans leading-relaxed whitespace-pre-wrap">
                        {result}
                    </div>

                    {serverInfo?.source && (
                        <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-dark-500 border-t border-white/5">
                            <Cpu className="w-3 h-3 text-neon-cyan" />
                            <span>Inference Source: {serverInfo.source}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ─── FITUR SHAP / XAI INTEGRATION PANEL ─── */}
            {hasAnalyzed && (
                <div className="p-6 md:p-8 bg-dark-950/95 border border-white/10 rounded-3xl relative overflow-hidden group shadow-2xl">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-20" />

                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">
                                    Dampak <span className="text-hyper-violet">Fitur SHAP / XAI</span>
                                </h3>
                                <InfoTooltip text="Explainable AI (XAI) berbasis SHAP values. Menjelaskan faktor apa yang paling mempengaruhi keputusan model. Bar merah = dampak tinggi, kuning = sedang, hijau = rendah." />
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 mt-1 uppercase tracking-[0.2em]">
                                Penalaran keputusan AI yang transparan & pembobotan atribut
                            </p>
                        </div>
                        <div className="px-5 py-2 rounded-2xl bg-dark-900 border border-white/10 text-hyper-violet text-[10px] font-black uppercase tracking-widest self-start xl:self-center">
                            SHAP-READY ENGINE v4.0.1
                        </div>
                    </div>

                    {/* SHAP Feature Impact Bars */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6">
                        {xaiFeatures.length > 0 ? (
                            xaiFeatures.map((feature) => {
                                const barColor = feature.impact === 'tinggi' ? 'bg-status-error' : feature.impact === 'sedang' ? 'bg-amber-400' : 'bg-status-success';
                                const percentageVal = Math.round(feature.importance * 100);
                                return (
                                    <div key={feature.name} className="group/feat">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider group-hover/feat:text-neon-cyan transition-colors">
                                                {feature.name}
                                            </div>
                                            <div className="text-[10px] font-black font-mono text-dark-400">
                                                {percentageVal}%
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                            <div
                                                className={`h-full rounded-full ${barColor} shadow-sm transition-all duration-1000`}
                                                style={{ width: `${Math.min(percentageVal, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 text-center text-dark-500 font-bold uppercase tracking-widest text-xs py-10">
                                TIDAK ADA KONTRIBUSI FITUR ANOMALI TERDETEKSI OLEH SHAP
                            </div>
                        )}
                    </div>

                    {/* Log Narasi Forensik Model Box */}
                    <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/10 group/narrative relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${riskScore >= thresholdUsed ? 'bg-status-error' : 'bg-status-success'} opacity-60`} />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-3 flex items-center gap-2.5">
                            <Cpu className="w-5 h-5 text-neon-cyan" strokeWidth={2.5} />
                            Log Narasi Forensik Model
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-dark-400 leading-relaxed uppercase tracking-tight">
                            {forensicNarrative}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

