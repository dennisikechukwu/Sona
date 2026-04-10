import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow hot module replacement requests from mobile testing IP
  allowedDevOrigins: ['192.168.1.177'],
};

export default nextConfig;
