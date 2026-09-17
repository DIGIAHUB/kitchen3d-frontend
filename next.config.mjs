import { migrationRedirects } from "./config/migration-redirects.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() { return migrationRedirects; },
  // Keep offline-review build artifacts separate from the existing application.
  distDir: process.env.K3D_LOCAL_PREVIEW === "1" ? ".next-preview" : process.env.K3D_LOCAL_CANDIDATE === "1" ? ".next-candidate" : ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kitchen3d.co.uk" },
      { protocol: "https", hostname: "www.wixapis.com" },
    ],
  },
};

export default nextConfig;
