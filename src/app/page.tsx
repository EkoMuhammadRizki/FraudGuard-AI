"use client";
import React, { useEffect } from "react";
import Navigasi from "@/komponen/bersama/navigasi";
import Footer from "@/komponen/bersama/footer";
import Hero from "@/komponen/landing/hero";
import Fitur from "@/komponen/landing/fitur";
import { Lock, Fingerprint, ClipboardList, ShieldCheck, Shield, ShieldOff } from "lucide-react";

export default function HalamanLanding() {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let revealElements: NodeListOf<Element>;

    const initObserver = () => {
      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.05,
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer?.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements = document.querySelectorAll(".reveal-on-scroll");
      revealElements.forEach((el) => {
        observer?.observe(el);
        el.classList.add("revealed");
      });
    };

    initObserver();

    return () => {
      if (observer) {
        revealElements?.forEach((el) => observer?.unobserve(el));
      }
    };
  }, []);

  return (
    <main className="bg-dark-900 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      <Navigasi />
      <Hero />
      <Fitur />

      {/* Tentang Kami Section */}
      <section id="tentang" className="py-16 sm:py-24 relative reveal-on-scroll">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-hyper-violet/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hyper-violet/10 border border-hyper-violet/30 text-hyper-violet text-[10px] font-mono uppercase tracking-widest mb-4">
              <span>Tentang Kami</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Tim Di Balik <span className="text-neon-cyan">Amankan Fraud</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-dark-300 text-base sm:text-lg leading-relaxed">
                Amankan Fraud adalah platform Real-Time Fraud Detection System (FDS) perbankan generasi baru yang dikembangkan oleh tim FDS AI & Cyber Security.
              </p>
              <p className="text-dark-400 leading-relaxed">
                Kami menggabungkan kekuatan Machine Learning Ensemble (XGBoost, LightGBM, Graph Neural Network) dengan Biometric Mobile Telemetry SDK untuk memberikan perlindungan fraud real-time yang belum pernah ada sebelumnya.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass-panel p-4 rounded-2xl border-white/5">
                  <p className="text-2xl font-black text-neon-cyan">89%</p>
                  <p className="text-xs text-dark-400 font-medium">Pengurangan False Positive</p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border-white/5">
                  <p className="text-2xl font-black text-neon-cyan">&lt;10ms</p>
                  <p className="text-xs text-dark-400 font-medium">Latensi Deteksi Real-time</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-8 rounded-3xl border-white/5">
              <h3 className="text-lg font-black text-white mb-4">Tim Pengembang</h3>
              <ul className="space-y-4">
                {[
                  { name: "Eko Muhammad Rizki", role: "Lead Developer", photo: "/foto-eko.jpg" },
                  { name: "Ihya Abdillah", role: "Fullstack Developer", photo: "/foto-ihya.jpg" },
                  { name: "Muhammad Muhibin", role: "Data Engineer", photo: "/foto-muhibin.jpg" },
                  { name: "Reza Asriano", role: "Machine Learning Engineer", photo: "/foto-reza.jpg" },
                ].map((member) => (
                  <li key={member.name} className="flex items-center gap-4">
                    {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-blue to-hyper-violet flex items-center justify-center text-white text-sm font-black">
                        {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-xs text-dark-400">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Keamanan Section */}
      <section id="keamanan" className="py-16 sm:py-24 relative reveal-on-scroll">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono uppercase tracking-widest mb-4">
              <span>Keamanan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Keamanan <span className="text-neon-cyan">Tingkat Lanjut</span>
            </h2>
            <p className="text-dark-400 mt-4 max-w-2xl mx-auto">
              Perlindungan berlapis dengan standar keamanan tertinggi untuk menjaga data dan transaksi Anda tetap aman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Enkripsi End-to-End",
                desc: "Semua data transaksi dienkripsi dengan AES-256 dari awal hingga akhir, memastikan tidak ada akses tidak sah di sepanjang jalur data.",
                icon: Lock,
              },
              {
                title: "Autentikasi Biometrik",
                desc: "Verifikasi identitas menggunakan sidik jari, wajah, dan perilaku pengguna untuk akses yang aman dan personal.",
                icon: Fingerprint,
              },
              {
                title: "Audit Trail Lengkap",
                desc: "Setiap keputusan AI dilacak dan dapat diaudit secara transparan melalui teknologi Explainable AI (XAI).",
                icon: ClipboardList,
              },
              {
                title: "Compliance & Regulasi",
                desc: "Mematuhi standar PCI DSS, GDPR, dan regulasi OJK untuk keamanan data keuangan nasional.",
                icon: ShieldCheck,
              },
              {
                title: "Real-time Threat Intel",
                desc: "Pembaruan ancaman secara otomatis dari jaringan global untuk menghadapi fraud terkini.",
                icon: Shield,
              },
              {
                title: "Zero Trust Architecture",
                desc: "Prinsip keamanan zero trust memastikan setiap akses diverifikasi tanpa memandang lokasi atau jaringan.",
                icon: ShieldOff,
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-neon-cyan/20 transition-all group">
                <div className="mb-4">
                  <item.icon className="w-8 h-8 text-neon-cyan" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-black text-white mb-2 group-hover:text-neon-cyan transition-colors">{item.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-16 sm:py-32 relative reveal-on-scroll">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-blue/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-panel p-8 sm:p-12 md:p-20 lg:p-24 rounded-[2rem] sm:rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-tight">
              Siap Mengamankan <br />
              <span className="text-neon-cyan">Ekosistem Anda?</span>
            </h2>
            
            <p className="text-dark-300 text-base sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Bergabung dengan ribuan institusi finansial yang telah memangkas false-positive rate hingga 89%. Integrasi dalam hitungan menit, perlindungan seumur hidup.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/daftar"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-dark-900 hover:bg-primary-blue hover:text-white font-bold text-base transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                Mulai Uji Coba Gratis
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
