import type { Artwork } from "@/types/artwork";
import type { ArtworkRepository } from "@/lib/storage/artwork-repository";
import type { CreationBalanceService } from "./creation-balance-service";

/** Saves the successful creation before consuming one idempotent credit. */
export class CreationCompletionService {
  constructor(
    private readonly artworks: Pick<ArtworkRepository, "saveGenerated">,
    private readonly balances: Pick<CreationBalanceService, "consumeCreationCredit">,
  ) {}

  async complete(artwork: Artwork) {
    const saved = await this.artworks.saveGenerated(artwork);
    const balance = await this.balances.consumeCreationCredit(saved.userId, saved.id);
    return { artwork: saved, balance };
  }
}

