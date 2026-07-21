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
        if ((window as any).__splashScreenFinished) {
            setIsAnimated(true);
        } else {
            const handleFinished = () => setIsAnimated(true);
            window.addEventListener("splashScreenFinished", handleFinished);
            return () => window.removeEventListener("splashScreenFinished", handleFinished);
        }
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
                                href="/dasbor/ringkasan"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-base transition-all active:scale-[0.98] shadow-md hover:shadow-lg text-center"
                            >
                                Mulai Integrasi Sekarang
                            </Link>
                            <Link
                                href="/dasbor/ringkasan"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold text-base transition-all hover:bg-white/5 text-center active:scale-[0.98]"
                            >
                                Lihat Live Demo
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

                    {/* Right: Realistic Banking FDS Command Center Terminal Mockup */}
                    <div className={`lg:col-span-5 relative group transition-all duration-1000 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
                        isAnimated ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                    }`}>
                        <div className={isAnimated ? "animate-float" : ""}>
                            {/* Glowing Background Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                            {/* Window Frame */}
                            <div className="relative bg-dark-950/95 border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden font-sans">
                                
                                {/* Window Top Header */}
                                <div className="bg-dark-900/90 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-status-error/80" />
                                        <div className="w-3 h-3 rounded-full bg-amber-warning/80" />
                                        <div className="w-3 h-3 rounded-full bg-status-success/80" />
                                        <span className="text-[10px] font-mono font-bold text-dark-400 ml-2 tracking-wider hidden sm:inline">
                                            amankan-fraud.bi.go.id // FDS Command Center
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                                        </span>
                                        <span className="text-[9px] font-mono font-black text-status-success uppercase tracking-widest">MongoDB Atlas Connected</span>
                                    </div>
                                </div>

                                {/* Terminal Main Content */}
                                <div className="p-5 md:p-6 space-y-5">
                                    
                                    {/* System Status Metrics */}
                                    <div className="grid grid-cols-3 gap-3 bg-dark-900/60 p-3 rounded-2xl border border-white/5 font-mono">
                                        <div>
                                            <div className="text-[9px] text-dark-400 uppercase tracking-widest font-bold">Risk Threshold</div>
                                            <div className="text-sm font-black text-neon-cyan mt-0.5">33.74%</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-dark-400 uppercase tracking-widest font-bold">Latency</div>
                                            <div className="text-sm font-black text-status-success mt-0.5">&lt; 28 ms</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-dark-400 uppercase tracking-widest font-bold">Model Stack</div>
                                            <div className="text-sm font-black text-hyper-violet mt-0.5">5 Models Active</div>
                                        </div>
                                    </div>

                                    {/* Live Transaction Feed Table Mockup */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-dark-400 uppercase tracking-wider px-1">
                                            <span>Feed Transaksi Real-time</span>
                                            <span className="text-neon-cyan animate-pulse">● Live Engine</span>
                                        </div>

                                        <div className="space-y-2 font-mono text-[11px]">
                                            {/* Row 1: Approved Transfer */}
                                            <div className="p-3 rounded-xl bg-status-success/5 border border-status-success/20 flex items-center justify-between hover:bg-status-success/10 transition-all">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">102938475612</span>
                                                        <span className="text-dark-500">→</span>
                                                        <span className="text-dark-300">81D858360</span>
                                                    </div>
                                                    <div className="text-[10px] text-dark-400">Rp 500.000 · Transfer M-Banking</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-0.5 rounded bg-status-success/20 text-status-success font-black text-[9px] uppercase tracking-wider block">
                                                        APPROVED
                                                    </span>
                                                    <span className="text-[9px] text-dark-400 font-bold mt-0.5 block">Risk: 0.01%</span>
                                                </div>
                                            </div>

                                            {/* Row 2: Blocked Money Mule Fraud */}
                                            <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/30 flex items-center justify-between hover:bg-status-error/15 transition-all">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">880123456789</span>
                                                        <span className="text-dark-500">→</span>
                                                        <span className="text-status-error font-bold">7EODFI16R</span>
                                                    </div>
                                                    <div className="text-[10px] text-status-error font-bold">Rp 150.000.000 · Money Mule Syndicate</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-0.5 rounded bg-status-error text-white font-black text-[9px] uppercase tracking-wider block animate-pulse">
                                                        BLOCKED
                                                    </span>
                                                    <span className="text-[9px] text-status-error font-bold mt-0.5 block">Risk: 99.83%</span>
                                                </div>
                                            </div>

                                            {/* Row 3: Telemetry ATO Warning */}
                                            <div className="p-3 rounded-xl bg-amber-warning/10 border border-amber-warning/20 flex items-center justify-between hover:bg-amber-warning/15 transition-all">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">522040690011</span>
                                                        <span className="text-dark-500">→</span>
                                                        <span className="text-dark-300">OP37OPVPY</span>
                                                    </div>
                                                    <div className="text-[10px] text-amber-warning font-bold">Mobile SDK: AnyDesk & Rooted Device</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-0.5 rounded bg-amber-warning/20 text-amber-warning font-black text-[9px] uppercase tracking-wider block">
                                                        FLAGGED
                                                    </span>
                                                    <span className="text-[9px] text-amber-warning font-bold mt-0.5 block">Risk: 88.40%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom AI Assistant Status */}
                                    <div className="p-3 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                                                REMI AI Assistant Active
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-neon-cyan uppercase tracking-widest">
                                            v1.0 Agent Ready
                                        </span>
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
