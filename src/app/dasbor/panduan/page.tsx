"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen, LayoutDashboard, Search, Activity, FileText,
  TestTube2, Cpu, Bot, ShieldAlert, CheckCircle2, ArrowRight,
  Zap, Layers, Terminal, Lock, ChevronRight, Server, Network
} from "lucide-react";

export default function PanduanPage() {
  const [activeTab, setActiveTab] = useState<
    "ikhtisar" | "ringkasan" | "investigasi" | "transaksi" | "simulasi" | "sdk" | "laporan" | "remi"
  >("ikhtisar");

  const tabs = [
    { id: "ikhtisar", label: "Arsitektur & Ikhtisar", icon: <Layers className="w-4 h-4" /> },
    { id: "ringkasan", label: "Ringkasan Dasbor", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "investigasi", label: "Ruang Investigasi & XAI", icon: <Search className="w-4 h-4" /> },
    { id: "transaksi", label: "Transaksi Live", icon: <Activity className="w-4 h-4" /> },
    { id: "simulasi", label: "Sandbox Simulasi", icon: <TestTube2 className="w-4 h-4" /> },
    { id: "sdk", label: "Mobile SDK Telemetry", icon: <Cpu className="w-4 h-4" /> },
    { id: "laporan", label: "Laporan Audit PDF", icon: <FileText className="w-4 h-4" /> },
    { id: "remi", label: "Asisten REMI AI", icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-900 via-blue-950/60 to-dark-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-blue/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pusat Dokumentasi & Operasional FDS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Panduan Lengkap <span className="text-neon-cyan italic">Amankan Fraud AI</span>
            </h1>
            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed font-medium">
              Dokumentasi resmi alur kerja, integrasi Mobile Telemetry SDK, arsitektur Machine Learning Ensemble (XGBoost, LightGBM, GNN), serta panduan penggunaan seluruh fitur Dasbor FDS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dasbor/ringkasan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan text-dark-950 font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-neon-cyan/20"
            >
              <span>Ke Dasbor Utama</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${activeTab === tab.id
              ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-md shadow-neon-cyan/10"
              : "bg-dark-900/60 hover:bg-white/5 text-dark-300 hover:text-white border-white/10"
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Ikhtisar & Arsitektur */}
      {activeTab === "ikhtisar" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-6 h-6 text-neon-cyan" />
              Arsitektur Sistem Deteksi Fraud (End-to-End Flow)
            </h2>
            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed">
              Amankan Fraud AI beroperasi dengan arsitektur multi-layer latensi rendah (&lt;50ms) yang mengombinasikan sinyal biometrik perangkat ponsel, pemrosesan event stream real-time, dan ensemble model AI tercanggih.
            </p>

            {/* Visual Flow Diagram */}
            <div className="p-6 rounded-2xl bg-dark-950 border border-white/10 space-y-4">
              <span className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-neon-cyan" />
                <span>Diagram Alur Pemrosesan Transaksi:</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-dark-900 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-mono font-bold text-xs mb-3">
                      01
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Mobile Telemetry SDK</h4>
                    <p className="text-[11px] text-dark-400">Ekstraksi sinyal ketikan, tilt, tekanan sentuhan, & deteksi AnyDesk di perangkat nasabah.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-neon-cyan">
                    Latensi &lt;10ms
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
                      02
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Apache Kafka Event Bus</h4>
                    <p className="text-[11px] text-dark-400">Streaming transaksi berkecepatan tinggi (&gt;10.000 TPS) tanpa resiko antrean tersumbat.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400">
                    Throughput High-TPS
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-hyper-violet/10 border border-hyper-violet/30 flex items-center justify-center text-hyper-violet font-mono font-bold text-xs mb-3">
                      03
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">AI Ensemble Inference</h4>
                    <p className="text-[11px] text-dark-400">Skoring XGBoost, LightGBM Multiclass, & Graph Neural Network (GNN Mule Ring).</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-hyper-violet">
                    FPR Ultra-Low 0.54%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs mb-3">
                      04
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Action & Mongo Atlas</h4>
                    <p className="text-[11px] text-dark-400">Keputusan otomatis (Blokir / Review / Izinkan), penyimpanan log MongoDB, & trigger alert.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-amber-400">
                    Keputusan &lt;50ms
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-dark-400 uppercase">Akurasi XGBoost (F1-Score)</span>
                <div className="text-xl font-black text-neon-cyan">81.48% (FPR 0.54%)</div>
              </div>
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-dark-400 uppercase">Kepatuhan Regulasi</span>
                <div className="text-xl font-black text-emerald-400">POJK 39 & UU PDP</div>
              </div>
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-dark-400 uppercase">Target Industri</span>
                <div className="text-xl font-black text-hyper-violet">Perbankan & Fintech</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ringkasan Dasbor */}
      {activeTab === "ringkasan" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-neon-cyan" />
                Fitur Ringkasan Dasbor Utama (/dasbor/ringkasan)
              </h2>
              <Link href="/dasbor/ringkasan" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neon-cyan" />
                  1. Metric Cards Real-Time
                </h4>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Menampilkan statistik total volume transaksi 24 jam, persentase fraud terdeteksi, total nilai transaksi diselamatkan (dalam Rupiah), serta rata-rata skor risiko sistem.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  2. Live Health Status Server
                </h4>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Indikator kesehatan real-time untuk Next.js Web App, Python ML Inference Server (FastAPI), Apache Kafka Event Broker, dan MongoDB Atlas Database Cloud.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  3. Feed Live Alert Teratas
                </h4>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Daftar transaksi berisiko paling tinggi yang membutuhkan perhatian cepat analis, dilengkapi tombol aksi pintas menuju Ruang Investigasi.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-hyper-violet" />
                  4. Banner Tur Interaktif
                </h4>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Fitur pemandu untuk pengguna baru yang menyajikan 5 langkah penjelasan visual mengenai alur kerja sistem FDS Amankan Fraud.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Ruang Investigasi */}
      {activeTab === "investigasi" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-hyper-violet" />
                Ruang Investigasi & Transparansi XAI (/dasbor/investigasi)
              </h2>
              <Link href="/dasbor/investigasi" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed">
              Halaman ini digunakan oleh Analis FDS untuk membedah transaksi berisiko tinggi secara detail dengan fitur-fitur canggih:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-hyper-violet/10 text-hyper-violet shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Explainable AI (SHAP & LIME Feature Importance)</h4>
                  <p className="text-xs text-dark-300 leading-relaxed">
                    Menyajikan rincian variabel penyebab skor tinggi (seperti frekuensi transfer abnormal, pergantian PIN mendadak, atau sinyal AnyDesk) sehingga keputusan AI tidak menjadi "black box".
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-neon-cyan/10 text-neon-cyan shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Visualisasi Topologi GNN (Money Mule Ring)</h4>
                  <p className="text-xs text-dark-300 leading-relaxed">
                    Menampilkan grafik hubungan antar rekening penampung untuk melacak pola aliran dana hasil kejahatan pencucian uang secara visual.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Action Engine (Pembekuan Akun & Whitelist)</h4>
                  <p className="text-[12px] text-dark-300 leading-relaxed">
                    Analis dapat mengeksekusi tindakan langsung seperti <strong>Bekukan Rekening Sementara</strong>, <strong>Kirim Peringatan OTP</strong>, atau <strong>Tambahkan ke Whitelist</strong> dengan pencatatan audit trail otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Transaksi Live */}
      {activeTab === "transaksi" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-400" />
                Streaming Transaksi Live (/dasbor/transaksi)
              </h2>
              <Link href="/dasbor/transaksi" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">1. Live Feed Table</span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Tabel transaksi yang terus diperbarui secara otomatis dari MongoDB Atlas dan Kafka Event Stream tanpa perlu reload halaman.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-neon-cyan uppercase block">2. Filter Risk Category</span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Pilah transaksi secara instan berdasarkan status risiko: <strong>Aman (Low Risk)</strong>, <strong>Review (Medium Risk)</strong>, atau <strong>Ditolak (High Risk)</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase block">3. Inspection Drawer</span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Klik baris transaksi apa saja untuk membuka panel samping yang berisi rincian rekening pengirim, penerima, format pembayaran, dan sinyal telemetri.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sandbox Simulasi */}
      {activeTab === "simulasi" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <TestTube2 className="w-6 h-6 text-amber-400" />
                Sandbox Simulasi Transaksi (/dasbor/simulasi)
              </h2>
              <Link href="/dasbor/simulasi" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed">
              Fasilitas pengujian bagi penguji / juri untuk mensimulasikan berbagai skenario transaksi fraud dan melihat respons deteksi model ML secara real-time.
            </p>

            <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Skenario Fraud Siap Uji (1-Klik Preset):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <span className="font-bold text-neon-cyan flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-status-error shrink-0" />
                    <span>Skenario Account Takeover (ATO)</span>
                  </span>
                  Pergantian PIN cepat diikuti transfer nominal besar ke rekening tidak dikenal.
                </div>
                <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Skenario Money Mule Ring</span>
                  </span>
                  Pola transfer berulang pecahan kecil ke jaringan penampung dana.
                </div>
                <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Skenario Remote Desktop (AnyDesk)</span>
                  </span>
                  Sinyal telemetri AnyDesk aktif dengan eksekusi tanpa jeda ketikan.
                </div>
                <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Skenario Transaksi Normal</span>
                  </span>
                  Perilaku transaksi wajar nasabah tanpa indikator risiko.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Mobile SDK Telemetry */}
      {activeTab === "sdk" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-neon-cyan" />
                Mobile SDK Telemetry & Biometrik Perilaku (/dasbor/simulasi-sdk)
              </h2>
              <Link href="/dasbor/simulasi-sdk" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed">
              Simulasi pengujian Mobile Telemetry SDK yang diekstrak langsung dari sensor smartphone nasabah untuk menangkap fraud sebelum transaksi dikirim.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white text-neon-cyan">Sinyal Biometrik Perilaku (Behavioral Biometrics)</h4>
                <ul className="text-xs text-dark-300 space-y-2 list-disc list-inside">
                  <li><strong>Dwell Time:</strong> Durasi penekanan setiap tombol pada keyboard.</li>
                  <li><strong>Flight Time:</strong> Jeda waktu antar ketikan huruf.</li>
                  <li><strong>Touch Pressure:</strong> Tingkat tekanan sentuhan layar.</li>
                  <li><strong>Gyroscope Tilt:</strong> Kemiringan sumbu X & Y smartphone.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white text-amber-400">Deteksi Malware & Remote Desktop</h4>
                <ul className="text-xs text-dark-300 space-y-2 list-disc list-inside">
                  <li><strong>AnyDesk & TeamViewer:</strong> Deteksi aktifnya aplikasi pengontrol layar jarak jauh.</li>
                  <li><strong>Rooted / Jailbroken Device:</strong> Deteksi modifikasi sistem operasi.</li>
                  <li><strong>Emulator Detection:</strong> Identifikasi eksekusi pada simulator Android/iOS.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Laporan Audit PDF */}
      {activeTab === "laporan" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-400" />
                Laporan Audit PDF & Compliance POJK (/dasbor/laporan)
              </h2>
              <Link href="/dasbor/laporan" className="text-xs font-mono font-bold text-neon-cyan hover:underline flex items-center gap-1">
                <span>Buka Halaman</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Fitur Ekspor Laporan 1-Klik Berstandar Regulasi
              </h4>
              <p className="text-xs text-dark-300 leading-relaxed">
                Menghasilkan berkas Laporan Audit PDF komprehensif yang memuat statistik deteksi, daftar transaksi berisiko tinggi, log tindakan analis, serta pemenuhan standar regulasi <strong>POJK No. 39/POJK.03/2019</strong> dan <strong>UU Perlindungan Data Pribadi (UU PDP)</strong> untuk diserahkan ke IASC OJK/BI dan PPATK.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Asisten REMI AI */}
      {activeTab === "remi" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-dark-900/80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-neon-cyan" />
                REMI AI Assistant (Widget Melayang Kanan Bawah)
              </h2>
            </div>

            <p className="text-dark-300 text-xs sm:text-sm leading-relaxed">
              Asisten kecerdasan buatan berbasis Multi-Model AI yang siap membantu analis 24/7 langsung di dasbor:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-neon-cyan block">1. REMI AI Engine</span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Analisis transaksi spesifik di database, pencarian ID transaksi, dan ringkasan risiko.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block">2. Groq (Llama 3.3 70B)</span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Konsultasi regulasi finansial POJK 39, hukum siber, dan prosedur pembekuan rekening OJK.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-hyper-violet block">3. Gemini 3.6 Flash, Gemini 2.5 Flash & Pro </span>
                <p className="text-xs text-dark-300 leading-relaxed">
                  Tips edukasi keamanan m-banking, proteksi malware AnyDesk, dan otentikasi biometrik.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
