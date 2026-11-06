import { creationEntitlements } from "@/config/creation-entitlements";
import { philosophyThemes } from "@/data/philosophy-themes";
import { mockArtworks } from "@/data/mock-artworks";
import type { CreationArtworkVersion, CreationSession } from "@/types/artwork";
import type { CreationEntitlement, CreationEntitlementTier } from "@/types/commerce";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteOptional(value: unknown) {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= 0);
}

function isEntitlement(value: unknown): value is CreationEntitlement {
  if (!isRecord(value) || (value.tier !== "free" && value.tier !== "full")) return false;
  const expected = creationEntitlements[value.tier as CreationEntitlementTier];
  return Object.entries(expected).every(([key, item]) => value[key] === item);
}

function isArtworkVersion(value: unknown, role: CreationArtworkVersion["role"]): value is CreationArtworkVersion {
  if (!isRecord(value) || value.role !== role || typeof value.id !== "string" || !value.id
    || typeof value.imageUrl !== "string" || !mockArtworks.some((item) => item.url === value.imageUrl)
    || value.aspectRatio !== "4:5" || typeof value.provider !== "string" || typeof value.model !== "string") return false;
  return isRecord(value.generationPrompt) && value.generationPrompt.aspectRatio === value.aspectRatio;
}

export function isCreationSession(value: unknown): value is CreationSession {
  if (isRecord(value)) {
    if (value.regenerateUsed !== undefined && typeof value.regenerateUsed !== "boolean") return false;
    if (value.regeneratedExpression !== undefined) {
      const next = value.regeneratedExpression;
      if (!value.regenerateUsed || !isRecord(next) || next.regeneratedExpression !== undefined || next.regenerateUsed
        || !isCreationSession(next) || next.userId !== value.userId || next.id === value.id
        || !isRecord(value.entitlement) || value.entitlement.tier !== "full") return false;
    } else if (value.regenerateUsed) return false;
  }
  if (!isRecord(value) || typeof value.id !== "string" || !value.id || typeof value.userId !== "string" || !value.userId
    || value.status !== "completed" || !isEntitlement(value.entitlement) || value.aspectRatio !== "4:5"
    || !isArtworkVersion(value.mainArtwork, "main") || !Array.isArray(value.candidateArtworks)
    || value.candidateArtworks.length !== value.entitlement.candidateVariants
    || !value.candidateArtworks.every((item) => isArtworkVersion(item, "candidate"))
    || new Set([value.mainArtwork.imageUrl, ...value.candidateArtworks.map((item) => item.imageUrl)]).size !== value.candidateArtworks.length + 1
    || !isRecord(value.philosophy) || typeof value.philosophy.theme !== "string" || !(value.philosophy.theme in philosophyThemes)
    || typeof value.philosophy.themeName !== "string" || typeof value.philosophy.quote !== "string"
    || (value.philosophy.explanation !== undefined && typeof value.philosophy.explanation !== "string")
    || typeof value.createdAt !== "string" || Number.isNaN(Date.parse(value.createdAt))
    || typeof value.updatedAt !== "string" || Number.isNaN(Date.parse(value.updatedAt))) return false;
  if (value.entitlement.allowPhilosophicalExplanation !== Boolean(value.philosophy.explanation)) return false;
  if (value.providerUsage !== undefined && (!Array.isArray(value.providerUsage) || !value.providerUsage.every((usage) => isRecord(usage)
    && typeof usage.provider === "string" && typeof usage.model === "string" && isFiniteOptional(usage.inputTokens)
    && isFiniteOptional(usage.outputTokens) && isFiniteOptional(usage.imageCount) && isFiniteOptional(usage.estimatedCost)))) return false;
  return value.cost === undefined || (isRecord(value.cost) && isFiniteOptional(value.cost.textModelCost)
    && isFiniteOptional(value.cost.imageGenerationCost) && isFiniteOptional(value.cost.storageCost) && isFiniteOptional(value.cost.totalCost));
}
