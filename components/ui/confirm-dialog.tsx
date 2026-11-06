"use client";
import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, pending, error, onClose, onConfirm }: { open: boolean; pending: boolean; error?: string; onClose: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (open) { const previous = document.activeElement; element?.showModal(); cancel.current?.focus(); return () => { element?.close(); if (previous instanceof HTMLElement) previous.focus(); }; }
  }, [open]);
  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}>
    <h2 id="delete-title">删除这一刻？</h2><p id="delete-description">删除后无法恢复。</p>
    {error && <p role="alert">{error}</p>}
    <div><button ref={cancel} type="button" disabled={pending} onClick={onClose}>取消</button><button type="button" className="danger-action" disabled={pending} onClick={onConfirm}>{pending ? "正在删除……" : "删除"}</button></div>
  </dialog>;
}
