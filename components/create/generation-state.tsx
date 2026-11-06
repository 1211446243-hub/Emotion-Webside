"use client";

import { track } from "@/lib/analytics/service";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-state";
import { authService } from "@/lib/auth/auth-service";
import { generateArtwork } from "@/lib/ai/generation-client";
import { preloadImage } from "@/lib/utils/preload-image";
import { generationConfig } from "@/config/generation";
import { getArtworkAlt } from "@/data/mock-artworks";
import { creationBalanceService, creationPolicyService } from "@/lib/commerce/commerce-service";
import { creationCompletionService } from "@/lib/commerce/creation-completion";
import type { Artwork } from "@/types/artwork";
import type { GenerationStage } from "@/types/generation";
import type { CreationBalance } from "@/types/commerce";
import type { CreationEntitlementTier } from "@/types/commerce";
import { getEntitlementTierForSource } from "@/config/creation-entitlements";

type ViewState =
  | { status: "checking" }
  | { status: "blocked"; message: string }
  | { status: "working"; stage: GenerationStage }
  | { status: "complete"; artwork: Artwork }
  | { status: "error" };
const stages: GenerationStage[] = ["understanding", "shaping", "painting"];

export function GenerationState() {
  const { user, draft } = useAuth();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ViewState>({ status: "checking" });
  const [balance, setBalance] = useState<CreationBalance | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loggedIn = () => Boolean(authService.getSessionSnapshot());
    if (!loggedIn() || !user) { router.replace("/login?returnTo=%2F%23create"); return; }
    if (!draft.trim()) return;
    const unsubscribe = authService.subscribe(() => {
      if (!loggedIn()) { controller.abort(); router.replace("/login?returnTo=%2F%23create"); }
    });
    // Deferring the start prevents StrictMode's setup/cleanup rehearsal from launching a request.
    const timer = setTimeout(async () => {
      let entitlementTier: CreationEntitlementTier;
      try {
        const permission = await creationPolicyService.canCreate(user.id);
        const currentBalance = await creationBalanceService.getBalance(user.id);
        if (controller.signal.aborted) return;
        setBalance(currentBalance);
        if (!permission.allowed || permission.source === "none") { setState({ status: "blocked", message: "可用创作次数已经用完。" }); return; }
        entitlementTier = getEntitlementTierForSource(permission.source);
      } catch (error) {
        if (!controller.signal.aborted) setState({ status: "blocked", message: error instanceof Error ? error.message : "暂时无法读取创作次数。" });
        return;
      }
      setState({ status: "working", stage: "understanding" });
      track("creation_started");
      try {
        const artwork = await generateArtwork({ text: draft, userId: user.id, entitlementTier }, {
          signal: controller.signal,
          onProgress: (stage) => { if (!controller.signal.aborted) setState({ status: "working", stage }); },
        });
        await preloadImage(artwork.imageUrl, controller.signal);
        if (!controller.signal.aborted && loggedIn()) {
          setState({ status: "complete", artwork }); setSaving(true); setSaveError("");
          try {
            const completed = await creationCompletionService.complete(artwork);
            if (!controller.signal.aborted) { setBalance(completed.balance); setSavedId(completed.artwork.id); }
          } catch (error) {
            if (!controller.signal.aborted) { track("creation_failed"); setSaveError(error instanceof Error ? error.message : "保存失败，请重试。"); }
          } finally { if (!controller.signal.aborted) setSaving(false); }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          if (process.env.NODE_ENV === "development") console.error("Generation failed", error);
          track("creation_failed");
          setState({ status: "error" });
        }
      }
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); unsubscribe(); };
  }, [draft, attempt, router, user]);

  useEffect(() => { if (state.status !== "working") heading.current?.focus({ preventScroll: true }); }, [state.status]);
  useEffect(() => {
    if (!savedId) return;
    const timer = setTimeout(() => router.replace(`/artwork/${savedId}`), 1400);
    return () => clearTimeout(timer);
  }, [savedId, router]);

  if (!draft.trim()) return <section className="generation-page empty-generation"><p className="eyebrow">A NEW MOMENT</p><h1>从此刻的想法开始。</h1><p>这里还没有写下的内容。</p><Link className="quiet-link" href="/#create">回去写几句 ↗</Link></section>;
  if (state.status === "blocked") return <section className="generation-page empty-generation"><p className="eyebrow">CREATION PAUSED</p><h1>{state.message}</h1><p>刚才写下的内容还在。</p><Link className="quiet-link" href="/#create">回去看看文字 ↗</Link></section>;

  const complete = state.status === "complete";
  const label = state.status === "checking" ? "正在准备这一刻……" : state.status === "working" ? generationConfig.labels[state.stage] : complete ? "这一刻，被留下了。" : "这一刻没有被成功留下。";
  const balanceLabel = balance ? balance.freeRemaining === 1 ? "这是你的最后一次免费创作。" : balance.freeRemaining > 0 ? `还有 ${balance.freeRemaining} 次免费创作` : `可用创作 ${balance.paidRemaining} 次` : "";
  return <section className={`generation-page ${complete ? "is-complete" : ""}`} aria-labelledby="generation-title">
    <div className="generation-caption"><p className="eyebrow">A MOMENT TAKING SHAPE</p>{balanceLabel && <p className="creation-balance-note">{balanceLabel}</p>}<h1 id="generation-title" ref={heading} tabIndex={-1}>{label}</h1><p className="sr-only" role="status" aria-live="polite">{label}</p></div>
    <div className={`generation-canvas ${state.status === "working" ? `stage-${state.stage}` : state.status}`} aria-busy={state.status === "working" || state.status === "checking"}>
      <div className="forming-landscape" aria-hidden="true"><span className="forming-light" /><span className="forming-ground" /><span className="forming-trail" /></div>
      {complete && <Image className="finished-artwork" src={state.artwork.imageUrl} width={800} height={1000} alt={getArtworkAlt(state.artwork.imageUrl)} unoptimized priority />}
      {state.status === "error" && <div className="generation-error"><span aria-hidden="true">—</span><p>文字还在，可以再试一次。</p><button type="button" className="generate-button" onClick={() => { setState({ status: "working", stage: "understanding" }); setAttempt((value) => value + 1); }}>再试一次 <span aria-hidden="true">↗</span></button></div>}
    </div>
    {state.status === "working" && <ol className="generation-steps" aria-label="生成进度">{stages.map((stage, index) => <li key={stage} aria-current={state.stage === stage ? "step" : undefined} className={stages.indexOf(state.stage) >= index ? "reached" : ""}><span aria-hidden="true">0{index + 1}</span>{["理解", "形状", "成画"][index]}</li>)}</ol>}
    {complete && <div className="generation-result"><blockquote>{state.artwork.quote}</blockquote><p className="generation-date">{new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(state.artwork.createdAt))} · 仅自己可见</p><p className="generation-note" role="status">{saveError || (savedId ? "已保存到本浏览器，正在打开作品……" : "正在保存这一刻……")}</p>{saveError && <button type="button" className="quiet-link" disabled={saving} onClick={async () => {
      setSaving(true);
      try { const completed = await creationCompletionService.complete(state.artwork); setBalance(completed.balance); setSaveError(""); setSavedId(completed.artwork.id); }
      catch (error) { setSaveError(error instanceof Error ? error.message : "保存失败，请重试。"); }
      finally { setSaving(false); }
    }}>{saving ? "正在保存……" : "重试保存"}</button>}{savedId && <Link className="quiet-link" href={`/artwork/${savedId}`}>查看作品 ↗</Link>}</div>}
    {!complete && <Link className="generation-back quiet-link" href="/#create">{state.status === "working" || state.status === "checking" ? "暂时停下，回去写" : "回去修改文字"}</Link>}
  </section>;
}
