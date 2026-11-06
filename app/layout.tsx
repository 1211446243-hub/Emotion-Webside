import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthState } from "@/components/auth/auth-state";
import "./globals.css";

export const metadata: Metadata = { title: `${siteConfig.name} — 把此刻变成一幅画`, description: siteConfig.description };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body><AuthState><a className="skip-link" href="#main">跳到主要内容</a><Header /><main id="main">{children}</main><Footer /></AuthState></body></html>;
}
