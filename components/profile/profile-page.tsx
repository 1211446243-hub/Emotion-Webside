"use client";
import Link from "next/link";
import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-state";
import { artworkService } from "@/lib/storage/artwork-service";
import { useArtworkQuery } from "@/components/artwork/use-artwork-query";
import { useCreationBalance } from "@/components/commerce/use-creation-balance";

export function ProfilePage() {
  const { user } = useAuth();
  const load = useCallback(async () => { const [artworks, favorites] = await Promise.all([artworkService.getAll(), artworkService.getFavorites()]); return { artworks: artworks.length, favorites: favorites.length, public: artworks.filter((art) => art.isPublic).length }; }, []);
  const query = useArtworkQuery(load);
  const creation = useCreationBalance(user?.id ?? null);
  return <section className="profile-page"><p className="eyebrow">A PLACE FOR YOUR MOMENTS</p><div className="profile-avatar" aria-label="头像占位">{user?.name.slice(0, 1)}</div><h1>{user?.name}</h1><p className="profile-subtitle">那些经过你的时刻。</p>{query.error ? <p role="alert">{query.error}</p> : <div className="profile-counts"><Link href="/me/artworks"><strong>{query.data?.artworks ?? "—"}</strong>作品</Link><Link href="/me/favorites"><strong>{query.data?.favorites ?? "—"}</strong>收藏</Link><Link href="/gallery"><strong>{query.data?.public ?? "—"}</strong>公开作品</Link></div>}
    <div className="profile-balance" aria-labelledby="profile-balance-title"><p className="eyebrow" id="profile-balance-title">创作</p>{creation.error ? <p role="alert">{creation.error}</p> : <div><span>免费创作 <strong>{creation.loaded ? creation.balance?.freeRemaining ?? 0 : "—"}</strong> 次</span>{Boolean(creation.balance?.paidRemaining) && <span>完整创作 <strong>{creation.balance?.paidRemaining}</strong> 次</span>}</div>}<Link href="/pricing">了解完整创作 ↗</Link></div>
    <Link className="quiet-link" href="/me/purchases">购买记录</Link>{process.env.NODE_ENV === "development" && <Link className="quiet-link" href="/debug">开发调试</Link>}<Link className="quiet-link" href="/#create">留下新的此刻 ↗</Link><p className="local-storage-note">数据仅保存在当前浏览器，不会自动同步到其他设备。</p></section>;
}
