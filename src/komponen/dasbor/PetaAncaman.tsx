"use client";
import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { geoRiskRegions } from "@/pustaka/data-fraudguard";

// Komponen kontrol kustom di dalam MapContainer untuk melakukan zoom dan melacak perpindahan mouse
function MapStateController({
    onMouseMove,
}: {
    onMouseMove: (lat: number, lng: number) => void;
}) {
    const map = useMap();

    useMapEvents({
        mousemove(e) {
            onMouseMove(e.latlng.lat, e.latlng.lng);
        },
    });

    // Mencegah klik tombol zoom kustom tembus ke peta Leaflet di belakangnya (dragging/clicking)
    const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-auto"
            onClick={stopPropagation}
            onDoubleClick={stopPropagation}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
        >
            <button
                onClick={() => map.zoomIn()}
                className="w-10 h-10 rounded-xl bg-dark-950/90 border border-white/10 hover:border-white/20 flex items-center justify-center text-white hover:text-neon-cyan active:scale-95 transition-all text-xl font-bold shadow-lg backdrop-blur-md cursor-pointer pointer-events-auto"
                title="Perbesar"
                type="button"
            >
                +
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="w-10 h-10 rounded-xl bg-dark-950/90 border border-white/10 hover:border-white/20 flex items-center justify-center text-white hover:text-neon-cyan active:scale-95 transition-all text-xl font-bold shadow-lg backdrop-blur-md cursor-pointer pointer-events-auto"
                title="Perkecil"
                type="button"
            >
                −
            </button>
        </div>
    );
}

export default function PetaAncaman() {
    // Pusat koordinat di Indonesia (Lat: -2.5, Lng: 118.0) dengan zoom awal 5
    const center: [number, number] = [-2.5, 118.0];

    // Membatasi pergerakan/pan peta hanya di kawasan kepulauan Indonesia
    const bounds: [[number, number], [number, number]] = [
        [-12.0, 93.0], // Southwest boundary
        [8.0, 143.0],  // Northeast boundary
    ];

    const [mouseCoords, setMouseCoords] = useState({ lat: -2.5, lng: 118.0 });
    const [showTooltip, setShowTooltip] = useState(false);

    const getNodeColor = (level: string) => {
        switch (level) {
            case "kritis":
                return "#EF4444"; // Merah
            case "tinggi":
            case "sedang":
                return "#F59E0B"; // Kuning / Jingga (Peringatan)
            default:
                return "#10B981"; // Hijau (Aman)
        }
    };

    return (
        <div className="w-full h-full relative rounded-[1.5rem] overflow-visible" style={{ minHeight: "400px" }}>
            {/* 1. Panel Predictive Reasoning Melayang dengan Tooltip Hover (Kiri Atas) */}
            {/* Wrapper hanya sebagai positioner — TIDAK menggunakan group agar hover tidak bocor */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
                {/* Tombol pemicu tooltip — hanya tombol ini yang memicu showTooltip */}
                <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="w-10 h-10 rounded-xl bg-dark-950/90 border border-white/10 hover:border-neon-cyan/40 hover:text-neon-cyan flex items-center justify-center text-white shadow-lg backdrop-blur-md cursor-pointer transition-all"
                    title="Predictive Reasoning Info"
                >
                    <svg className="w-5 h-5 text-neon-cyan animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </button>

                {/* Box Tooltip — dikontrol oleh state showTooltip, bukan group-hover */}
                <div className={`absolute left-12 top-0 pointer-events-none transition-all duration-300 origin-left max-w-[280px] sm:max-w-[320px] bg-dark-950/95 border border-status-error/40 p-4 rounded-md shadow-xl backdrop-blur-md select-none ${showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                    <div className="flex items-center gap-2 mb-2 text-neon-cyan">
                        <svg className="w-4 h-4 text-neon-cyan animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">Predictive Reasoning</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/90 leading-relaxed uppercase tracking-tight font-sans">
                        ⚠️ ALERT: Propagasi anomali transaksi berisiko tinggi meluas di sektor regional Jawa Barat & DKI Jakarta. 426 alert FDS aktif terdeteksi.
                    </p>
                </div>
            </div>

            {/* 2. Pelacak Koordinat Grid Melayang (Kiri Bawah) */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-dark-950/80 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-lg pointer-events-none select-none transition-all">
                <div className="text-[9px] font-black text-neon-cyan uppercase tracking-widest mb-0.5 font-sans">Koordinat Grid</div>
                <div className="text-[10px] font-bold font-mono text-dark-300 tracking-tight">
                    LAT: {mouseCoords.lat.toFixed(4)} <span className="text-white/20 mx-1.5">|</span> LONG: {mouseCoords.lng.toFixed(4)}
                </div>
            </div>

            {/* Leaflet MapContainer */}
            <MapContainer
                center={center}
                zoom={5}
                minZoom={5}
                maxZoom={8}
                maxBounds={bounds}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                zoomControl={false} // Matikan zoom default template
                attributionControl={false} // Hilangkan watermark attribution standar Leaflet di kanan bawah
                className="w-full h-full border border-white/5 shadow-inner rounded-[1.5rem]"
                style={{ background: "#020617", height: "100%", minHeight: "400px" }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Menggunakan MapStateController untuk memicu event zoom kustom dan penjejak mouse */}
                <MapStateController onMouseMove={(lat, lng) => setMouseCoords({ lat, lng })} />

                {geoRiskRegions.map((region, idx) => {
                    const color = getNodeColor(region.level);
                    // Menghitung ukuran marker berdasarkan threatIntensityScore
                    const radius = Math.max(8, Math.min(region.threatIntensityScore * 160, 30));
                    const isHighRisk = region.level === "kritis" || region.level === "tinggi";

                    return (
                        <React.Fragment key={idx}>
                            {/* Cincin Luar 2: Radar Sonar Efek Bergaris (Dash Array) */}
                            {isHighRisk && (
                                <CircleMarker
                                    center={[region.latitude, region.longitude]}
                                    radius={radius * 2.2}
                                    fillColor="transparent"
                                    color={color}
                                    weight={1}
                                    opacity={0.15}
                                    dashArray="4 8"
                                    interactive={false}
                                    className="animate-pulse"
                                />
                            )}

                            {/* Cincin Luar 1: Radar Sonar Efek Bergaris (Dash Array) */}
                            {isHighRisk && (
                                <CircleMarker
                                    center={[region.latitude, region.longitude]}
                                    radius={radius * 1.5}
                                    fillColor="transparent"
                                    color={color}
                                    weight={1.2}
                                    opacity={0.3}
                                    dashArray="3 6"
                                    interactive={false}
                                    className="animate-pulse"
                                />
                            )}

                            {/* Marker Utama — detail wilayah tampil saat hover via Tooltip */}
                            <CircleMarker
                                center={[region.latitude, region.longitude]}
                                radius={radius}
                                fillColor={color}
                                color={color}
                                weight={2}
                                opacity={0.8}
                                fillOpacity={0.25}
                                className="animate-pulse"
                            >
                                {/* Tooltip dengan konten lengkap — muncul saat hover, bukan klik */}
                                <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={false}>
                                    <div style={{ background: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", minWidth: "180px" }}>
                                        {/* Header nama wilayah */}
                                        <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#22d3ee", marginBottom: "2px" }}>
                                            {region.name}
                                        </div>
                                        <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "#475569", marginBottom: "8px" }}>
                                            {region.province}
                                        </div>
                                        {/* Baris data detail */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status Ancaman</span>
                                                <span style={{ fontSize: "9px", fontWeight: 900, color, textTransform: "uppercase" }}>{region.level.toUpperCase()}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Transaksi</span>
                                                <span style={{ fontSize: "9px", fontWeight: 900, color: "#f1f5f9" }}>{region.transactionCount}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Kasus Fraud</span>
                                                <span style={{ fontSize: "9px", fontWeight: 900, color: "#f43f5e" }}>{region.fraudCount}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Skor Intensitas</span>
                                                <span style={{ fontSize: "9px", fontWeight: 900, color: "#f1f5f9" }}>{(region.threatIntensityScore * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            </CircleMarker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
}
