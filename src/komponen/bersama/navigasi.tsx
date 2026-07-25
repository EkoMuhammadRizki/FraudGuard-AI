"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./logo";

export default function Navigasi() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        if ((window as any).__splashScreenFinished) {
            setIsAnimated(true);
        } else {
            const handleFinished = () => setIsAnimated(true);
            window.addEventListener("splashScreenFinished", handleFinished);
            return () => window.removeEventListener("splashScreenFinished", handleFinished);
        }
    }, []);

    // Close menu on link click (for smooth UX on mobile)
    const handleMobileLink = () => setMenuOpen(false);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center" onClick={handleMobileLink}>
                        <Logo size="md" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#fitur" className="text-dark-300 hover:text-primary-blue transition-colors text-sm font-medium">
                            Fitur
                        </a>
                        <a href="#tentang" className="text-dark-300 hover:text-primary-blue transition-colors text-sm font-medium">
                            Tentang
                        </a>
                        <a href="#kontak" className="text-dark-300 hover:text-primary-blue transition-colors text-sm font-medium">
                            Kontak
                        </a>
                        <Link
                            href="/login"
                            className="text-dark-300 hover:text-white transition-colors text-sm font-medium"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/daftar"
                            className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-medium transition-colors"
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* Mobile menu button — min 44px tap target */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2.5 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={menuOpen ? "Tutup Menu" : "Buka Menu"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <X className="w-5 h-5" strokeWidth={2} />
                        ) : (
                            <Menu className="w-5 h-5" strokeWidth={2} />
                        )}
                    </button>
                </div>

                {/* Mobile Nav — smooth height transition */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="border-t border-dark-700/50 py-4">
                        <div className="flex flex-col gap-1">
                            <a
                                href="#fitur"
                                onClick={handleMobileLink}
                                className="text-dark-300 hover:text-primary-blue hover:bg-dark-800 transition-colors px-4 py-3 text-sm font-medium rounded-xl"
                            >
                                Fitur
                            </a>
                            <a
                                href="#tentang"
                                onClick={handleMobileLink}
                                className="text-dark-300 hover:text-primary-blue hover:bg-dark-800 transition-colors px-4 py-3 text-sm font-medium rounded-xl"
                            >
                                Tentang
                            </a>
                            <a
                                href="#kontak"
                                onClick={handleMobileLink}
                                className="text-dark-300 hover:text-primary-blue hover:bg-dark-800 transition-colors px-4 py-3 text-sm font-medium rounded-xl"
                            >
                                Kontak
                            </a>
                            <div className="h-px bg-dark-700/50 my-2" />
                            <Link
                                href="/login"
                                onClick={handleMobileLink}
                                className="text-dark-300 hover:text-white hover:bg-dark-800 transition-colors px-4 py-3 text-sm font-medium rounded-xl"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/daftar"
                                onClick={handleMobileLink}
                                className="mx-1 text-center px-4 py-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-semibold transition-colors active:scale-[0.98]"
                            >
                                Daftar Gratis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
