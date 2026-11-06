
import { track } from "@/lib/analytics/service";
import type { Artwork } from "@/types/artwork";
import type { GenerationInput } from "@/types/generation";
import type { ArtworkRepository } from "@/lib/storage/artwork-repository";

/** No balance dependency: this expression is included in the already-owned creation. */
export class RegenerationService {
  private pending = new Set<string>();
  constructor(private repository: Pick<ArtworkRepository, "getById" | "appendExpression">,
    private generate: (input: GenerationInput) => Promise<Artwork>) {}
  async regenerate(id: string) {
    if (this.pending.has(id)) throw new Error("正在留下另一种表达，请稍候。");
    this.pending.add(id);
    try {
      const art = await this.repository.getById(id);
      const session = art?.creationSession;
      if (!art || !session?.entitlement.allowRegenerate || session.entitlement.regenerateLimit !== 1) throw new Error("这幅作品不包含重新表达权益。");
      if (session.regenerateUsed || session.regeneratedExpression) throw new Error("这次创作已经换过一种表达。");
      const next = await this.generate({ text: art.originalText, userId: art.userId, stylePreset: art.stylePreset, entitlementTier: "full", expressionIndex: 1 });
      const result = await this.repository.appendExpression(id, next);
      track("regeneration_used"); return result;
    } finally { this.pending.delete(id); }
  }
}
