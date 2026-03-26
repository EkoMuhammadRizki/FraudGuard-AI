import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "./logo";

export default function Footer() {
    return (
        <footer id="kontak" className="border-t border-dark-700/50 bg-dark-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <Logo size="sm" className="scale-90 origin-left" />
                        </div>
                        <p className="text-dark-400 text-sm leading-relaxed mb-6">
                            Platform deteksi fraud digital real-time dengan kecerdasan buatan terdepan untuk melindungi transaksi keuangan Anda.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {["twitter", "linkedin", "github"].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-9 h-9 rounded bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-400 hover:text-primary-blue-light transition-all duration-200"
                                >
                                    <span className="text-xs font-semibold uppercase">{social[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Produk */}
                    <div>
                        <h4 className="text-sm font-semibold text-dark-100 uppercase tracking-wider mb-4">Produk</h4>
                        <ul className="space-y-3">
                            {["Deteksi Real-time", "Analisis GNN", "Explainable AI", "Biometrik"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-dark-400 hover:text-primary-blue-light transition-colors text-sm">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Perusahaan */}
                    <div>
                        <h4 className="text-sm font-semibold text-dark-100 uppercase tracking-wider mb-4">Perusahaan</h4>
                        <ul className="space-y-3">
                            {["Tentang Kami", "Karir", "Blog", "Keamanan"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-dark-400 hover:text-primary-blue-light transition-colors text-sm">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kontak */}
                    <div>
                        <h4 className="text-sm font-semibold text-dark-100 uppercase tracking-wider mb-4">Kontak</h4>
                        <ul className="space-y-3 text-sm text-dark-400">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary-blue-light shrink-0" strokeWidth={2} />
                                info@fraudguard.ai
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary-blue-light shrink-0" strokeWidth={2} />
                                +62 21 1234 5678
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                                Jakarta, Indonesia
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-dark-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-dark-500 text-sm">
                        © 2026 FraudGuard AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-dark-500">
                        <a href="#" className="hover:text-dark-300 transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-dark-300 transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
