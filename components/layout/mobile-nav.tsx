"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountControl } from "@/components/auth/account-control";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-navigation" onKeyDown={(event) => {
      if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); }
    }}>
      <button id="menu-toggle" className="menu-toggle" aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
        <span aria-hidden="true">{open ? "关闭 −" : "菜单 +"}</span>
      </button>
      {open && <nav id="mobile-menu" aria-label="手机导航">
        <Link href="/#create" onClick={() => setOpen(false)}>创作</Link>
        <Link href="/me/artworks" onClick={() => setOpen(false)}>我的作品</Link>
        <Link href="/me/favorites" onClick={() => setOpen(false)}>我的收藏</Link>
        <Link href="/gallery" onClick={() => setOpen(false)}>作品广场</Link>
        <AccountControl onNavigate={() => setOpen(false)} />
      </nav>}
    </div>
  );
}
