import type { CreationPermission } from "@/types/commerce";
import type { CreationBalanceService } from "./creation-balance-service";

/** Single policy boundary; later phases can add limits without changing pages. */
export class CreationPolicyService {
  constructor(private readonly balances: CreationBalanceService) {}

  async canCreate(userId: string): Promise<CreationPermission> {
    const balance = await this.balances.getBalance(userId);
    if (balance.freeRemaining > 0) return { allowed: true, source: "free" };
    if (balance.paidRemaining > 0) return { allowed: true, source: "paid" };
    return { allowed: false, source: "none", reason: "quota_exhausted" };
  }
}

