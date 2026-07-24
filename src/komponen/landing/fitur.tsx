"use client";
import React, { useState } from "react";
import { Network, BrainCircuit, Fingerprint, ArrowRight, Cpu, Layers, Bot } from "lucide-react";

export default function Fitur() {
    const [modalType, setModalType] = useState<string | null>(null);

    const fiturList = [
        {
            id: "gnn",
            icon: <Network className="w-6 h-6" strokeWidth={2} />,
            title: "Graph Neural Network (GNN)",
            description: "Menganalisis topologi jaringan transaksi untuk mengidentifikasi pola fraud tersembunyi dengan akurasi tinggi.",
        },
        {
            id: "lightgbm",
            icon: <Cpu className="w-6 h-6" strokeWidth={2} />,
            title: "LightGBM Classifier",
            description: "Klasifikasi multikelas instan untuk mendeteksi tipe penipuan spesifik (seperti pencucian uang atau pengambilalihan akun).",
        },
        {
            id: "ensemble",
            icon: <Layers className="w-6 h-6" strokeWidth={2} />,
            title: "Ensemble Final Stacker",
            description: "Meta-learner Logistic Regression yang menggabungkan prediksi XGBoost, LightGBM, dan GNN untuk keputusan final kokoh.",
        },
        {
            id: "xai",
            icon: <BrainCircuit className="w-6 h-6" strokeWidth={2} />,
            title: "Explainable AI (XAI)",
            description: "Menyediakan transparansi penuh untuk setiap keputusan AI, memastikan validasi dan audit trail yang akuntabel.",
        },
        {
            id: "biometrics",
            icon: <Fingerprint className="w-6 h-6" strokeWidth={2} />,
            title: "Biometrik Lanjutan",
            description: "Lapis keamanan ekstra dengan pengenalan wajah, deteksi sidik jari, dan profiling kebiasaan pengguna secara mulus.",
        },
        {
            id: "bot",
            icon: <Bot className="w-6 h-6" strokeWidth={2} />,
            title: "REMI AI Chatbot Assistant",
            description: "Asisten cerdas melayang berbasis AI untuk membantu analis membedah indikator risiko, panduan investigasi, dan SDK biometrik secara real-time.",
        },
    ];

    return (
        <section id="fitur" className="py-24 bg-dark-950 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-blue/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-16 reveal-on-scroll text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[11px] font-mono font-bold uppercase tracking-widest mb-3">
                        ⚡ Infrastruktur Solusi Berkelanjutan
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Fitur Proteksi Utama <span className="text-neon-cyan italic">Enterprise</span>
                    </h2>
                    <p className="text-dark-300 text-base sm:text-lg max-w-2xl leading-relaxed mt-3">
                        Arsitektur deteksi fraud multi-layer bertenaga Machine Learning Ensemble & Biometric Telemetry untuk perlindungan perbankan tanpa celah.
                    </p>
                </div>

                {/* Feature Grid - Auto responsive matching any row count cleanly */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {fiturList.map((fitur, index) => (
                        <div
                            key={fitur.title}
                            className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-neon-cyan/40 transition-all duration-300 group reveal-on-scroll flex flex-col hover:shadow-2xl hover:shadow-neon-cyan/10 relative overflow-hidden bg-dark-900/60"
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {/* Hover Neon Highlight Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Icon Box */}
                            <div className="w-14 h-14 rounded-2xl bg-dark-950 border border-white/10 flex items-center justify-center text-neon-cyan mb-6 group-hover:scale-110 group-hover:bg-neon-cyan group-hover:text-dark-950 transition-all duration-300 shadow-inner">
                                {fitur.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-extrabold text-white mb-3 tracking-tight group-hover:text-neon-cyan transition-colors">
                                {fitur.title}
                            </h3>
                            <p className="text-dark-300 leading-relaxed text-xs sm:text-sm mb-8 flex-1">
                                {fitur.description}
                            </p>

                            {/* Link Button */}
                            <button
                                onClick={() => setModalType(fitur.id)}
                                className="mt-auto inline-flex items-center gap-2 text-neon-cyan text-xs font-bold uppercase tracking-wider hover:text-white transition-colors active:scale-[0.98] outline-none text-left cursor-pointer group/btn"
                            >
                                <span>Pelajari Detail Sistem</span>
                                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform text-neon-cyan" strokeWidth={2.5} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Secondary Feature List */}
                <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/10">
                    {[
                        { title: "Pemrosesan Real-time", desc: "Verifikasi latensi rendah <50ms" },
                        { title: "Enkripsi E2E & Telemetry", desc: "Standar keamanan biometrik militer" },
                        { title: "Skalabilitas Tinggi", desc: "Mampu melayani hingga 10.000 TPS" },
                        { title: "Kepatuhan Regulasi", desc: "Standar POJK 39 & ISO 27001" },
                    ].map((item, index) => (
                        <div 
                            key={item.title}
                            className="reveal-on-scroll p-4 rounded-2xl bg-dark-900/40 border border-white/5"
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="text-white font-extrabold text-sm sm:text-base mb-1 tracking-tight">{item.title}</div>
                            <div className="text-dark-400 text-xs">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cybersecurity Detail Modal */}
            {modalType && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
                        onClick={() => setModalType(null)}
                    />
                    
                    {/* Modal Content Panel */}
                    <div className="relative w-full max-w-2xl bg-[#0b1329] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden z-10 animate-fade-in transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                        {/* Ambient cybersecurity glow behind */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-blue/20 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-neon-cyan/20 blur-[80px] rounded-full pointer-events-none" />

                        {/* Top Close Button */}
                        <button 
                            onClick={() => setModalType(null)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all active:scale-[0.95] cursor-pointer"
                            aria-label="Tutup"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-dark-700 border border-white/5 flex items-center justify-center text-primary-blue shadow-lg shrink-0">
                                {modalType === "gnn" && <Network className="w-8 h-8" />}
                                {modalType === "lightgbm" && <Cpu className="w-8 h-8" />}
                                {modalType === "ensemble" && <Layers className="w-8 h-8" />}
                                {modalType === "xai" && <BrainCircuit className="w-8 h-8" />}
                                {modalType === "biometrics" && <Fingerprint className="w-8 h-8" />}
                                {modalType === "bot" && <Bot className="w-8 h-8 text-neon-cyan" />}
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-[0.2em]">SISTEM INFRASTRUKTUR</span>
                                <h3 className="text-2xl font-black text-white mt-1 leading-tight">
                                    {modalType === "gnn" && "Graph Neural Network (GNN)"}
                                    {modalType === "lightgbm" && "LightGBM Multiclass Classifier"}
                                    {modalType === "ensemble" && "Ensemble Final Stacker (Meta-Learner)"}
                                    {modalType === "xai" && "Explainable AI (XAI)"}
                                    {modalType === "biometrics" && "Biometrik Lanjutan"}
                                    {modalType === "bot" && "REMI AI Chatbot Assistant"}
                                </h3>
                            </div>
                        </div>

                        {/* Simulation Visual (Dynamic Animated Section) */}
                        <div className="w-full bg-[#050914] border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden flex items-center justify-center min-h-[200px]">
                            {/* Grid background inside simulator */}
                            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

                            {modalType === "gnn" && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                    {/* Animated GNN Graph */}
                                    <svg className="w-full max-w-sm h-36" viewBox="0 0 260 140">
                                        {/* Connection lines */}
                                        <g stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" strokeDasharray="3,3">
                                            <line x1="40" y1="70" x2="100" y2="40" className="animate-pulse" />
                                            <line x1="40" y1="70" x2="100" y2="100" />
                                            <line x1="100" y1="40" x2="160" y2="40" />
                                            <line x1="100" y1="100" x2="160" y2="100" />
                                            <line x1="160" y1="40" x2="220" y2="70" />
                                            <line x1="160" y1="100" x2="220" y2="70" />
                                            <line x1="100" y1="40" x2="100" y2="100" />
                                            <line x1="160" y1="40" x2="160" y2="100" />
                                            <line x1="100" y1="40" x2="160" y2="100" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1.5" />
                                        </g>

                                        {/* Nodes */}
                                        <circle cx="40" cy="70" r="7" fill="#3B82F6" className="animate-pulse" />
                                        <circle cx="100" cy="40" r="7" fill="#06B6D4" />
                                        <circle cx="100" cy="100" r="7" fill="#3B82F6" />
                                        
                                        {/* Suspicious node (Red) */}
                                        <circle cx="160" cy="40" r="8" fill="#EF4444" className="animate-ping" />
                                        <circle cx="160" cy="40" r="8" fill="#EF4444" />
                                        
                                        <circle cx="160" cy="100" r="7" fill="#8B5CF6" />
                                        <circle cx="220" cy="70" r="7" fill="#10B981" />

                                        {/* Text Labels inside visualizer */}
                                        <text x="15" y="90" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="monospace">USER_IP</text>
                                        <text x="82" y="25" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="monospace">ACC_A</text>
                                        <text x="145" y="25" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="monospace">MULE_ACC (ALERT)</text>
                                        <text x="210" y="90" fill="#10B981" fontSize="8" fontWeight="bold" fontFamily="monospace">SAFE_RECV</text>
                                    </svg>
                                    <div className="text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                        MENGANALISIS TOPOLOGI RELASI AKUN...
                                    </div>
                                </div>
                            )}

                            {modalType === "lightgbm" && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                    <svg className="w-full max-w-sm h-36" viewBox="0 0 260 140">
                                        <g stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1">
                                            <line x1="20" y1="70" x2="80" y2="40" />
                                            <line x1="20" y1="70" x2="80" y2="100" />
                                            <line x1="80" y1="40" x2="130" y2="25" />
                                            <line x1="80" y1="40" x2="130" y2="55" />
                                            <line x1="80" y1="100" x2="130" y2="85" />
                                            <line x1="80" y1="100" x2="130" y2="115" />
                                        </g>
                                        <circle cx="20" cy="70" r="5" fill="#3B82F6" />
                                        <text x="15" y="85" fill="#94A3B8" fontSize="7" fontFamily="monospace">INPUT</text>
                                        
                                        <circle cx="80" cy="40" r="6" fill="#8B5CF6" />
                                        <circle cx="80" cy="100" r="6" fill="#8B5CF6" />
                                        
                                        <rect x="130" y="18" width="80" height="12" rx="3" fill="#EF4444" opacity="0.8" />
                                        <text x="135" y="27" fill="#FFF" fontSize="6" fontFamily="monospace">Account Takeover</text>
                                        
                                        <rect x="130" y="48" width="80" height="12" rx="3" fill="#FBBF24" opacity="0.8" />
                                        <text x="135" y="57" fill="#FFF" fontSize="6" fontFamily="monospace">Money Mule</text>

                                        <rect x="130" y="78" width="80" height="12" rx="3" fill="#10B981" opacity="0.8" />
                                        <text x="135" y="87" fill="#FFF" fontSize="6" fontFamily="monospace">Legitimate</text>

                                        <rect x="130" y="108" width="80" height="12" rx="3" fill="#06B6D4" opacity="0.8" />
                                        <text x="135" y="117" fill="#FFF" fontSize="6" fontFamily="monospace">Identity Theft</text>
                                    </svg>
                                    <div className="text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                        KLASIFIKASI ANCAMAN MULTIKELAS AKTIF...
                                    </div>
                                </div>
                            )}

                            {modalType === "ensemble" && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                    <svg className="w-full max-w-sm h-36" viewBox="0 0 260 140">
                                        <rect x="10" y="15" width="60" height="20" rx="4" fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" strokeWidth="1" />
                                        <text x="15" y="28" fill="#3B82F6" fontSize="7" fontWeight="bold">XGBoost (82%)</text>
                                        
                                        <rect x="10" y="55" width="60" height="20" rx="4" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="1" />
                                        <text x="12" y="68" fill="#A78BFA" fontSize="7" fontWeight="bold">LightGBM (99%)</text>

                                        <rect x="10" y="95" width="60" height="20" rx="4" fill="rgba(6, 182, 212, 0.2)" stroke="#06B6D4" strokeWidth="1" />
                                        <text x="18" y="108" fill="#06B6D4" fontSize="7" fontWeight="bold">GNN ML (85%)</text>

                                        <g stroke="rgba(167, 139, 250, 0.5)" strokeWidth="1.5">
                                            <line x1="70" y1="25" x2="130" y2="65" />
                                            <line x1="70" y1="65" x2="130" y2="65" />
                                            <line x1="70" y1="105" x2="130" y2="65" />
                                        </g>

                                        <rect x="130" y="50" width="70" height="30" rx="6" fill="#8B5CF6" />
                                        <text x="135" y="65" fill="#FFF" fontSize="7" fontWeight="bold">META-LEARNER</text>
                                        <text x="135" y="75" fill="#C4B5FD" fontSize="5" fontFamily="monospace">Logistic Reg.</text>

                                        <line x1="200" y1="65" x2="230" y2="65" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                                        
                                        <circle cx="235" cy="65" r="8" fill="#EF4444" />
                                        <text x="228" y="83" fill="#EF4444" fontSize="6" fontWeight="bold">BLOCKED</text>
                                    </svg>
                                    <div className="text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                        INTEGRASI META-LEARNER STACKING SELESAI...
                                    </div>
                                </div>
                            )}

                            {modalType === "xai" && (
                                <div className="w-full h-full flex flex-col justify-center space-y-4">
                                    <div className="space-y-3 px-4">
                                        <div className="text-[10px] font-mono font-bold text-dark-400 tracking-wider">SHAP VALUE ATRIBUT PENYEBAB FRAUD</div>
                                        {/* SHAP Bar 1 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-mono font-semibold text-dark-300">
                                                <span>Aktivitas Luar Jam Operasional</span>
                                                <span className="text-status-error">+0.38 (Tinggi)</span>
                                            </div>
                                            <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
                                                <div className="h-full bg-status-error w-[76%] transition-all duration-1000"></div>
                                            </div>
                                        </div>
                                        {/* SHAP Bar 2 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-mono font-semibold text-dark-300">
                                                <span>Deteksi Deviasi Perangkat (Device Drift)</span>
                                                <span className="text-status-error">+0.22 (Sedang)</span>
                                            </div>
                                            <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
                                                <div className="h-full bg-status-error w-[44%] transition-all duration-1000"></div>
                                            </div>
                                        </div>
                                        {/* SHAP Bar 3 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-mono font-semibold text-dark-300">
                                                <span>Rekam Jejak Bersih Akun</span>
                                                <span className="text-status-success">-0.15 (Aman)</span>
                                            </div>
                                            <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
                                                <div className="h-full bg-status-success w-[30%] transition-all duration-1000"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                        XAI EXPLAINABILITY SCORE GENERATED: 0.45 THRESHOLD EXCEEDED
                                    </div>
                                </div>
                            )}

                            {modalType === "biometrics" && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 relative py-4">
                                    {/* Scan Radar Visual */}
                                    <div className="relative w-24 h-24 flex items-center justify-center bg-dark-800 rounded-full border border-white/5 shadow-inner overflow-hidden">
                                        <Fingerprint className="w-12 h-12 text-neon-cyan animate-pulse" />
                                        {/* Scanning green line overlay */}
                                        <div className="absolute w-24 h-0.5 bg-neon-cyan/80 top-0 left-0 shadow-[0_0_10px_#06B6D4] animate-[bounce_3s_infinite]" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                            MEMINDAI DATA PERILAKU PENGGUNA...
                                        </div>
                                        <div className="text-[8px] font-mono text-dark-500 uppercase mt-1">
                                            Kecepatan Sapuan: 240px/s | Sudut Kemiringan: 14° | Kunci Keamanan Aktif
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalType === "bot" && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 relative py-4">
                                    <div className="relative w-20 h-20 flex items-center justify-center bg-dark-800 rounded-3xl border border-neon-cyan/30 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                                        <Bot className="w-10 h-10 text-neon-cyan animate-pulse" />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-status-success rounded-full border-2 border-dark-950 shadow-sm" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-mono font-bold text-neon-cyan tracking-wider uppercase animate-pulse">
                                            REMI AI AGENT ONLINE & SIAP MEMBANTU ANALIS...
                                        </div>
                                        <div className="text-[8px] font-mono text-dark-500 uppercase mt-1">
                                            Penjelasan Skor Risk | Panduan GNN & Biometrik | Respon Instan
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Technical Description Text */}
                        <div className="space-y-6 text-dark-300 text-sm leading-relaxed font-medium border-t border-white/10 pt-6">
                            {modalType === "gnn" && (
                                <>
                                    <p>
                                        <strong>Graph Neural Network (GNN)</strong> mengidentifikasi anomali siber dengan memproses data transaksi keuangan sebagai kesatuan graf raksasa. Node mewakili akun rekening, perangkat, lokasi IP, dan nomor telepon, sedangkan Edge mewakili riwayat transfer dana atau aktivitas login.
                                    </p>
                                    <p>
                                        Sistem ini melacak pola transaksi melingkar yang tidak lazim secara bertahap dan terenkripsi. Bahkan jika sindikat fraud memecah dana ke dalam 10 akun perantara (*mule accounts*) yang berbeda dalam hitungan detik, GNN mendeteksi sirkularitas transaksi tersebut dengan latensi di bawah 40 milidetik dan akurasi deteksi mencapai 98.4%.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Algoritma: GraphSAGE + Relational Graph Convolutional Networks (R-GCN)</li>
                                        <li>Skalabilitas: Analisis subgraph hingga 5-Hop transfer relasi</li>
                                        <li>Manfaat: Pemblokiran seketika pada sindikat penipuan & pencucian uang</li>
                                    </ul>
                                </>
                            )}

                            {modalType === "lightgbm" && (
                                <>
                                    <p>
                                        <strong>LightGBM Multiclass Classifier</strong> melangkah lebih jauh dari sekadar mendeteksi apakah sebuah transaksi mencurigakan atau tidak. Model ini mengkategorikan secara tepat jenis taktik fraud yang sedang dicoba berdasarkan sinyal numerik dan kategorikal.
                                    </p>
                                    <p>
                                        Dengan kecepatan pelatihan dan inferensi yang super cepat (Light Gradient Boosting Machine), model ini menganalisis 43 parameter fitur transaksi secara instan untuk melacak tanda-tanda spesifik dari serangan *Account Takeover* (Pengambilalihan Akun), *Money Mule* (Akun Rekening Keledai), *Aggregation Fraud*, hingga *Identity Theft* (Pencurian Identitas).
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Algoritma: Light Gradient Boosting Machine (Multiclass)</li>
                                        <li>Kategori: 5 Target Kelas Penipuan Finansial</li>
                                        <li>Manfaat: Penanganan insiden penipuan otomatis yang disesuaikan secara real-time</li>
                                    </ul>
                                </>
                            )}

                            {modalType === "ensemble" && (
                                <>
                                    <p>
                                        <strong>Ensemble Final Stacker (Meta-Learner)</strong> adalah koordinator keputusan dari arsitektur multi-model FraudGuard-AI. Menyadari bahwa setiap model memiliki kekuatan uniknya masing-masing, Meta-Learner menyeimbangkan semua keputusan model secara adil.
                                    </p>
                                    <p>
                                        Skor probabilitas dari model **XGBoost (Binary)**, **LightGBM (Multiclass)**, dan **Graph Neural Network (GNN)** disatukan sebagai array input fitur baru, lalu dianalisis oleh algoritma **Logistic Regression** meta-level. Ini menghilangkan bias model tunggal dan memastikan false-positive ditekan hingga titik terendah.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Metodologi: Stacking Classifier Meta-Learning</li>
                                        <li>Base Models: XGBoost Binary + LightGBM Multiclass + Relational Graph GNN</li>
                                        <li>Manfaat: Stabilitas dan konsistensi deteksi fraud di bawah anomali drift data</li>
                                    </ul>
                                </>
                            )}

                            {modalType === "xai" && (
                                <>
                                    <p>
                                        <strong>Explainable AI (XAI)</strong> menjembatani kesenjangan keputusan antara kecerdasan buatan (*black-box model*) dan kebutuhan regulasi kepatuhan finansial. Setiap transaksi yang ditandai sebagai fraud tidak hanya dinilai secara angka, tetapi disertai alasan pendukung yang jelas.
                                    </p>
                                    <p>
                                        Dengan menggunakan integrasi algoritma nilai **SHAP (SHapley Additive exPlanations)**, platform menyajikan visualisasi kontribusi persis dari setiap parameter risiko (misal: geolokasi anomali memberikan bobot risiko +30%, sedangkan otentikasi biometrik yang valid mengurangi bobot risiko -15%). Hal ini memudahkan auditor kepatuhan dan analis fraud melakukan verifikasi manual tanpa keraguan.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Kepatuhan Regulasi: Sesuai standar ISO 27001, OJK, dan Bank Indonesia</li>
                                        <li>Keluaran Data: JSON SHAP values & ringkasan bahasa natural (NLP)</li>
                                        <li>Manfaat: Mengurangi tingkat False Positive hingga 89%</li>
                                    </ul>
                                </>
                            )}

                            {modalType === "biometrics" && (
                                <>
                                    <p>
                                        <strong>Biometrik Lanjutan</strong> melampaui otentikasi biometrik statis tradisional (sidik jari atau pemindaian wajah dasar) dengan mengintegrasikan **Behavioral Biometrics** (Biometrik Perilaku).
                                    </p>
                                    <p>
                                        Sistem secara dinamis menganalisis parameter fisik pengguna saat berinteraksi dengan aplikasi keuangan, seperti gaya sapuan layar (*swipe patterns*), kecepatan mengetik kode PIN, hingga sudut kemiringan ponsel saat bertransaksi. Profil unik ini diidentifikasi secara berkelanjutan untuk mencegah fraud pembajakan akun dan serangan pengambilalihan sesi jarak jauh (*remote access hijack*).
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Parameter: Kecepatan keystroke, arah usapan, & rasio sentuhan jari</li>
                                        <li>Proteksi Bot: Deteksi seketika serangan simulator makro dan bot otomatis</li>
                                        <li>Manfaat: Menolak akses berbahaya tanpa merusak kenyamanan pengguna asli</li>
                                    </ul>
                                </>
                            )}

                            {modalType === "bot" && (
                                <>
                                    <p>
                                        <strong>REMI AI Chatbot Assistant</strong> adalah asisten inteligensi siber interaktif yang terintegrasi melayang di seluruh dasbor operasional FraudGuard-AI.
                                    </p>
                                    <p>
                                        REMI dirancang untuk memandu analis finansial dan tim investigasi dalam membedah alasan keputusan model ML, memahami topologi graf GNN, dan mendapatkan rekomendasi langkah mitigasi insiden secara langsung tanpa harus meninggalkan halaman kerja.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-neon-cyan">
                                        <li>Kemampuan: Tanya-jawab real-time seputar indikator fraud, skor ATO, dan telemetri SDK</li>
                                        <li>Integrasi: Widget melayang responsive dengan deteksi klik luar (auto-close)</li>
                                        <li>Manfaat: Mempercepat waktu respon investigasi analis (MTTR) hingga 65%</li>
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setModalType(null)}
                                className="px-6 py-3 rounded-xl bg-white text-dark-900 hover:bg-primary-blue hover:text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Selesai Membaca
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
