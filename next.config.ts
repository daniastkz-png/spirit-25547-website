import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `npm run build` emits plain HTML/CSS/JS into `out/`,
  // deployable to Vercel, Netlify, Cloudflare Pages, GitHub Pages or any web host.
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
