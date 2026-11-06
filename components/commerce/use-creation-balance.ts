"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { creationBalanceService } from "@/lib/commerce/commerce-service";
import type { CreationBalance } from "@/types/commerce";

export function useCreationBalance(userId: string | null) {
  const revision = useSyncExternalStore(creationBalanceService.subscribe, creationBalanceService.getSnapshot, () => null);
  const [result, setResult] = useState<{ balance?: CreationBalance; error?: string; loaded: boolean; userId: string | null }>({ loaded: false, userId: null });

  useEffect(() => {
    let active = true;
    if (!userId) { Promise.resolve().then(() => { if (active) setResult({ loaded: true, userId: null }); }); return () => { active = false; }; }
    creationBalanceService.getBalance(userId)
      .then((balance) => { if (active) setResult({ balance, loaded: true, userId }); })
      .catch((error: unknown) => { if (active) setResult({ error: error instanceof Error ? error.message : "暂时无法读取创作次数。", loaded: true, userId }); });
    return () => { active = false; };
  }, [userId, revision]);

  const current = result.userId === userId;
  return { balance: current ? result.balance : undefined, error: current ? result.error : undefined, loaded: current && result.loaded };
}

