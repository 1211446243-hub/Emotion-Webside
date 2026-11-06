"use client";

import { track } from "@/lib/analytics/service";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-state";
import { artworkService } from "@/lib/storage/artwork-service";
import { useArtworkQuery } from "./use-artwork-query";
import { ArtworkActions } from "./artwork-actions";
import { artworkPath, assetUrl } from "@/lib/site-path";
import { getArtworkAlt } from "@/data/mock-artworks";

export function ArtworkDetail({ id, publicView }: { id: string; publicView: boolean }) {
  const { user } = useAuth();
  const load = useCallback(async () => {
    if (!publicView && user) { const own = await artworkService.getById(id); if (own) return own; }
    return artworkService.getPublicById(id);
  }, [id, publicView, user]);
  const query = useArtworkQuery(load);
  if (!query.loaded) return <div className="detail-loading" role="status">正在打开这一刻……</div>;
  if (query.error) return <section className="collection-empty"><h1>暂时无法打开作品。</h1><p role="alert">{query.error}</p><button className="quiet-link" onClick={query.retry}>再试一次</button></section>;
  const art = query.data;
  // Never render stale private data after logout, even before the reload promise settles.
  if (!art || ("userId" in art && art.userId !== user?.id)) return <section className="collection-empty"><p className="eyebrow">A QUIET SPACE</p><h1>这里没有可查看的作品。</h1><p>它可能是私密的、已经删除，或不在此浏览器中。</p><Link className="quiet-link" href="/gallery">看看作品广场 ↗</Link>{!user && id && <Link className="quiet-link" href={`/login?returnTo=${encodeURIComponent(artworkPath(id))}`}>登录查看自己的作品</Link>}</section>;
  const owner = !publicView && "userId" in art && art.userId === user?.id;
  const session = owner && "creationSession" in art ? art.creationSession : undefined;
  return <article className="artwork-detail"><div className="detail-top"><Link href={owner ? "/me/artworks" : "/gallery"}>← {owner ? "我的作品" : "作品广场"}</Link><span>{owner ? "你的一个时刻" : "一个公开的时刻"}</span></div>
    <h1 className="sr-only">作品详情</h1><Image className="detail-image" src={art.imageUrl} alt={getArtworkAlt(art.imageUrl)} width={800} height={1000} unoptimized priority />
    <blockquote>{art.quote}</blockquote><p className="detail-date">{new Date(art.createdAt).toLocaleDateString("zh-CN")} · {"authorName" in art ? art.authorName : user?.name} · {"isPublic" in art && !art.isPublic ? "仅自己可见" : "公开作品"}</p>
    <ArtworkActions artwork={art} owner={owner} />
    {session?.regeneratedExpression && <section className="complete-creation" aria-label="另一种表达"><p className="eyebrow">ANOTHER EXPRESSION</p><h2>另一种表达，原来的仍在。</h2><Image className="detail-image" src={session.regeneratedExpression.mainArtwork.imageUrl} alt={getArtworkAlt(session.regeneratedExpression.mainArtwork.imageUrl)} width={800} height={1000} unoptimized /><blockquote>{session.regeneratedExpression.philosophy.quote}</blockquote><p>{session.regeneratedExpression.philosophy.explanation}</p><div className="candidate-artworks">{session.regeneratedExpression.candidateArtworks.map((candidate) => <Image key={candidate.id} src={candidate.imageUrl} alt={getArtworkAlt(candidate.imageUrl)} width={800} height={1000} unoptimized />)}</div><a onClick={() => track("artwork_downloaded")} className="quiet-link" href={assetUrl(session.regeneratedExpression.mainArtwork.imageUrl)} download={`moment-${art.id}-expression.svg`}>下载这一版</a></section>}
    {session?.entitlement.tier === "full" && <section className="complete-creation" aria-labelledby="complete-creation-title">
      <div className="complete-creation-heading"><p className="eyebrow">OTHER POSSIBILITIES</p><h2 id="complete-creation-title">同一个片刻，另外三种形状。</h2></div>
      <div className="candidate-artworks">{session.candidateArtworks.map((candidate, index) => <figure key={candidate.id}><Image src={candidate.imageUrl} alt={`${getArtworkAlt(candidate.imageUrl)}，候选版本 ${index + 1}`} width={800} height={1000} unoptimized /><figcaption>0{index + 1}</figcaption></figure>)}</div>
      {session.philosophy.explanation && <div className="philosophy-note"><p className="eyebrow">{session.philosophy.themeName} / PHILOSOPHICAL THEME</p><p>{session.philosophy.explanation}</p><blockquote>{session.philosophy.quote}</blockquote></div>}
    </section>}
    {owner && "originalText" in art && <details className="original-thought"><summary>当时写下的内容</summary><p>{art.originalText}</p></details>}
    <p className="local-storage-note">作品保存在本浏览器中。清除浏览器数据后将无法恢复。</p>
  </article>;
}
