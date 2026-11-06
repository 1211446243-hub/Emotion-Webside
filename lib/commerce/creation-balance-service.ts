import { commerceConfig } from "@/config/commerce";
import type { CreationBalanceRepository } from "./creation-balance-repository";

/** Business entry point for grants, purchases, consumption and refunds. */
export class CreationBalanceService {
  constructor(private readonly repository: CreationBalanceRepository) {}

  async getBalance(userId: string) {
    const existing = await this.repository.getBalance(userId);
    return existing ?? this.grantFreeCredits(userId);
  }

  grantFreeCredits(userId: string) {
    return this.repository.grantFreeCredits(userId, commerceConfig.freeCreationCount);
  }

  addPurchasedCredits(userId: string, amount: number, productId?: string, purchaseId?: string) {
    return this.repository.addPurchasedCredits(userId, amount, productId, purchaseId);
  }

  consumeCreationCredit(userId: string, sessionId: string) {
    return this.repository.consumeCreationCredit(userId, sessionId);
  }

  refundCreationCredit(userId: string, sessionId: string) {
    return this.repository.refundCreationCredit(userId, sessionId);
  }

  getTransactions(userId: string) {
    return this.repository.getTransactions(userId);
  }

  subscribe = (listener: () => void) => this.repository.subscribe(listener);
  getSnapshot = () => this.repository.getSnapshot();
}
