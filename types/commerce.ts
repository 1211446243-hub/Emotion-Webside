export type ProductType = "single_creation" | "creation_pack";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  priceCny: number;
  creationCount: number;
  active: boolean;
}

export interface CreationBalance {
  freeRemaining: number;
  paidRemaining: number;
}

export type CreationCreditSource = "free" | "paid";

export type CreationEntitlementTier = "free" | "full";

export interface CreationEntitlement {
  tier: CreationEntitlementTier;
  candidateVariants: number;
  allowHighResolutionDownload: boolean;
  allowPhilosophicalExplanation: boolean;
  allowShareCard: boolean;
  allowRegenerate: boolean;
  regenerateLimit: number;
}

export interface CreationTransaction {
  id: string;
  userId: string;
  type: "free_grant" | "purchase" | "creation" | "refund";
  amount: number;
  source?: CreationCreditSource;
  sessionId?: string;
  productId?: string;
  createdAt: string;
}

export interface CreationPermission {
  allowed: boolean;
  source: CreationCreditSource | "none";
  reason?: "quota_exhausted" | "daily_limit" | "account_restricted";
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  amountCny: number;
  creationCount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
}
