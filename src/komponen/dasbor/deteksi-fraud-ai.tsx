'use client';
import { useState, useEffect } from 'react';
import { Bot, Sparkles, Send, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, Terminal } from 'lucide-react';

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

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputData.trim()) return;

        setLoading(true);
        setResult('');

        try {
            // Menghubungkan ke API Proxy /api/detect-fraud (Forward ke Kamatera 103.102.46.104:8000/v1/detect-fraud)
            const response = await fetch('/api/detect-fraud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: inputData,
                    temperature: 0.1,
                    max_tokens: 300
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setResult(data.result);
                if (data.source) {
                    setServerInfo(prev => prev ? { ...prev, source: data.source } : null);
                }
            } else {
                setResult('Gagal mendapatkan analisis dari AI.');
            }
        } catch (error) {
            console.error('Error connecting to AI server:', error);
            setResult('Terjadi kesalahan koneksi ke server AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-dark-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
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
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">AmankanGuard — Deteksi Fraud AI</h2>
                            <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-black uppercase">v2.0 Model</span>
                        </div>
                        <p className="text-xs text-dark-400 font-medium">Analisis real-time log & prompt transaksi menggunakan Model Kamatera Cloud AI</p>
                    </div>
                </div>

                {/* Server Connectivity Status Pill */}
                <div className="flex items-center gap-2 bg-dark-950 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${serverInfo?.online ? 'bg-status-success animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-xs font-mono text-dark-300">
                        {serverInfo?.online ? `Kamatera AI (${serverInfo.ip})` : `Engine REMI AI Active`}
                    </span>
                </div>
            </div>

            {/* Template Presets */}
            <div className="mt-6">
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Preset Log Contoh Transaksi:</p>
                <div className="flex flex-wrap gap-2">
                    {PRESET_LOGS.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setInputData(item.prompt)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-neon-cyan/10 border border-white/10 hover:border-neon-cyan/30 text-xs text-dark-300 hover:text-neon-cyan transition-all font-medium flex items-center gap-1.5"
                        >
                            <Terminal className="w-3.5 h-3.5 text-neon-cyan" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleCheck} className="mt-6 space-y-4">
                <div className="relative">
                    <textarea
                        className="w-full p-4 bg-dark-950 border border-white/10 rounded-2xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all font-mono leading-relaxed custom-scrollbar"
                        rows={5}
                        placeholder="Masukkan detail transaksi, log aktivitas, atau prompt narasi untuk dianalisis oleh AI..."
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
                            <span>Menganalisis Risiko Fraud via Model AI...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-dark-950" />
                            <span>Analisis Risiko Fraud AI</span>
                        </>
                    )}
                </button>
            </form>

            {/* Hasil Analisis Output Box */}
            {result && (
                <div className="mt-6 p-5 bg-dark-950/90 border border-neon-cyan/30 rounded-2xl space-y-3 relative group">
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
        </div>
    );
}
