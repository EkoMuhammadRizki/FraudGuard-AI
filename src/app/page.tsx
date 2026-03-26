import Navigasi from "@/komponen/bersama/navigasi";
import Footer from "@/komponen/bersama/footer";
import Hero from "@/komponen/landing/hero";
import Fitur from "@/komponen/landing/fitur";

export default function HalamanLanding() {
  return (
    <main className="bg-dark-900 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      <Navigasi />
      <Hero />
      <Fitur />

      {/* CTA Section */}
      <section id="tentang" className="py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-blue/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-panel p-16 md:p-24 rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
              Siap Mengamankan <br />
              <span className="text-neon-cyan">Ekosistem Anda?</span>
            </h2>
            
            <p className="text-dark-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Bergabung dengan ribuan institusi finansial yang telah memangkas false-positive rate hingga 89%. Integrasi dalam hitungan menit, perlindungan seumur hidup.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/daftar"
                className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white text-dark-900 hover:bg-neon-cyan hover:text-white font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                Mulai Uji Coba Gratis
              </a>
              <a
                href="#kontak"
                className="w-full sm:w-auto px-12 py-5 rounded-2xl glass-panel border-white/10 hover:bg-white/5 text-white font-bold text-lg transition-all"
              >
                Hubungi Tim Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
