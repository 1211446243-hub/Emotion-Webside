import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "1";
const basePath = "/Emotion-Webside";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://yaqlndqoaibbfvlpinyt.supabase.co",
    NEXT_PUBLIC_SUPABASE_KEY: "sb_publishable_20ch0hHeC39leQ0NrU_ilw__IDDq5-k",
    ...(githubPages
      ? { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_STATIC_GENERATION: "1" }
      : {}),
  },
  ...(githubPages ? { output: "export", basePath, trailingSlash: true } : {}),
};

export default nextConfig;
