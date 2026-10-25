import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run dev` only serves its scripts to localhost (and its subdomains) by default. Also allow 127.0.0.1
  // and devices on your home network (e.g. your phone at http://192.168.x.x:3000).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
