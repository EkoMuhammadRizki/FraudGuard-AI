"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/pustaka/utilitas";
import { gunakanNotifikasi } from "@/fungsi/gunakanNotifikasi";
import AlertKustom from "@/komponen/feedback/alert-kustom";
import { Cpu, ShieldAlert, ShieldCheck, X, Link2, Coins, Server, Laptop, MapPin, Briefcase, AlertTriangle, Search, ArrowRight, RefreshCw } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";
import { investigationDetails, transactionFeed } from "@/pustaka/data-fraudguard";

// Fungsi penjelas perilaku suspect berstandar UX Writing untuk analisis node GNN
const getNodeExplanation = (node: any, detail: any, gnnEdges: any[], gnnNodes: any[]) => {
    const isHighRisk = node.risk >= 38;
    
    // Mencari semua relasi (edges) yang terhubung ke node ini
    const connections = gnnEdges.filter(e => e.from === node.id || e.to === node.id).map(e => {
        const otherId = e.from === node.id ? e.to : e.from;
        const otherNode = gnnNodes.find(n => n.id === otherId);
        return {
            id: otherId,
            label: otherNode?.label || "Unknown",
            type: otherNode?.type || "normal",
            suspicious: e.suspicious,
            weight: e.weight
        };
    });

    let typeLabel = "";
    let explanation = "";
    let behaviorTitle = "";
    let suspectReason = "";
    let fundFlowDescription = "";
    let xaiFactors: Array<{ name: string; score: number; impact: "tinggi" | "sedang" | "rendah" }> = [];

    switch (node.type) {
        case "suspect":
        case "normal":
            typeLabel = "Akun Pengirim (Source Account)";
            behaviorTitle = "Pola Aktivitas Akun";
            suspectReason = isHighRisk 
                ? "Indikasi Pencucian Uang (Layering) & Rekening Sumber Utama"
                : "Akun Pengirim Bersih";
            explanation = isHighRisk 
                ? "Rekening pengirim menunjukkan lonjakan aktivitas transfer keluar berfrekuensi tinggi dalam waktu singkat (Velocity). Terdeteksi korelasi kuat dengan penarikan dana massal, mengarah pada indikasi pencucian uang berlapis (layering) atau akun telah diambil alih (Account Takeover)."
                : "Akun pengirim dalam kondisi bersih dan belum pernah terafiliasi dengan jaringan transaksi mencurigakan dalam riwayat historis FDS.";
            fundFlowDescription = isHighRisk
                ? `Dana transaksi sebesar ${formatCurrency(detail.jumlah)} diinisiasi dari rekening ini, kemudian segera didistribusikan secara paralel ke beberapa rekening perantara (mule accounts) untuk memperkeruh jejak audit.`
                : "Perpindahan dana terpantau wajar dengan volume nominal harian normal di bawah batas deteksi anomali.";
            xaiFactors = [
                { name: "Velocity Frekuensi Transfer", score: 87, impact: "tinggi" },
                { name: "Penyimpangan Volume Transaksi", score: 79, impact: "tinggi" },
                { name: "Konsistensi Waktu Akses", score: 32, impact: "rendah" }
            ];
            break;
        case "recipient":
            typeLabel = "Akun Penerima (Mule Account)";
            behaviorTitle = "Indikasi Jaringan Keledai Uang (Mule)";
            suspectReason = isHighRisk
                ? "Terindikasi sebagai Rekening Penampung Keledai (Money Mule Account)"
                : "Akun Penerima Bersih";
            explanation = isHighRisk
                ? "Rekening tujuan (penerima) ini terhubung dengan banyak akun pengirim berisiko tinggi secara bersamaan dalam periode singkat. Karakteristik penampungan dana ini secara statistik konsisten dengan Rekening Keledai (Money Mule Account) yang digunakan sebagai perantara untuk memecah dan menyebarkan aliran dana kejahatan sebelum penarikan tunai."
                : "Rekening penerima terverifikasi bersih dan tidak memiliki riwayat koneksi dengan transaksi ilegal.";
            fundFlowDescription = isHighRisk
                ? `Menerima dana sebesar ${formatCurrency(detail.jumlah)} dari rekening pengirim mencurigakan, yang kemudian dialihkan kembali ke akun lain atau ditarik tunai secara kilat untuk memutus rantai pembuktian.`
                : "Menerima dana transfer normal tanpa adanya indikasi penarikan atau pemindahan instan (quick cash-out).";
            xaiFactors = [
                { name: "Konsentrasi Akun Pengirim (In-Degree)", score: 94, impact: "tinggi" },
                { name: "Holding Time (Durasi Endap Dana)", score: 85, impact: "tinggi" },
                { name: "Kesesuaian Profil Pemilik Rekening", score: 45, impact: "sedang" }
            ];
            break;
        case "device":
            typeLabel = "Terminal Perangkat (Device Fingerprint)";
            behaviorTitle = "Pola Device Pooling";
            suspectReason = isHighRisk
                ? "Device Pooling / Penggunaan Satu Perangkat Multi-Akun"
                : "Terminal Perangkat Aman";
            explanation = isHighRisk
                ? "Sidik jari perangkat (Device ID) ini terdeteksi digunakan secara bergantian oleh beberapa rekening bank yang berbeda untuk mengirimkan dana dalam durasi berdekatan. Pola Device Pooling ini menunjukkan indikasi kuat kontrol terpusat dari satu perangkat fisik oleh pelaku/sindikat fraud."
                : "Parameter perangkat dinilai normal dan hanya terasosiasi dengan satu akun nasabah aktif.";
            fundFlowDescription = isHighRisk
                ? `Terminal fisik ini bertindak sebagai konsol otorisasi tunggal yang mengendalikan dan menyebarkan instruksi aliran dana lintas rekening bermasalah.`
                : "Perangkat terdaftar resmi dan hanya melayani transaksi otentik dari pemilik sah akun.";
            xaiFactors = [
                { name: "Rasio Multi-Akun per Device", score: 95, impact: "tinggi" },
                { name: "Modifikasi System Fingerprint", score: 71, impact: "sedang" },
                { name: "Kecepatan Ganti Sesi Akun (Session Velocity)", score: 89, impact: "tinggi" }
            ];
            break;
        case "ip":
            typeLabel = "Alamat Jaringan (IP Address)";
            behaviorTitle = "Status Jaringan Transmisi";
            suspectReason = isHighRisk
                ? "Penyembunyian Alamat IP / Koneksi VPN & Proxy Blacklist"
                : "Alamat IP Aman / Perumahan";
            explanation = isHighRisk
                ? "Alamat IP yang digunakan terdaftar dalam database blacklist intelijen ancaman siber (threat intelligence). Terdeteksi adanya penggunaan koneksi anonim (VPN publik, proxy berbayar, atau Tor network) untuk menyembunyikan lokasi fisik pelaku sebenarnya."
                : "Jaringan IP terverifikasi aman dan berasal dari ISP resmi perumahan tanpa tanda-tanda masking/proxy.";
            fundFlowDescription = isHighRisk
                ? `IP ini menyembunyikan lokasi fisik pelaku dan mentransmisikan instruksi transaksi terenkripsi untuk penyebaran dana curian.`
                : "Transmisi jaringan bersih, tercatat di ISP lokal resmi tanpa pola masking.";
            xaiFactors = [
                { name: "Deteksi Proxy/VPN Anonymizer", score: 99, impact: "tinggi" },
                { name: "Reputasi IP (Threat Intel Blacklist)", score: 92, impact: "tinggi" },
                { name: "Kecepatan Akses Antar Koordinat (Speed Anomaly)", score: 78, impact: "sedang" }
            ];
            break;
        case "merchant":
            typeLabel = "Outlet Penerima (Merchant)";
            behaviorTitle = "Indikasi Kolusi/Cash-Out Gateway";
            suspectReason = isHighRisk
                ? "Merchant Kolusi (Cash-Out Gateway / Gestun Ilegal)"
                : "Merchant Ritel Resmi";
            explanation = isHighRisk
                ? "Merchant ini menunjukkan pola penerimaan dana mencurigakan dari beberapa rekening bermasalah dalam volume besar secara serentak. Terindikasi adanya potensi kolusi merchant (Merchant Fraud) untuk memfasilitasi pencucian uang atau penarikan tunai ilegal (cash-out gateway)."
                : "Merchant terverifikasi legal sebagai bisnis ritel yang sah dengan pola transaksi wajar.";
            fundFlowDescription = isHighRisk
                ? `Berfungsi sebagai muara pencairan (cash-out gateway) di mana dana transaksi ilegal dicairkan dalam bentuk belanja fiktif.`
                : "Aliran dana ke merchant disesuaikan dengan faktur transaksi riil untuk pembelian komersial yang sah.";
            xaiFactors = [
                { name: "Anomali Jam Operasional Bisnis", score: 81, impact: "tinggi" },
                { name: "Lonjakan Volume Harian (Sales Spike)", score: 93, impact: "tinggi" },
                { name: "Rasio Klaim Balik (Chargeback Rate)", score: 40, impact: "sedang" }
            ];
            break;
        case "geo":
            typeLabel = "Hotspot Wilayah (Geografis)";
            behaviorTitle = "Tingkat Ancaman Regional";
            suspectReason = isHighRisk
                ? "Hotspot Wilayah Berisiko Tinggi (Zona Merah Fraud)"
                : "Wilayah Geografis Aman";
            explanation = isHighRisk
                ? "Wilayah ini dikategorikan sebagai zona merah ancaman karena tingginya tingkat frekuensi transaksi fraud regional yang bersumber atau bermuara di area ini. Terdeteksi anomali spasial yang signifikan dibandingkan statistik historis wilayah."
                : "Wilayah administratif aman dengan persentase aktivitas fraud yang sangat minimal.";
            fundFlowDescription = isHighRisk
                ? `Wilayah regional ini mencatat anomali distribusi dana keluar sebesar 48% lebih tinggi dibandingkan rata-rata historis mingguan.`
                : "Aktivitas finansial wilayah terpantau seimbang sesuai demografi populasi normal.";
            xaiFactors = [
                { name: "Kepadatan Laporan Penipuan Lokal", score: 76, impact: "tinggi" },
                { name: "Anomali Jarak Transaksi Berurutan", score: 85, impact: "tinggi" },
                { name: "Volume Transaksi Agregat Wilayah", score: 35, impact: "rendah" }
            ];
            break;
        default:
            typeLabel = "Entitas Jaringan";
            behaviorTitle = "Pola Analisis Relasional";
            suspectReason = "Analisis Hubungan Relasional GNN";
            explanation = "Node ini dianalisis oleh Graph Neural Network untuk memetakan korelasi hubungan antar entitas.";
            fundFlowDescription = "Entitas bertindak sebagai simpul penghubung transaksi dalam sub-grafik relasi.";
            xaiFactors = [
                { name: "GNN Centrality Weight", score: 55, impact: "sedang" }
            ];
    }

    return { typeLabel, explanation, behaviorTitle, connections, suspectReason, fundFlowDescription, xaiFactors };
};

function InvestigasiEmptyState({ onSearch }: { onSearch: (id: string) => void }) {
    const [input, setInput] = useState("");
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/transactions")
            .then(res => res.json())
            .then(data => {
                if (data.transactions) {
                    const criticals = data.transactions
                        .filter((t: any) => t.risiko === "kritis" || t.risiko === "tinggi")
                        .slice(0, 5);
                    setRecentAlerts(criticals);
                }
            })
            .catch(err => console.error("Error loading critical queue:", err))
            .finally(() => setLoadingRecent(false));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSearch(input.trim());
        }
    };

    return (
        <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">
                    Forensic <span className="text-primary-blue">Investigation</span>
                </h1>
                <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                    <span className="w-1.5 h-1.5 bg-neon-cyan/50 rounded-full shrink-0" />
                    Pusat Analisis Relasional Node GNN & XAI
                </p>
            </div>

            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-20" />
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center mx-auto text-primary-blue group-hover:scale-105 transition-transform duration-500">
                        <Search className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Mulai Analisis Forensik</h2>
                        <p className="text-xs text-dark-400 font-bold max-w-md mx-auto leading-relaxed">
                            Masukkan ID Transaksi untuk memetakan topologi jaringan GNN dan melihat kontribusi fitur XAI dari database MongoDB.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                        <input
                            type="text"
                            placeholder="Masukkan ID Transaksi (cth: 5B14F8AA)..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-dark-950/60 border border-white/10 hover:border-white/20 focus:border-primary-blue rounded-xl px-5 py-4 text-sm font-mono text-white placeholder-dark-600 focus:outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 rounded-xl bg-primary-blue text-white font-black text-xs uppercase tracking-widest hover:bg-primary-blue-hover transition-all active:scale-[0.98] cursor-pointer shrink-0"
                        >
                            Mulai Analisis
                        </button>
                    </form>
                </div>
            </div>

            <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden">
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">
                    Antrean Peninjauan Kasus Kritis (MongoDB)
                </h3>
                {loadingRecent ? (
                    <div className="py-12 flex justify-center items-center">
                        <RefreshCw className="w-6 h-6 text-primary-blue animate-spin" />
                    </div>
                ) : recentAlerts.length === 0 ? (
                    <div className="py-12 text-center text-xs font-black text-dark-500 uppercase tracking-widest">
                        Tidak ada antrean investigasi kritis aktif saat ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left text-xs font-black text-dark-500 uppercase tracking-[0.2em]">
                                    <th className="pb-3 pl-6">ID Transaksi</th>
                                    <th className="pb-3">Waktu</th>
                                    <th className="pb-3">Pengirim</th>
                                    <th className="pb-3">Penerima</th>
                                    <th className="pb-3 text-right">Volume</th>
                                    <th className="pb-3 text-center">Risiko</th>
                                    <th className="pb-3 text-center pr-6">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAlerts.map((txn: any) => (
                                    <tr
                                        key={txn.id}
                                        onClick={() => onSearch(txn.id)}
                                        className="group/row cursor-pointer transition-all hover:scale-[1.002]"
                                    >
                                        <td className="py-4 pl-6 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-l border-white/5 rounded-l-xl">
                                            <span className="text-xs font-black font-mono text-neon-cyan tracking-tight group-hover/row:glow-cyan transition-all">
                                                {txn.id}
                                            </span>
                                        </td>
                                        <td className="py-4 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-[10px] font-bold text-dark-400 font-mono tracking-tighter uppercase">
                                            {txn.waktu}
                                        </td>
                                        <td className="py-4 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white truncate max-w-[120px] uppercase">
                                            {txn.pengirim}
                                        </td>
                                        <td className="py-4 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white truncate max-w-[120px] uppercase">
                                            {txn.penerima}
                                        </td>
                                        <td className="py-4 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white text-right font-mono tracking-tighter">
                                            {formatCurrency(txn.jumlah)}
                                        </td>
                                        <td className="py-4 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-center">
                                            <span className="inline-flex px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-status-error/10 text-status-error border border-status-error/20">
                                                {txn.risiko.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-6 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-r border-white/5 rounded-r-xl text-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary-blue group-hover/row:text-white uppercase tracking-wider transition-colors">
                                                Investigasi <ArrowRight className="w-3 h-3 group-hover/row:translate-x-0.5 transition-transform" />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function InvestigasiContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const txid = searchParams.get("txid");
    const { modal, tampilSukses, tampilKonfirmasi, tampilError, tutupModal } = gunakanNotifikasi();
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [activeNodeModal, setActiveNodeModal] = useState<any>(null);
    const [currentUserAgent, setCurrentUserAgent] = useState<string>("Detecting...");

    // ── State Alur Keputusan Analis ──
    type AnalystStatus = "pending" | "cleared" | "flagged" | "blocked";
    const [analystStatus, setAnalystStatus] = useState<AnalystStatus>("pending");
    const [isProcessing, setIsProcessing] = useState(false);
    const [auditLog, setAuditLog] = useState<{ action: string; timestamp: string; color: string } | null>(null);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    const [record, setRecord] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch investigation record details from MongoDB dynamically
    useEffect(() => {
        if (!txid) return;
        setIsLoading(true);
        fetch(`/api/dashboard/investigation?id=${txid}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error("MongoDB returned error:", data.error);
                } else {
                    setRecord(data);
                    // Load audited action logs from MongoDB
                    if (data.auditLog) {
                        setAnalystStatus(data.auditLog.status);
                        setAuditLog({
                            action: data.auditLog.action,
                            timestamp: data.auditLog.timestamp,
                            color: data.auditLog.status === "cleared" ? "#10B981" : data.auditLog.status === "flagged" ? "#F59E0B" : data.auditLog.status === "blocked" ? "#F43F5E" : "#6B7280"
                        });
                    } else {
                        setAnalystStatus("pending");
                        setAuditLog(null);
                    }
                }
            })
            .catch(err => console.error("Error loading investigation from MongoDB:", err))
            .finally(() => setIsLoading(false));
    }, [txid]);

    const detail = record ? record.detail : {
        id: txid || "TBD",
        pengirim: "Mengambil data...",
        penerima: "Mengambil data...",
        jumlah: 0,
        waktu: "—",
        metode: "—",
        lokasi: "—",
        bpsCode: "—",
        ip: "—",
        device: "—",
        merchant: "—",
        riskScore: 0,
        threshold: 38,
        modelVerdict: "APPROVED",
        fraudType: "Legitimate",
        anomalyScore: 0,
        analystAction: "Lolos"
    };

    const gnnNodes = record ? record.gnnNodes : [];
    const gnnEdges = record ? record.gnnEdges : [];
    const xaiFeatures = record ? record.xaiFeatures : [];

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentUserAgent(window.navigator.userAgent);
        }
    }, []);

    const executeAction = (action: AnalystStatus, label: string, color: string, callback?: () => void) => {
        setIsProcessing(true);
        
        fetch("/api/dashboard/investigation/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                txId: detail.id,
                status: action,
                action: label
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setAnalystStatus(action);
                if (action === "pending") {
                    setAuditLog(null);
                } else {
                    setAuditLog({
                        action: label,
                        timestamp: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" }),
                        color,
                    });
                }
                if (callback) callback();
            } else {
                console.error("Failed to persist action in MongoDB:", data.error);
            }
        })
        .catch(err => console.error("Error persisting action:", err))
        .finally(() => setIsProcessing(false));
    };

    const handleSetujui = () => {
        if (analystStatus !== "pending") return;
        executeAction(
            "cleared",
            "Disetujui Bersih oleh Analis",
            "#10B981",
            () => tampilSukses("Transaksi Disetujui", `Transaksi ${detail.id} telah diverifikasi bersih dan diteruskan untuk pemrosesan normal.`)
        );
    };

    const handleFlag = () => {
        if (analystStatus !== "pending") return;
        executeAction(
            "flagged",
            "Ditandai untuk Investigasi Senior",
            "#F59E0B",
            () => tampilError("Ditandai Investigasi", `Transaksi ${detail.id} telah dikirim ke antrian investigasi senior.`)
        );
    };

    const handleBlokir = () => {
        if (analystStatus !== "pending") return;
        setShowBlockConfirm(true);
    };

    const konfirmasiBlokir = () => {
        setShowBlockConfirm(false);
        executeAction(
            "blocked",
            "Diblokir & Akun Dibekukan",
            "#F43F5E",
            () => tampilSukses("Blokir Berhasil", `Transaksi ${detail.id} telah dihentikan dan akun terkait dibekukan.`)
        );
    };

    const handleReset = () => {
        executeAction(
            "pending",
            "Keputusan Direset oleh Analis",
            "#6B7280",
            () => {
                setAnalystStatus("pending");
                setAuditLog(null);
            }
        );
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case "suspect": return "#F43F5E";
            case "recipient": return "#F59E0B";
            case "device": return "#06B6D4";
            case "ip": return "#A855F7";
            case "merchant": return "#EC4899";
            case "geo": return "#3B82F6";
            case "normal": return "#10B981";
            default: return "#10B981";
        }
    };

    const getNodeById = (id: string) => gnnNodes.find((n: { id: string }) => n.id === id);

    const getVerdictText = () => {
        if (detail.riskScore >= 38) {
            return `Sistem Amankan.ai menandai transaksi ${detail.id} dengan tingkat risiko ${detail.riskScore}% (Tingkat: ${detail.modelVerdict}). Analisis GNN mendeteksi anomali hubungan pada node terminal ${detail.device} dan IP ${detail.ip}. XAI menerangkan kontribusi risiko utama disebabkan oleh: ${xaiFeatures.map((f: { name: string }) => f.name).join(", ")}. Merekomendasikan tindakan: ${detail.analystAction === 'Tahan' ? 'Pembekuan sementara akun dan penahanan transaksi.' : 'Review mendalam oleh analis senior.'}`;
        } else {
            return `Transaksi ${detail.id} dinilai bersih oleh model dengan tingkat risiko rendah ${detail.riskScore}% (di bawah threshold 38%). Pola perilaku input terminal, durasi transaksi, dan geolokasi berada pada batas wajar. Tindakan analis otomatis: Lolos.`;
        }
    };

    if (!txid) {
        return <InvestigasiEmptyState onSearch={(id) => router.push(`/dasbor/investigasi?txid=${id}`)} />;
    }

    return (
        <>
            <AlertKustom modal={modal} onTutup={tutupModal} />

            <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">Analisis <span className="text-primary-blue">Forensik</span></h1>
                        <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                                analystStatus === "blocked" ? "bg-status-error" :
                                analystStatus === "flagged" ? "bg-status-warning" :
                                analystStatus === "cleared" ? "bg-status-success" :
                                "bg-status-error/50"
                            }`} />
                            Investigasi mendalam: <span className="text-white">{detail.id}</span>
                            {analystStatus === "pending" && <span className={detail.riskScore >= 38 ? "text-status-error" : "text-status-success"}>{detail.riskScore >= 38 ? "ANOMALI TERDETEKSI" : "BERSIH"}</span>}
                            {analystStatus === "cleared" && <span className="text-status-success font-black">▶ DISETUJUI BERSIH</span>}
                            {analystStatus === "flagged" && <span className="text-status-warning font-black">▶ INVESTIGASI SENIOR</span>}
                            {analystStatus === "blocked" && <span className="text-status-error font-black">▶ DIBLOKIR & DIBEKUKAN</span>}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Tombol Setujui Bersih */}
                        <button
                            onClick={handleSetujui}
                            disabled={analystStatus !== "pending" || isProcessing}
                            className={`group px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm border ${
                                analystStatus === "cleared"
                                    ? "bg-status-success text-white border-status-success cursor-default"
                                    : analystStatus !== "pending" || isProcessing
                                    ? "bg-dark-900 text-dark-600 border-dark-700 cursor-not-allowed opacity-40"
                                    : "bg-status-success/10 hover:bg-status-success/20 text-status-success border-status-success/20"
                            }`}
                        >
                            {analystStatus === "cleared" ? "✓ Disetujui" : isProcessing && analystStatus === "pending" ? "Memproses..." : "✓ Setujui Bersih"}
                        </button>

                        {/* Tombol Tandai Investigasi */}
                        <button
                            onClick={handleFlag}
                            disabled={analystStatus !== "pending" || isProcessing}
                            className={`group px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm border ${
                                analystStatus === "flagged"
                                    ? "bg-status-warning text-dark-950 border-status-warning cursor-default"
                                    : analystStatus !== "pending" || isProcessing
                                    ? "bg-dark-900 text-dark-600 border-dark-700 cursor-not-allowed opacity-40"
                                    : "bg-status-warning/10 hover:bg-status-warning/20 text-status-warning border-status-warning/20"
                            }`}
                        >
                            {analystStatus === "flagged" ? "⚑ Ditandai" : "⚑ Tandai Investigasi"}
                        </button>

                        {/* Tombol Hentikan & Blokir */}
                        <button
                            onClick={handleBlokir}
                            disabled={analystStatus !== "pending" || isProcessing}
                            className={`group px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm ${
                                analystStatus === "blocked"
                                    ? "bg-status-error/30 text-status-error border border-status-error/50 cursor-default"
                                    : analystStatus !== "pending" || isProcessing
                                    ? "bg-dark-900 text-dark-600 border border-dark-700 cursor-not-allowed opacity-40"
                                    : "bg-status-error text-white hover:bg-status-error/90"
                            }`}
                        >
                            {analystStatus === "blocked" ? "✕ Diblokir" : "✕ Hentikan & Blokir"}
                        </button>

                        {/* Tombol Reset (hanya muncul setelah ada keputusan) */}
                        {analystStatus !== "pending" && !isProcessing && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider text-dark-500 hover:text-white border border-dark-700 hover:border-white/20 bg-transparent transition-all"
                            >
                                ↺ Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Audit Log Bar — muncul setelah keputusan diambil */}
                {auditLog && (
                    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 animate-fade-in">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: auditLog.color }} />
                        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: auditLog.color }}>
                                KEPUTUSAN ANALIS TERCATAT
                            </span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{auditLog.action}</span>
                            <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">ID: {detail.id}</span>
                        </div>
                        <div className="text-[9px] font-mono font-bold text-dark-500 shrink-0">{auditLog.timestamp}</div>
                    </div>
                )}

                {/* Core Data + Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Detail Panel */}
                    <div className="lg:col-span-2 glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-20" />
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white tracking-widest uppercase mb-0 italic">Metadata <span className="text-primary-blue">Transaction</span></h3>
                            <InfoTooltip text="Detail lengkap transaksi yang sedang diinvestigasi: ID unik, waktu eksekusi, identitas pengirim & penerima, nominal, metode transfer, lokasi geografis, IP address, dan fingerprint perangkat." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                            {[
                                { label: "Identifier", value: detail.id, mono: true, cyan: true },
                                { label: "Waktu Eksekusi", value: detail.waktu },
                                { label: "Identitas Sumber", value: detail.pengirim, white: true },
                                { label: "Akun Tujuan", value: detail.penerima, white: true },
                                { label: "Volume Muatan", value: formatCurrency(detail.jumlah), error: true },
                                { label: "Protokol Transmisi", value: detail.metode },
                                { label: "Lokasi Geografis", value: detail.lokasi },
                                { label: "Alamat Jaringan (IP)", value: detail.ip, mono: true },
                                { label: "Merchant ID", value: detail.merchant, mono: true },
                                { label: "Tanda Tangan Terminal", value: detail.device },
                                { label: "User Agent", value: currentUserAgent, mono: true },
                            ].map((item) => (
                                <div key={item.label} className="group/item">
                                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] mb-2 group-hover/item:text-primary-blue transition-colors">{item.label}</div>
                                    <div className={`text-sm font-black break-words ${
                                        item.error ? "text-status-error text-xl" : 
                                        item.cyan ? "font-mono text-neon-cyan" : 
                                        item.white ? "text-white" : "text-dark-200"
                                    }`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Matrix Score */}
                    <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center relative group overflow-hidden">
                        <div className={`absolute inset-0 transition-colors duration-700 ${detail.riskScore >= 38 ? 'bg-status-error/5 group-hover:bg-status-error/10' : 'bg-status-success/5 group-hover:bg-status-success/10'}`} />
                        <div className="flex items-center gap-2 mb-10 relative z-10">
                            <h3 className="text-[10px] font-black text-dark-400 uppercase tracking-[0.3em]">Matriks Intensitas Ancaman</h3>
                            <InfoTooltip text="Skor risiko 0–100 yang dihitung oleh Neural Engine. Skor di atas 38 dikategorikan sebagai alert FDS." />
                        </div>
                        
                        <div className="relative w-56 h-56 z-10">
                            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 drop-shadow-md">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                                <circle
                                    cx="80" cy="80" r="70" fill="none" stroke={detail.riskScore >= 38 ? "url(#riskGradientError)" : "url(#riskGradientSuccess)"} strokeWidth="12" strokeLinecap="round"
                                    strokeDasharray={`${(detail.riskScore / 100) * 440} 440`}
                                    className="animate-gauge"
                                />
                                <defs>
                                    <linearGradient id="riskGradientError" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#F43F5E" />
                                        <stop offset="100%" stopColor="#FB7185" />
                                    </linearGradient>
                                    <linearGradient id="riskGradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#34D399" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-white tracking-tighter">{detail.riskScore}</span>
                                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mt-1">PROBABILITAS</span>
                            </div>
                        </div>

                        <div className={`mt-10 px-6 py-2.5 rounded-xl text-xs font-bold border tracking-wider uppercase relative z-10 shadow-sm ${
                            detail.riskScore >= 38 ? 'bg-status-error/10 text-status-error border-status-error/20' : 'bg-status-success/10 text-status-success border-status-success/20'
                        }`}>
                            Verdict: {detail.modelVerdict.toUpperCase()}
                        </div>
                        <p className="text-dark-500 text-[10px] font-bold mt-6 text-center leading-relaxed relative z-10 max-w-[200px] uppercase tracking-tighter">
                            Klasifikasi Tipe: <span className="text-white">{detail.fraudType}</span>
                        </p>
                    </div>
                </div>

                {/* GNN Topo (Visual Graph) */}
                <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-neon-cyan to-transparent opacity-10 group-hover:opacity-30" />
                    
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Grafik <span className="text-neon-cyan">Topologi Relasi</span></h3>
                                <InfoTooltip text="Visualisasi hubungan antar entitas menggunakan Graph Neural Network (GNN). Garis merah menandai koneksi mencurigakan. Klik node untuk menyorot relasi." />
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 mt-2 uppercase tracking-[0.2em]">Analisis relasional melalui Graph Neural Networks (GNN)</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 glass-panel px-6 py-3 rounded-2xl border-white/5 bg-dark-950/50">
                            {[
                                { color: "bg-status-error", label: "SUSPECT" },
                                { color: "bg-amber-warning", label: "RESEPSIONIS" },
                                { color: "bg-neon-cyan", label: "DEVICE" },
                                { color: "bg-purple-500", label: "IP ADDRESS" },
                                { color: "bg-pink-500", label: "MERCHANT" },
                                { color: "bg-blue-500", label: "GEO" },
                                { color: "bg-status-success", label: "BERSIH" }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color} shadow-sm`} />
                                    <span className="text-[9px] font-bold text-dark-400 tracking-wider uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative bg-dark-950/60 rounded-2xl border border-white/5 overflow-hidden shadow-inner aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/9]">
                        <svg viewBox="0 0 600 500" className="w-full h-full p-6 md:p-10 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
                            {/* Connection Lines (Edges) */}
                            {gnnEdges.map((edge: { from: string; to: string; suspicious: boolean; weight: number }, i: number) => {
                                const from = getNodeById(edge.from);
                                const to = getNodeById(edge.to);
                                if (!from || !to) return null;
                                return (
                                    <g key={i}>
                                        <line
                                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={edge.suspicious ? "#F43F5E" : "rgba(148,163,184,0.15)"}
                                            strokeWidth={edge.suspicious ? 3 : 1.5}
                                            strokeDasharray={edge.suspicious ? "10 5" : "none"}
                                            opacity={edge.suspicious ? 0.75 : 0.4}
                                        >
                                            {edge.suspicious && (
                                                <animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" />
                                            )}
                                        </line>
                                    </g>
                                );
                            })}

                            {/* Entity Nodes */}
                            {gnnNodes.map((node: { id: string; label: string; x: number; y: number; type: string; risk: number }) => {
                                const color = getNodeColor(node.type);
                                const isSelected = selectedNode === node.id;
                                return (
                                    <g 
                                        key={node.id} 
                                        onClick={() => {
                                            setSelectedNode(node.id === selectedNode ? null : node.id);
                                            setActiveNodeModal(node);
                                        }} 
                                        className="cursor-pointer group/node"
                                    >
                                        <circle cx={node.x} cy={node.y} r={isSelected ? 50 : 40} fill={color} opacity={isSelected ? 0.25 : 0.08} className="transition-all duration-500">
                                            {(node.type === "suspect" || node.risk >= 70) && (
                                                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
                                            )}
                                        </circle>
                                        <circle cx={node.x} cy={node.y} r="25" fill="#020617" stroke={color} strokeWidth={isSelected ? 5 : 3} className="transition-all duration-500" />
                                        <text x={node.x} y={node.y + 7} textAnchor="middle" fill={color} fontSize="14" className="font-black italic">{node.id}</text>
                                        <text x={node.x} y={node.y + 50} textAnchor="middle" fill={isSelected ? "white" : "rgba(226,232,240,0.5)"} fontSize="10" className="font-black uppercase tracking-widest">{node.label}</text>
                                        
                                        {/* Threat Hover Indicator */}
                                        <rect x={node.x + 18} y={node.y - 35} width="32" height="18" rx="2" fill={color} className="opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                        <text x={node.x + 34} y={node.y - 23} textAnchor="middle" fill="white" fontSize="9" className="font-black opacity-0 group-hover/node:opacity-100 transition-opacity">{node.risk}%</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* XAI Evidence Panel */}
                <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-10" />
                    
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Dampak <span className="text-hyper-violet">Fitur SHAP / XAI</span></h3>
                                <InfoTooltip text="Explainable AI (XAI) berbasis SHAP values. Menjelaskan faktor apa yang paling mempengaruhi keputusan model. Bar merah = dampak tinggi, kuning = sedang, hijau = rendah." />
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 mt-2 uppercase tracking-[0.2em]">Penalaran keputusan AI yang transparan & pembobotan atribut</p>
                        </div>
                        <div className="px-6 py-2.5 rounded-2xl bg-dark-950 border border-white/5 text-hyper-violet text-[10px] font-black uppercase tracking-widest">
                            SHAP-READY ENGINE v4.0.1
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-20 gap-y-8">
                        {xaiFeatures.length > 0 ? (
                            xaiFeatures.map((feature: { name: string; importance: number; impact: string }) => {
                                const barColor = feature.impact === "tinggi" ? "bg-status-error" : feature.impact === "sedang" ? "bg-amber-warning" : "bg-status-success";
                                return (
                                    <div key={feature.name} className="group/feat">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider group-hover/feat:text-neon-cyan transition-colors">{feature.name}</div>
                                            <div className="text-[10px] font-black font-mono text-dark-500">{(feature.importance * 100).toFixed(0)}%</div>
                                        </div>
                                        <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                            <div className={`h-full rounded-full ${barColor} shadow-sm transition-all duration-1000`} style={{ width: `${Math.min(feature.importance * 300, 100)}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 text-center text-dark-500 font-bold uppercase tracking-widest text-xs py-10">
                                Tidak ada kontribusi fitur anomali terdeteksi oleh SHAP
                            </div>
                        )}
                    </div>

                    {/* AI Narrative Context */}
                    <div className="mt-16 glass-panel p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group/narrative relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${detail.riskScore >= 38 ? 'bg-status-error' : 'bg-status-success'} opacity-40`} />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-neon-cyan" strokeWidth={2.5} />
                            Log Narasi Forensik Model
                        </h4>
                        <p className="text-sm font-bold text-dark-400 leading-relaxed uppercase tracking-tight">
                            {record?.forensicNarrative || getVerdictText()}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── GNN NODE EXPLANATION MODAL (Fixed Centered) ── */}
            {activeNodeModal && (() => {
                const { typeLabel, explanation, behaviorTitle, connections, suspectReason, fundFlowDescription, xaiFactors } = getNodeExplanation(activeNodeModal, detail, gnnEdges, gnnNodes);
                const color = getNodeColor(activeNodeModal.type);
                
                return (
                    <div 
                        className="fixed inset-0 z-[2000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in animate-pulse-none"
                        onClick={() => setActiveNodeModal(null)}
                    >
                        <div 
                            className="bg-dark-900 border border-white/10 rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] md:max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-scale-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Garis batas cahaya di bagian atas */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-40" />

                            {/* Header Modal */}
                            <div className="px-8 pt-8 pb-5 flex items-start justify-between border-b border-white/5">
                                <div>
                                    <div className="flex items-center gap-2.5 text-neon-cyan mb-1.5">
                                        <Cpu className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] font-sans">GNN Node Analyzer</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase font-sans">
                                        Analisis Node <span style={{ color }}>{activeNodeModal.label}</span>
                                    </h3>
                                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mt-1">
                                        Entitas: <span className="text-white font-black">{typeLabel}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveNodeModal(null)}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                                    title="Tutup Analisis"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body Modal (Scrollable) */}
                            <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                                
                                {/* PILAR 1: Diagnosis Suspect (Risiko & Perilaku) */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                    {/* Indikator Meteran Bahaya Node */}
                                    <div className="md:col-span-4 bg-dark-950/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                        <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-3">Tingkat Bahaya Node</div>
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                                                <circle 
                                                    cx="50" 
                                                    cy="50" 
                                                    r="40" 
                                                    stroke={color} 
                                                    strokeWidth="8" 
                                                    fill="transparent" 
                                                    strokeDasharray="251.2"
                                                    strokeDashoffset={251.2 - (251.2 * activeNodeModal.risk) / 100}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black text-white font-mono tracking-tight">{activeNodeModal.risk}%</span>
                                            </div>
                                        </div>
                                        <span 
                                            className="mt-4 inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border"
                                            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}05` }}
                                        >
                                            {activeNodeModal.risk >= 70 ? "Kritis" : activeNodeModal.risk >= 38 ? "Peringatan" : "Bersih"}
                                        </span>
                                    </div>

                                    {/* Diagnosis Suspect & Penjelasan */}
                                    <div className="md:col-span-8 bg-dark-950/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1">Diagnosis Kategori Suspect</div>
                                            <div className="text-base font-black uppercase tracking-tight mb-3" style={{ color }}>
                                                {suspectReason}
                                            </div>
                                            <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1.5">{behaviorTitle}</div>
                                            <h4 className="text-xs sm:text-sm font-bold text-dark-200 leading-relaxed font-sans">
                                                {explanation}
                                            </h4>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-dark-400 font-bold leading-relaxed font-sans uppercase tracking-wider">
                                            ⚠️ Penilaian dihitung secara relasional oleh model GNN berdasarkan koneksi topologi dari simpul mencurigakan terdekat.
                                        </div>
                                    </div>
                                </div>

                                {/* PILAR 2: Penyebaran Aliran Dana */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-neon-cyan" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Analisis Aliran & Penyebaran Dana</h4>
                                    </div>

                                    <div className="bg-dark-950/40 border border-white/5 rounded-2xl p-6 space-y-4">
                                        <p className="text-xs font-bold text-dark-300 leading-relaxed uppercase tracking-tight">
                                            {fundFlowDescription}
                                        </p>
                                        
                                        <div className="text-[9px] font-black text-dark-500 uppercase tracking-[0.15em] pt-2 border-t border-white/5">
                                            Koneksi Jaringan Relasional (GNN Edges):
                                        </div>

                                        <div className="space-y-3.5">
                                            {connections.length > 0 ? (
                                                connections.map((conn, idx) => {
                                                    const connColor = getNodeColor(conn.type);
                                                    return (
                                                        <div 
                                                            key={idx}
                                                            className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div 
                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center border text-xs"
                                                                    style={{ color: connColor, borderColor: `${connColor}20`, backgroundColor: `${connColor}05` }}
                                                                >
                                                                    {conn.type === "suspect" || conn.type === "normal" ? <Coins className="w-5 h-5" /> :
                                                                     conn.type === "recipient" ? <Link2 className="w-5 h-5" /> :
                                                                     conn.type === "device" ? <Laptop className="w-5 h-5" /> :
                                                                     conn.type === "ip" ? <Server className="w-5 h-5" /> :
                                                                     conn.type === "merchant" ? <Briefcase className="w-5 h-5" /> :
                                                                     <MapPin className="w-5 h-5" />
                                                                    }
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs font-black text-white font-mono">{conn.label}</span>
                                                                        <span 
                                                                            className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border"
                                                                            style={{ color: connColor, borderColor: `${connColor}20`, backgroundColor: `${connColor}05` }}
                                                                        >
                                                                            {conn.type.toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[10px] text-dark-500 font-bold uppercase tracking-tight">
                                                                        Node ID: {conn.id}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6">
                                                                <div className="flex flex-col text-right">
                                                                    <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1">Intensitas Relasi</span>
                                                                    <span className="text-xs font-mono font-black text-white">{conn.weight * 10}%</span>
                                                                </div>
                                                                <div>
                                                                    {conn.suspicious ? (
                                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black bg-status-error/10 text-status-error border border-status-error/20 uppercase tracking-wider">
                                                                            Mencurigakan
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black bg-status-success/10 text-status-success border border-status-success/20 uppercase tracking-wider">
                                                                            Wajar
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-xs font-black text-dark-400 uppercase tracking-wider">
                                                    Tidak ada koneksi jaringan langsung yang tercatat untuk node ini.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* PILAR 3: Metadata Transaksi Terkait */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Laptop className="w-4 h-4 text-neon-cyan" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Metadata Transaksi & Kasus Aktif</h4>
                                    </div>

                                    <div className="bg-dark-950/40 border border-white/5 rounded-2xl p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                            {[
                                                { label: "ID Transaksi Kasus", value: detail.id, cyan: true },
                                                { label: "Nominal Kasus", value: formatCurrency(detail.jumlah), error: true },
                                                { label: "Waktu Eksekusi", value: detail.waktu },
                                                { label: "Metode Transfer", value: detail.metode },
                                                { label: "Hotspot Wilayah", value: detail.lokasi },
                                                { label: "IP Jaringan Kasus", value: detail.ip },
                                                { label: "Terminal Kasus", value: detail.device },
                                                { label: "User Agent Pengguna", value: currentUserAgent }
                                            ].map((item, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <span className="text-[9px] font-black text-dark-500 uppercase tracking-wider block">{item.label}</span>
                                                    <span className={`text-xs font-bold break-words block ${
                                                        item.cyan ? "text-neon-cyan font-mono" :
                                                        item.error ? "text-status-error font-extrabold" : "text-white"
                                                    }`}>
                                                        {item.value || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* PILAR 4: Explainable AI & SHAP Node Insights */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-neon-cyan animate-pulse" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Explainable AI (XAI) Atribut Node</h4>
                                    </div>

                                    <div className="bg-dark-950/40 border border-white/5 rounded-2xl p-6 space-y-6">
                                        <div className="text-[10px] font-bold text-dark-400 uppercase leading-relaxed tracking-wide">
                                            Berikut adalah bobot pengaruh fitur spesifik entitas yang dievaluasi oleh Neural Engine dalam menentukan tingkat risiko node:
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                            {xaiFactors.map((feat, idx) => {
                                                const barColor = feat.impact === "tinggi" ? "bg-status-error" : feat.impact === "sedang" ? "bg-amber-warning" : "bg-status-success";
                                                const textImpact = feat.impact === "tinggi" ? "text-status-error" : feat.impact === "sedang" ? "text-amber-warning" : "text-status-success";
                                                return (
                                                    <div key={idx} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-white uppercase tracking-wider">{feat.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[9px] font-black uppercase tracking-wider border px-1.5 py-0.5 rounded ${
                                                                    feat.impact === "tinggi" ? "bg-status-error/10 border-status-error/20" :
                                                                    feat.impact === "sedang" ? "bg-amber-warning/10 border-amber-warning/20" :
                                                                    "bg-status-success/10 border-status-success/20"
                                                                } ${textImpact}`}>
                                                                    {feat.impact.toUpperCase()}
                                                                </span>
                                                                <span className="text-xs font-mono font-black text-dark-400">{feat.score}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-2 bg-dark-950 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                                            <div 
                                                                className={`h-full rounded-full ${barColor} shadow-sm transition-all duration-1000`} 
                                                                style={{ width: `${feat.score}%` }} 
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Footer Modal */}
                            <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex justify-end">
                                <button
                                    onClick={() => setActiveNodeModal(null)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-dark-800 hover:bg-white/5 text-dark-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    Tutup Analisis
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── LOADING OVERLAY saat memproses keputusan ── */}
            {isProcessing && (
                <div className="fixed inset-0 z-[3000] bg-dark-950/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
                        <p className="text-[11px] font-black text-neon-cyan uppercase tracking-[0.3em]">Memproses Keputusan...</p>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI BLOKIR ── */}
            {showBlockConfirm && (
                <div
                    className="fixed inset-0 z-[3000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowBlockConfirm(false)}
                >
                    <div
                        className="bg-dark-900 border border-status-error/30 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Garis merah di atas */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-status-error to-transparent" />

                        <div className="p-8">
                            {/* Ikon peringatan */}
                            <div className="w-14 h-14 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center mb-6">
                                <ShieldAlert className="w-7 h-7 text-status-error" />
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                                Konfirmasi Hentikan & Blokir
                            </h3>
                            <p className="text-sm font-bold text-dark-400 leading-relaxed mb-2">
                                Anda akan memblokir transaksi <span className="text-neon-cyan font-mono">{detail.id}</span> senilai{" "}
                                <span className="text-status-error font-black">{formatCurrency(detail.jumlah)}</span>.
                            </p>
                            <p className="text-xs font-bold text-dark-500 leading-relaxed mb-8">
                                Tindakan ini akan <span className="text-white">membekukan sementara akun {detail.pengirim}</span> dan menghentikan semua transaksi terkait. Rekaman keputusan akan tersimpan dalam log audit sistem.
                            </p>

                            {/* Informasi dampak tindakan */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { label: "Transaksi Dihentikan", icon: "⛔", color: "#F43F5E" },
                                    { label: "Akun Dibekukan", icon: "🔒", color: "#F59E0B" },
                                    { label: "Log Audit Tersimpan", icon: "📋", color: "#22D3EE" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-dark-950/60 border border-white/5 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">{item.icon}</div>
                                        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: item.color }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Tombol aksi */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBlockConfirm(false)}
                                    className="flex-1 px-5 py-3 rounded-xl bg-dark-800 hover:bg-white/5 text-dark-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/5 hover:border-white/10 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={konfirmasiBlokir}
                                    className="flex-1 px-5 py-3 rounded-xl bg-status-error hover:bg-status-error/80 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg"
                                >
                                    ✕ Ya, Blokir Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function InvestigasiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center text-white font-bold uppercase tracking-widest text-sm">
                Memuat Data Forensik...
            </div>
        }>
            <InvestigasiContent />
        </Suspense>
    );
}
