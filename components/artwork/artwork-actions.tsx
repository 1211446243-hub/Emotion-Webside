"use client";

import { track } from "@/lib/analytics/service";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-state";
import { artworkService } from "@/lib/storage/artwork-service";
import { useArtworkQuery } from "./use-artwork-query";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Artwork, PublicArtwork } from "@/types/artwork";
import { ShareCardModal } from "./share-card-modal";
import { regenerationService } from "@/lib/creation/regeneration";
import { absoluteArtworkUrl, artworkPath, assetUrl } from "@/lib/site-path";

export function ArtworkActions({ artwork, owner = false, compact = false }: { artwork: Artwork | PublicArtwork; owner?: boolean; compact?: boolean }) {
  const { user } = useAuth(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(""); const [confirm, setConfirm] = useState(false);
  const [shareCard, setShareCard] = useState(false);
  const session = owner && "creationSession" in artwork ? artwork.creationSession : undefined;
  const load = useCallback(async () => user ? { favorite: await artworkService.isFavorite(artwork.id), liked: await artworkService.isLiked(artwork.id) } : { favorite: false, liked: false }, [artwork.id, user]);
  const flags = useArtworkQuery(load);
  const isPublic = "isPublic" in artwork ? artwork.isPublic : true;
  const run = async (action: () => Promise<string>) => {
    if (busy) return; setBusy(true); setNotice("");
    try { setNotice(await action()); } catch (error) { setNotice(error instanceof Error ? error.message : "操作未完成，请再试一次。"); } finally { setBusy(false); }
  };
  const requireUser = () => {
    if (user) return true;
    router.push(`/login?returnTo=${encodeURIComponent(artworkPath(artwork.id))}`); return false;
  };
  return <div className={compact ? "artwork-actions compact-actions" : "artwork-actions"}>
    <div className="action-row">
      {session?.entitlement.allowRegenerate && !compact && <button disabled={busy || session.regenerateUsed} onClick={() => void run(async () => { await regenerationService.regenerate(artwork.id); return "另一种表达已保存，原作品仍然保留。未扣除创作次数。"; })}>{session.regenerateUsed ? "已换过一种表达" : busy ? "正在处理……" : "换一种表达"}</button>}
      {session?.entitlement.allowShareCard && !compact && <button onClick={() => setShareCard(true)}>分享作品</button>}
      {owner && !compact && <button type="button" disabled={busy} onClick={() => void run(async () => { await artworkService.saveGenerated(artwork as Artwork); return "已保存到本浏览器。"; })}>保存</button>}
      <button type="button" disabled={busy} aria-pressed={flags.data?.favorite ?? false} onClick={() => { if (requireUser()) void run(async () => { await artworkService.toggleFavorite(artwork.id); return flags.data?.favorite ? "已取消收藏" : "收藏成功"; }); }}>{flags.data?.favorite ? "取消收藏" : "收藏"}</button>
      {isPublic && <button type="button" disabled={busy} aria-pressed={flags.data?.liked ?? false} onClick={() => { if (requireUser()) void run(async () => { await artworkService.toggleLike(artwork.id); return flags.data?.liked ? "已取消点赞" : "已点赞"; }); }}>{flags.data?.liked ? "取消点赞" : "点赞"} · {artwork.likeCount}</button>}
      {!compact && <a onClick={() => track("artwork_downloaded")} href={assetUrl(artwork.imageUrl)} download={`moment-${artwork.id}.svg`}>下载</a>}
      {!compact && <button type="button" disabled={busy} onClick={() => void run(async () => {
        if (!isPublic) return "请先公开这一刻，再分享链接。";
        const url = absoluteArtworkUrl(artwork.id);
        if (navigator.share) {
          try { await navigator.share({ title: artwork.quote, url }); track("artwork_shared"); return "已打开分享。作品仅存于本浏览器，链接暂不能跨设备访问。"; }
          catch (error) { if (error instanceof Error && error.name === "AbortError") return ""; }
        }
        if (!navigator.clipboard?.writeText) return "当前浏览器无法复制，请从地址栏复制链接。作品仅存于本浏览器。";
        await navigator.clipboard.writeText(url); track("artwork_shared"); return "链接已复制。作品仅存于本浏览器，暂不能跨设备访问。";
      })}>分享</button>}
      {owner && !compact && <><button type="button" disabled={busy} onClick={() => void run(async () => { const result = await artworkService.togglePublic(artwork.id); return result.isPublic ? "已公开" : "已取消公开"; })}>{isPublic ? "取消公开" : "公开这一刻"}</button><button type="button" className="danger-action" disabled={busy} onClick={() => { setNotice(""); setConfirm(true); }}>删除</button></>}
    </div>
    <p className="action-notice" role="status">{notice || flags.error}</p>
    {shareCard && owner && "userId" in artwork && <ShareCardModal artwork={artwork} onClose={() => setShareCard(false)} />}
    {!compact && <ConfirmDialog open={confirm} pending={busy} error={confirm ? notice : undefined} onClose={() => setConfirm(false)} onConfirm={() => void run(async () => { await artworkService.delete(artwork.id); setConfirm(false); router.replace("/me/artworks"); return "已删除"; })} />}
  </div>;
}
