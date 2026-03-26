"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./logo";

export default function Navigasi() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900 border-b border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Logo size="sm" className="scale-90" />
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
                            className="px-5 py-2 rounded bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-medium transition-colors"
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded text-dark-300 hover:text-white hover:bg-dark-700"
                    >
                        {menuOpen ? (
                            <X className="w-6 h-6" strokeWidth={2} />
                        ) : (
                            <Menu className="w-6 h-6" strokeWidth={2} />
                        )}
                    </button>
                </div>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div className="md:hidden border-t border-dark-700 py-4 animate-fade-in">
                        <div className="flex flex-col gap-3">
                            <a href="#fitur" className="text-dark-300 hover:text-primary-blue transition-colors px-3 py-2 text-sm font-medium">Fitur</a>
                            <a href="#tentang" className="text-dark-300 hover:text-primary-blue transition-colors px-3 py-2 text-sm font-medium">Tentang</a>
                            <a href="#kontak" className="text-dark-300 hover:text-primary-blue transition-colors px-3 py-2 text-sm font-medium">Kontak</a>
                            <Link href="/login" className="text-dark-300 hover:text-white transition-colors px-3 py-2 text-sm font-medium">Masuk</Link>
                            <Link href="/daftar" className="mx-3 text-center px-4 py-2 rounded bg-primary-blue text-white text-sm font-medium">Daftar</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
