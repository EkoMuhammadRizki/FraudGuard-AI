"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Hero() {
    const [isAnimated, setIsAnimated] = useState(false);
    const [threatScore, setThreatScore] = useState(0.02);
    const [synValue, setSynValue] = useState(92);
    const [latencyValue, setLatencyValue] = useState(12);
    const [globalEvents, setGlobalEvents] = useState(4821590400);

    useEffect(() => {
        setIsAnimated(true);
    }, []);

    useEffect(() => {
        if (!isAnimated) return;

        const interval = setInterval(() => {
            // Fluctuate threat score slightly between 0.01% and 0.05%
            setThreatScore((prev) => {
                const diff = (Math.random() - 0.5) * 0.008;
                const next = parseFloat((prev + diff).toFixed(3));
                return next >= 0.01 && next <= 0.05 ? next : prev;
            });

            // Fluctuate SYN-DETECTION bar value slightly between 89% and 95%
            setSynValue((prev) => {
                const diff = Math.random() > 0.5 ? 1 : -1;
                const next = prev + diff;
                return next >= 88 && next <= 95 ? next : prev;
            });

            // Fluctuate latency slightly between 8ms and 15ms
            setLatencyValue((prev) => {
                const diff = Math.random() > 0.5 ? 1 : -1;
                const next = prev + diff;
                return next >= 8 && next <= 15 ? next : prev;
            });

            // Increment global events slightly to show active transaction traffic
            setGlobalEvents((prev) => prev + Math.floor(Math.random() * 45) + 5);
        }, 1200);

        return () => clearInterval(interval);
    }, [isAnimated]);

    const formatGlobalEvents = (num: number) => {
        return num.toLocaleString("en-US");
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-blue/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-hyper-violet/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
                    {/* Left content */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-neon-cyan/30 text-neon-cyan text-sm font-bold tracking-widest uppercase transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                            </span>
                            Next-Gen Fraud Intelligence
                        </div>

                        <h1 className={`text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter transition-all duration-1000 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}>
                            Deteksi Fraud <br />
                            <span className="bg-gradient-to-r from-hyper-violet via-primary-blue to-neon-cyan bg-clip-text text-transparent italic">
                                Tanpa Batas.
                            </span>
                        </h1>

                        <p className={`text-xl text-dark-300 leading-relaxed max-w-2xl font-medium transition-all duration-1000 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}>
                            Infrastruktur perlindungan real-time bertenaga neural network tingkat lanjut. Lindungi ekosistem finansial Anda dengan presisi militer dan latensi nol.
                        </p>

                        <div className={`flex flex-col sm:flex-row items-center gap-6 pt-4 transition-all duration-1000 delay-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}>
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-base transition-all active:scale-[0.98] shadow-md hover:shadow-lg text-center"
                            >
                                Mulai Integrasi Sekarang
                            </Link>
                        </div>
                        
                        {/* Social Proof Placeholder */}
                        <div className={`pt-12 flex items-center gap-8 grayscale opacity-40 transition-all duration-1000 delay-400 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}>
                            <div className="text-sm font-bold tracking-widest text-dark-500 uppercase">Trusted By</div>
                            <div className="flex gap-6 text-xl font-bold italic">
                                <span>FIN-TECH</span>
                                <span>BANK-XR</span>
                                <span>E-COMM</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sleek, Clean, and Minimal FDS Card */}
                    <div className={`lg:col-span-5 relative group transition-all duration-1000 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                        isAnimated ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                    }`}>
                        <div className={isAnimated ? "animate-float" : ""}>
                            {/* Subtle Neon Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-700"></div>

                            {/* Main Sleek Card */}
                            <div className="relative bg-dark-950/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                                
                                {/* Header Badge & Status */}
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                                        </span>
                                        <span className="text-xs font-black text-white uppercase tracking-wider">
                                            Proteksi FDS Real-time
                                        </span>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                                        &lt; 28ms Latensi
                                    </span>
                                </div>

                                {/* Single Clear Example (Live Detection Preview) */}
                                <div className="bg-dark-900/80 rounded-2xl p-5 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between text-[11px] font-mono text-dark-400">
                                        <span>REKENING & NOMINAL</span>
                                        <span className="text-neon-cyan font-bold">50.000 DATASET MONGO</span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-mono text-dark-300 font-medium">
                                            1029 3847 5612 <span className="text-dark-500 mx-1">➔</span> 7EODFI16R
                                        </div>
                                        <div className="text-2xl font-black text-white mt-1">
                                            Rp 150.000.000
                                        </div>
                                    </div>

                                    {/* Decision Box */}
                                    <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/30 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-mono font-bold text-status-error uppercase tracking-wider">VONIS ENSEMBLE AI</div>
                                            <div className="text-xs font-bold text-white mt-0.5">Money Mule & AnyDesk Active</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2.5 py-1 rounded-lg bg-status-error text-white font-black text-xs uppercase tracking-wider inline-block">
                                                DIBLOKIR
                                            </span>
                                            <div className="text-[10px] font-mono font-bold text-status-error mt-1">Skor: 99.8%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3 Clean Metrics */}
                                <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
                                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-sm font-black text-white">50.000+</div>
                                        <div className="text-[9px] font-bold text-dark-400 uppercase tracking-wider mt-0.5">Transaksi</div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-sm font-black text-neon-cyan">5 Models</div>
                                        <div className="text-[9px] font-bold text-dark-400 uppercase tracking-wider mt-0.5">Ensemble ML</div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-sm font-black text-hyper-violet">REMI AI</div>
                                        <div className="text-[9px] font-bold text-dark-400 uppercase tracking-wider mt-0.5">Assistant</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
