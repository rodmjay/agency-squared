import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH ?? "",
  env: { PAGES_BASE_PATH: process.env.PAGES_BASE_PATH ?? "" }, // inline it into client code too, or the language switch drops /agency-squared
  trailingSlash: true, // /es/ is a folder with its own index.html on GitHub Pages
  images: { unoptimized: true },
  experimental: { globalNotFound: true }, // one 404 for both languages (two root layouts: (en) and es)
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
