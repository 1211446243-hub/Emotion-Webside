"use client";
import Link from "next/link";
import { useCallback } from "react";
import { artworkService } from "@/lib/storage/artwork-service";
import { useArtworkQuery } from "@/components/artwork/use-artwork-query";
import { GalleryGrid } from "./gallery-grid";
import type { Artwork, PublicArtwork } from "@/types/artwork";

export function CollectionPage({ mode }: { mode: "mine" | "favorites" | "public" }) {
  const load = useCallback(() => mode === "mine" ? artworkService.getAll() : mode === "favorites" ? artworkService.getFavorites() : artworkService.getPublicAll(), [mode]);
  const query = useArtworkQuery<(Artwork | PublicArtwork)[]>(load);
  const title = mode === "mine" ? "我的作品" : mode === "favorites" ? "我的收藏" : "作品广场";
  return <section className="collection-page"><header className="collection-heading"><div><p className="eyebrow">{mode === "public" ? "MOMENTS IN THE OPEN" : "YOUR QUIET COLLECTION"}</p><h1>{title}</h1></div><Link className="quiet-link" href={mode === "public" ? "/#create" : "/me"}>{mode === "public" ? "留下我的此刻 ↗" : "我的空间 ↗"}</Link></header>
    {mode === "public" && <p className="collection-intro">一些被允许看见的时刻。公开之后，打开这个网站的人都能看到。</p>}
    {!query.loaded ? <div className="gallery-skeleton" role="status" aria-label="正在读取作品"><span /><span /><span /></div> : query.error ? <div className="collection-empty"><p role="alert">{query.error}</p><button className="quiet-link" onClick={query.retry}>再试一次</button></div> : !query.data?.length ? <div className="collection-empty"><p>{mode === "mine" ? "还没有留下任何时刻。" : mode === "favorites" ? "你还没有收藏作品。" : "这里还没有公开的时刻。"}</p><Link className="quiet-link" href={mode === "favorites" ? "/gallery" : "/#create"}>{mode === "favorites" ? "去广场看看" : "开始创作"} ↗</Link></div> : <GalleryGrid artworks={query.data} publicView={mode === "public"} interactions={mode === "public"} />}
  </section>;
}
