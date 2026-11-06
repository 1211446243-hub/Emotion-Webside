"use client";

import { useEffect, useRef } from "react";
import { relaxingPrompts } from "@/data/relaxing-prompts";

export function PhilosophyPlaceholder({ hidden }: { hidden: boolean }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const selected = useRef<string | null>(null);
  useEffect(() => {
    // Select after hydration, once per mount; never rotate while someone reads.
    selected.current ??= relaxingPrompts[Math.floor(Math.random() * relaxingPrompts.length)];
    if (textRef.current) textRef.current.textContent = selected.current;
  }, []);
  return <span ref={textRef} className="philosophy-placeholder" aria-hidden="true" hidden={hidden}>{relaxingPrompts[0]}</span>;
}
