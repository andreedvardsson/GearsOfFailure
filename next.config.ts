import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Docker deployments
  output: 'standalone',

  // Skip type checking during build (for educational purposes)
  // In production, you'd want this enabled
  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/speedtest',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
