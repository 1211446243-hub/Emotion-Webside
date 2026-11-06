"use client";
import Image from "next/image";
import Link from "next/link";
import type { Artwork, PublicArtwork } from "@/types/artwork";
import { getArtworkAlt } from "@/data/mock-artworks";
import { ArtworkActions } from "@/components/artwork/artwork-actions";

export function GalleryGrid({ artworks, publicView = false, interactions = false }: { artworks: (Artwork | PublicArtwork)[]; publicView?: boolean; interactions?: boolean }) {
  return <div className="gallery-grid">{artworks.map((art, index) => <article className="gallery-item" key={art.id}><Link className="gallery-card" href={`/artwork/${art.id}${publicView ? "?view=public" : ""}`} aria-label={`查看作品：${art.quote}`}><Image src={art.imageUrl} width={800} height={1000} alt={getArtworkAlt(art.imageUrl)} unoptimized loading={index < 3 ? "eager" : "lazy"} /><div className="gallery-overlay"><p>{art.quote}</p><time dateTime={art.createdAt}>{new Date(art.createdAt).toLocaleDateString("zh-CN")}</time></div></Link>{publicView && "authorName" in art && <p className="gallery-author">{art.authorName}</p>}{interactions && <ArtworkActions artwork={art} compact />}</article>)}</div>;
}
