"use client";

import { track } from "@/lib/analytics/service";
import { useEffect, useRef, useState } from "react";
import type { Artwork } from "@/types/artwork";
import { renderShareCard, saveShareCard, type ShareCardStyle } from "@/lib/creation/share-card";
import { absoluteArtworkUrl } from "@/lib/site-path";

export function ShareCardModal({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [style, setStyle] = useState<ShareCardStyle>("editorial");
  const [card, setCard] = useState<{ blob: Blob; url: string; style: ShareCardStyle } | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const previous = document.activeElement; const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  useEffect(() => {
    let cancelled = false; let url: string | undefined;
    renderShareCard(artwork, style).then((blob) => {
      if (cancelled) return;
      track("share_card_created");
      url = URL.createObjectURL(blob); setCard({ blob, url, style }); setError("");
    }).catch(() => { if (!cancelled) setError("卡片暂时无法生成，请重试。"); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [artwork.imageUrl, artwork.quote, artwork.createdAt, artwork, style, attempt]);
  const ready = card?.style === style && !error;
  const filename = `moment-${artwork.id}-${style}.png`;
  return <dialog ref={dialog} className="commerce-dialog share-card-modal" aria-labelledby="share-card-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="share-card-heading"><h2 id="share-card-title">分享这一刻。</h2><button type="button" onClick={onClose} aria-label="关闭分享卡片">关闭</button></div>
    <div className="action-row" aria-label="卡片样式"><button aria-pressed={style === "editorial"} onClick={() => setStyle("editorial")}>画册 / Editorial</button><button aria-pressed={style === "immersive"} onClick={() => setStyle("immersive")}>沉浸 / Immersive</button></div>
    {ready && card ? <picture><img className="share-card-preview" src={card.url} alt={`${style === "editorial" ? "画册" : "沉浸"}分享卡片预览`} width={1080} height={1350} /></picture> : <p role="status">{error || "正在准备卡片……"}</p>}
    {error && <button onClick={() => setAttempt((value) => value + 1)}>重试</button>}
    <div className="action-row">
      <button disabled={!ready} onClick={() => { if (card) { saveShareCard(card.blob, filename); track("artwork_downloaded"); setNotice("卡片已准备下载。"); } }}>保存卡片</button>
      <button disabled={!ready} onClick={async () => {
        if (!card) return;
        const file = new File([card.blob], filename, { type: "image/png" });
        if (!navigator.share || !navigator.canShare?.({ files: [file] })) { setNotice("当前浏览器不支持分享图片，可以先保存卡片。"); return; }
        try { await navigator.share({ files: [file], title: artwork.quote }); track("artwork_shared"); setNotice("已打开系统分享。"); }
        catch (error) { if (!(error instanceof Error && error.name === "AbortError")) setNotice("分享未完成，可以先保存卡片。"); }
      }}>系统分享</button>
      <button onClick={async () => {
        if (!artwork.isPublic) { setNotice("这幅作品仍是私密的。请先在详情页公开，再复制作品链接。"); return; }
        try { await navigator.clipboard.writeText(absoluteArtworkUrl(artwork.id)); track("artwork_shared"); setNotice("链接已复制。当前作品仅保存在本浏览器，暂不能跨设备访问。"); }
        catch { setNotice("无法访问剪贴板，请从地址栏复制作品地址。"); }
      }}>复制作品链接</button>
    </div><p className="action-notice" role="status">{notice}</p>
  </dialog>;
}
