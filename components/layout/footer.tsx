import { siteConfig } from "@/config/site";
import Link from "next/link";
export function Footer() {
  return <footer className="site-footer"><span className="footer-brand">{siteConfig.name}</span><p>{siteConfig.tagline}</p><Link href="/#create">回到此刻 ↑</Link></footer>;
}
