import type { CreationBalance, CreationCreditSource, CreationTransaction } from "@/types/commerce";

export interface CreationBalanceRepository {
  getBalance(userId: string): Promise<CreationBalance | null>;
  getTransactions(userId: string): Promise<CreationTransaction[]>;
  grantFreeCredits(userId: string, amount: number): Promise<CreationBalance>;
  addPurchasedCredits(userId: string, amount: number, productId?: string, purchaseId?: string): Promise<CreationBalance>;
  consumeCreationCredit(userId: string, sessionId: string): Promise<CreationBalance>;
  refundCreationCredit(userId: string, sessionId: string): Promise<CreationBalance>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): string | null;
}

export class CreationBalanceError extends Error {
  constructor(message: string, readonly code: "quota_exhausted" | "invalid_operation" | "storage_unavailable") {
    super(message);
    this.name = "CreationBalanceError";
  }
}

export function isCreationCreditSource(value: unknown): value is CreationCreditSource {
  return value === "free" || value === "paid";
}
