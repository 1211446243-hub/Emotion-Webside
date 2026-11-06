import { MockCreationBalanceRepository } from "@/lib/commerce/mock-creation-balance-repository";
export const debugPresets = { free3: [3, 0], free1: [1, 0], free0: [0, 0], paid5: [0, 5], empty: [0, 0] } as const;
const failureKey = "untitled_debug_fail_next";
export function setDebugBalance(userId: string, preset: keyof typeof debugPresets) {
  if (process.env.NODE_ENV !== "development") throw new Error("Debug 仅限开发环境。");
  const [freeRemaining, paidRemaining] = debugPresets[preset];
  return new MockCreationBalanceRepository(() => localStorage).setDebugBalance(userId, { freeRemaining, paidRemaining });
}
export function armDebugFailure() {
  if (process.env.NODE_ENV !== "development") throw new Error("Debug 仅限开发环境。");
  sessionStorage.setItem(failureKey, "1");
}
export function consumeDebugFailure() {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return false;
  const armed = sessionStorage.getItem(failureKey) === "1";
  if (armed) sessionStorage.removeItem(failureKey);
  return armed;
}
