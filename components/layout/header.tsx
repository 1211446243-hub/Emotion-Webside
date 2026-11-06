import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { AccountControl } from "@/components/auth/account-control";

export function Header() {
  return <header className="site-header">
    <div className="header-inner">
      <Link className="wordmark" href="/" aria-label={`${siteConfig.name} 首页`}>{siteConfig.name}<span className="brand-dot" aria-hidden="true">.</span></Link>
      <nav className="desktop-navigation" aria-label="主导航">
        <Link href="/#create">创作</Link><Link href="/me/artworks">作品</Link><Link href="/gallery">广场</Link>
        <AccountControl />
      </nav>
      <MobileNav />
    </div>
  </header>;
}
