import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://finance-dashboard-backend-sigv.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
