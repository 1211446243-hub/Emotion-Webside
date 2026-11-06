"use client";

import { track } from "@/lib/analytics/service";

import { useEffect, useRef } from "react";
import { commerceConfig } from "@/config/commerce";

export function UnlockCreationModal({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const viewed = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const later = useRef<HTMLButtonElement>(null);
  const product = commerceConfig.products.starterPack;

  useEffect(() => {
    if (!viewed.current) { viewed.current = true; track("paywall_viewed"); }
    const previous = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    later.current?.focus();
    return () => { element?.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);

  return <dialog ref={dialog} className="commerce-dialog unlock-dialog" aria-labelledby="unlock-title" aria-describedby="unlock-description" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <p className="eyebrow">A MOMENT CAN CONTINUE</p>
    <h2 id="unlock-title">继续留下这一刻。</h2>
    <p id="unlock-description">免费创作已经用完。刚才写下的内容仍然留在原处。</p>
    <div className="unlock-product"><span>{product.name}</span><strong>¥{product.priceCny}</strong><small>{product.creationCount} 次完整创作</small></div>
    <div className="commerce-dialog-actions"><button ref={later} type="button" className="secondary-action" onClick={onClose}>以后再说</button><button type="button" className="primary-action" onClick={onUnlock}>解锁 {product.creationCount} 次创作</button></div>
  </dialog>;
}
