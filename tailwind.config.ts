import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-950': '#020617',
        'dark-900': '#050505',
        'dark-800': '#0F172A',
        'dark-700': '#1E293B',
        'dark-600': '#334155',
        'dark-500': '#475569',
        'dark-400': '#64748B',
        'dark-300': '#94A3B8',
        'dark-200': '#CBD5E1',
        'dark-100': '#F8FAFC',
        'primary-blue': '#3B82F6',
        'primary-blue-hover': '#2563EB',
        'neon-cyan': '#06B6D4',
        'hyper-violet': '#8B5CF6',
        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-error': '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-public-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
};

export default config;
