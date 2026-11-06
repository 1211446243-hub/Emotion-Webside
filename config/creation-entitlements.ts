import type { CreationCreditSource, CreationEntitlement, CreationEntitlementTier } from "@/types/commerce";

/** All entitlement rules live here; components and providers consume a resolved snapshot. */
export const creationEntitlements = {
  free: {
    tier: "free",
    candidateVariants: 0,
    allowHighResolutionDownload: false,
    allowPhilosophicalExplanation: false,
    allowShareCard: false,
    allowRegenerate: false,
    regenerateLimit: 0,
  },
  full: {
    tier: "full",
    candidateVariants: 3,
    allowHighResolutionDownload: true,
    allowPhilosophicalExplanation: true,
    allowShareCard: true,
    allowRegenerate: true,
    regenerateLimit: 1,
  },
} as const satisfies Record<CreationEntitlementTier, CreationEntitlement>;

export function getCreationEntitlement(tier: CreationEntitlementTier): CreationEntitlement {
  return { ...creationEntitlements[tier] };
}

export function getEntitlementTierForSource(source: Exclude<CreationCreditSource | "none", "none">): CreationEntitlementTier {
  return source === "paid" ? "full" : "free";
}
