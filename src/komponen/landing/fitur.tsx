import { Network, BrainCircuit, Fingerprint, ArrowRight } from "lucide-react";

export default function Fitur() {
    const fiturList = [
        {
            icon: <Network className="w-6 h-6" strokeWidth={2} />,
            title: "Graph Neural Network (GNN)",
            description: "Menganalisis topologi jaringan transaksi untuk mengidentifikasi pola fraud tersembunyi dengan akurasi tinggi.",
        },
        {
            icon: <BrainCircuit className="w-6 h-6" strokeWidth={2} />,
            title: "Explainable AI (XAI)",
            description: "Menyediakan transparansi penuh untuk setiap keputusan AI, memastikan validasi dan audit trail yang akuntabel.",
        },
        {
            icon: <Fingerprint className="w-6 h-6" strokeWidth={2} />,
            title: "Biometrik Lanjutan",
            description: "Lapis keamanan ekstra dengan pengenalan wajah, deteksi sidik jari, dan profiling kebiasaan pengguna secara mulus.",
        },
    ];

    return (
        <section id="fitur" className="py-24 bg-dark-900 border-t border-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-dark-100 mb-4 tracking-tight">
                        Infrastruktur Solusi
                    </h2>
                    <p className="text-dark-400 text-lg max-w-2xl leading-relaxed">
                        Arsitektur deteksi fraud berlapis yang dirancang khusus untuk memproteksi ekosistem digital skala enterprise.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {fiturList.map((fitur, index) => (
                        <div
                            key={fitur.title}
                            className="card-minimal p-8 hover:border-primary-blue transition-colors group"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded bg-dark-700 flex items-center justify-center text-primary-blue-light mb-6 group-hover:bg-primary-blue group-hover:text-white transition-colors">
                                {fitur.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-dark-100 mb-3">{fitur.title}</h3>
                            <p className="text-dark-400 leading-relaxed text-sm mb-6">{fitur.description}</p>

                            {/* Link */}
                            <div className="flex items-center gap-2 text-primary-blue text-sm font-semibold">
                                Pelajari Detail Sistem
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secondary Feature List */}
                <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-dark-800">
                    {[
                        { title: "Pemrosesan &lt;50ms", desc: "Verifikasi tanpa delay" },
                        { title: "Enkripsi E2E", desc: "Standar keamanan militer" },
                        { title: "Skalabilitas", desc: "Mampu melayani 10k TPS" },
                        { title: "Kepatuhan", desc: "Standardisasi ISO 27001" },
                    ].map((item) => (
                        <div key={item.title}>
                            <div className="text-dark-100 font-bold mb-1">{item.title}</div>
                            <div className="text-dark-400 text-sm">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
