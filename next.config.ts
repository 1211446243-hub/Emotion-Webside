import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "1";
const basePath = "/Emotion-Webside";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(githubPages
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        env: {
          NEXT_PUBLIC_BASE_PATH: basePath,
          NEXT_PUBLIC_STATIC_GENERATION: "1",
        },
      }
    : {}),
};

export default nextConfig;
