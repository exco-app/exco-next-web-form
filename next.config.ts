import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/request-invite',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
