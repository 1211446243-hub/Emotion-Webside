import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: `一个时刻 — ${siteConfig.name}` };

export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
