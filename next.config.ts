import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The live preview is served from an Arena subdomain during development.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
