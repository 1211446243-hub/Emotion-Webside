"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-state";
import { authService } from "@/lib/auth/auth-service";
import { creationPolicyService } from "@/lib/commerce/commerce-service";
import { UnlockCreationModal } from "@/components/commerce/unlock-creation-modal";
import { MockCheckoutModal } from "@/components/commerce/mock-checkout-modal";
import { PhilosophyPlaceholder } from "./philosophy-placeholder";

const MAX_CHARACTERS = 1000;

export function ThoughtInput() {
  const { user, draft: value, setDraft: setValue } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const length = Array.from(value).length;
  const valid = Array.from(value.trim()).length >= 2 && length <= MAX_CHARACTERS;

  useLayoutEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 360)}px`;
    }
  }, [value]);

  function updateValue(text: string) {
    const next = composing.current ? text : Array.from(text).slice(0, MAX_CHARACTERS).join("");
    setValue(next);
    setMessage("");
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 360)}px`;
    }
  }

  return <form className="thought-form" onSubmit={async (event) => {
    event.preventDefault();
    if (!valid || checking) return;
    if (!user || !authService.getSessionSnapshot()) {
      router.push("/login?returnTo=%2Fcreate");
      return;
    }
    setChecking(true); setMessage("");
    try {
      const permission = await creationPolicyService.canCreate(user.id);
      if (!permission.allowed) { setPaywall(true); return; }
      router.push("/create");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时无法读取创作次数，请再试一次。");
    } finally { setChecking(false); }
  }}>
    <div className="input-frame">
      <label className="sr-only" htmlFor="thought">此刻的想法</label>
      <div className="writing-area">
        <PhilosophyPlaceholder hidden={value.length > 0} />
        <textarea ref={textarea} id="thought" name="thought" aria-label="此刻的想法" aria-describedby="input-note input-count" rows={6} value={value}
          onChange={(event) => updateValue(event.target.value)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => { composing.current = false; updateValue(event.currentTarget.value); }}
        />
      </div>
      <div className="input-bottom"><span>只言片语，也可以。</span><span id="input-count" className={length >= 900 ? "character-count" : "sr-only"}>{length} / {MAX_CHARACTERS}</span><span className="writing-mark" aria-hidden="true">↙</span></div>
    </div>
    <div className="form-bottom"><p id="input-note"><span className="small-lock" aria-hidden="true">◇</span> 这一刻，先留给自己。</p><button className="generate-button" type="submit" disabled={!valid || checking}>{checking ? "正在确认……" : "生成此刻"} <span aria-hidden="true">↗</span></button></div>
    <p className="form-message" role="status" aria-live="polite">{message}</p>
    {paywall && <UnlockCreationModal onClose={() => setPaywall(false)} onUnlock={() => { setPaywall(false); setCheckout(true); }} />}
    {checkout && user && <MockCheckoutModal userId={user.id} onClose={() => setCheckout(false)} onCompleted={() => { setCheckout(false); setMessage("可以继续创作了。"); router.push("/create"); }} />}
  </form>;
}
