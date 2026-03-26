import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-blue/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-hyper-violet/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
                    {/* Left content */}
                    <div className="lg:col-span-7 space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-neon-cyan/30 text-neon-cyan text-sm font-bold tracking-widest uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                            </span>
                            Next-Gen Fraud Intelligence
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                            Deteksi Fraud <br />
                            <span className="bg-gradient-to-r from-hyper-violet via-primary-blue to-neon-cyan bg-clip-text text-transparent italic">
                                Tanpa Batas.
                            </span>
                        </h1>

                        <p className="text-xl text-dark-300 leading-relaxed max-w-2xl font-medium">
                            Infrastruktur perlindungan real-time bertenaga neural network tingkat lanjut. Lindungi ekosistem finansial Anda dengan presisi militer dan latensi nol.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <a
                                href="/daftar"
                                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] text-center"
                            >
                                Mulai Integrasi Sekarang
                            </a>
                            <Link
                                href="/dasbor/ringkasan"
                                className="w-full sm:w-auto px-10 py-5 rounded-2xl glass-panel text-white font-bold text-lg transition-all hover:bg-white/5 text-center"
                            >
                                Lihat Live Demo
                            </Link>
                        </div>
                        
                        {/* Social Proof Placeholder */}
                        <div className="pt-12 flex items-center gap-8 grayscale opacity-40">
                            <div className="text-sm font-bold tracking-widest text-dark-500 uppercase">Trusted By</div>
                            <div className="flex gap-6 text-xl font-bold italic">
                                <span>FIN-TECH</span>
                                <span>BANK-XR</span>
                                <span>E-COMM</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Premium Mockup */}
                    <div className="lg:col-span-5 relative group animate-fade-in" style={{ animationDelay: "0.2s" }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-hyper-violet to-neon-cyan rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative glass-panel rounded-3xl p-8 shadow-2xl overflow-hidden">
                            {/* Animated nodes and connections overlay */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <svg width="100%" height="100%" viewBox="0 0 400 400">
                                    <circle cx="50" cy="50" r="2" fill="white" className="animate-pulse" />
                                    <circle cx="350" cy="150" r="2" fill="white" className="animate-pulse" />
                                    <circle cx="100" cy="300" r="2" fill="white" className="animate-pulse" />
                                    <path d="M50 50 L350 150 L100 300 Z" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5,5" />
                                </svg>
                            </div>

                            <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                                <div>
                                    <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Protection Layer</div>
                                    <div className="text-2xl font-black flex items-center gap-3 glow-cyan">
                                        <div className="w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_10px_#06B6D4]"></div> Active
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Threat Score</div>
                                    <div className="text-3xl font-black text-status-success">0.02%</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-dark-400">
                                        <span>SYN-DETECTION</span>
                                        <span className="text-neon-cyan">OPTIMIZED</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-dark-950 rounded-full border border-white/5 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-blue to-neon-cyan w-[92%] animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-dark-400">
                                        <span>LATENCY RESPONSE</span>
                                        <span className="text-hyper-violet">12MS</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-dark-950 rounded-full border border-white/5 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-blue to-hyper-violet w-[15%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">4.8B+</div>
                                    <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Global Events</div>
                                </div>
                                <div className="text-center border-l border-white/10">
                                    <div className="text-2xl font-black text-white">99.9%</div>
                                    <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">SLA Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
