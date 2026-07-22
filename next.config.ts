import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/daftar",
        permanent: true,
      },
      {
        source: "/masuk",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/forgot-password",
        destination: "/lupa-password",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
