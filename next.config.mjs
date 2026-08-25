/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kitchen3d.co.uk" },
      { protocol: "https", hostname: "www.wixapis.com" },
    ],
  },
};

export default nextConfig;
