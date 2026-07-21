"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Cpu, Database, Terminal, Check } from "lucide-react";

interface ModalSumberDataProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalSumberData({ isOpen, onClose }: ModalSumberDataProps) {
    const [showTransparency, setShowTransparency] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
            {/* Modal Container */}
            <div className="relative bg-[#0b1329] border border-white/10 rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                
                {/* Glow bar at top */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-85" />

                {/* Body Content */}
                <div className="p-8 md:p-10 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Badge INTEGRASI DATASET */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-[10px] font-black tracking-widest uppercase border border-neon-cyan/30">
                        <Database className="w-3.5 h-3.5" />
                        Live MongoDB Atlas & Ensemble ML
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight uppercase">
                        Integrasi Real-time Database MongoDB & Engine AI
                    </h2>

                    {/* Description Paragraphs */}
                    <div className="space-y-4 text-xs font-bold text-dark-300 leading-relaxed font-sans">
                        <p>
                            Sistem dasbor ini terhubung secara langsung dengan database <span className="text-neon-cyan font-bold">MongoDB Atlas</span> (50.000 data transaksi riil industri perbankan) dan diproses oleh <span className="text-white font-bold">Live Machine Learning Inference Engine</span>.
                        </p>
                        <p>
                            Setiap transaksi dievaluasi secara otomatis oleh <span className="text-white font-bold">Ensemble 5 Model AI</span> (XGBoost, LightGBM Multiclass, Graph GNN, Meta-Learner Stacker, dan Mobile Telemetry SDK Model) dengan threshold operasional <span className="text-neon-cyan font-bold">33.74%</span>.
                        </p>
                        <p>
                            Lihat{" "}
                            <button
                                type="button"
                                onClick={() => setShowTransparency(!showTransparency)}
                                className="text-neon-cyan hover:text-cyan-300 font-extrabold underline underline-offset-2 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                Architecture & Detail Model
                                {showTransparency ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                )}
                            </button>{" "}
                            untuk melihat spesifikasi 5 model ML dan sumber koleksi MongoDB Atlas.
                        </p>
                    </div>

                    {/* Collapsible Algorithm Transparency Info */}
                    {showTransparency && (
                        <div className="mt-4 p-5 rounded-2xl bg-dark-950/60 border border-white/10 space-y-4 animate-fade-in text-[11px] font-medium leading-relaxed text-dark-300">
                            
                            {/* Database Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-neon-cyan font-bold uppercase tracking-wider">
                                    <Database className="w-3.5 h-3.5" />
                                    <span>Database MongoDB Atlas</span>
                                </div>
                                <p className="text-dark-400 pl-5">
                                    Koleksi <span className="text-white font-bold">transactions</span> dalam database <span className="text-white font-bold">fraud_detection</span> menyimpan 50.000 dokumen histori transaksi keuangan riil perbankan.
                                </p>
                            </div>

                            {/* Model Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-hyper-violet font-bold uppercase tracking-wider">
                                    <Cpu className="w-3.5 h-3.5" />
                                    <span>Pipeline 5 Model Machine Learning</span>
                                </div>
                                <p className="text-dark-400 pl-5">
                                    Menggabungkan <span className="text-white font-bold">XGBoost Binary</span> (deteksi deviasi nominal), <span className="text-white font-bold">LightGBM Multiclass</span> (klasifikasi tipe fraud), <span className="text-white font-bold">Graph GNN</span> (topologi jaringan), <span className="text-white font-bold">Meta-Learner Stacker</span>, dan <span className="text-white font-bold">SDK Behavioral ML</span> (telemetri ketikan/perangkat).
                                </p>
                            </div>

                            {/* Telemetry Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-status-success font-bold uppercase tracking-wider">
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Mobile Telemetry SDK</span>
                                </div>
                                <p className="text-dark-400 pl-5">
                                    Mendeteksi 9 parameter biometrik perilaku (dwell time, flight time, error rate, touch pressure, tilt axis) serta proteksi langsung terhadap aplikasi remote desktop AnyDesk dan perangkat rooted.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Saya Mengerti Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet hover:opacity-90 text-dark-950 font-black text-sm uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-neon-cyan/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" strokeWidth={3} />
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}
