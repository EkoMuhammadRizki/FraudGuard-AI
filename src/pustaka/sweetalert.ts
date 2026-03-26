// SweetAlert2-inspired theme configuration for FraudGuard AI
// This configures the modal styling to match the dark mode theme

export const sweetalertTheme = {
    sukses: {
        background: "#0F172A",
        iconColor: "#10B981",
        borderColor: "rgba(16, 185, 129, 0.2)",
        confirmButtonColor: "#10B981",
        titleColor: "#E2E8F0",
        textColor: "#94A3B8",
    },
    error: {
        background: "#0F172A",
        iconColor: "#F43F5E",
        borderColor: "rgba(244, 63, 94, 0.2)",
        confirmButtonColor: "#F43F5E",
        titleColor: "#E2E8F0",
        textColor: "#94A3B8",
    },
    konfirmasi: {
        background: "#0F172A",
        iconColor: "#F59E0B",
        borderColor: "rgba(245, 158, 11, 0.2)",
        confirmButtonColor: "#F43F5E",
        cancelButtonColor: "#334155",
        titleColor: "#E2E8F0",
        textColor: "#94A3B8",
    },
    peringatan: {
        background: "#0F172A",
        iconColor: "#F59E0B",
        borderColor: "rgba(245, 158, 11, 0.2)",
        confirmButtonColor: "#F59E0B",
        titleColor: "#E2E8F0",
        textColor: "#94A3B8",
    },
} as const;

export type SweetAlertTipe = keyof typeof sweetalertTheme;
