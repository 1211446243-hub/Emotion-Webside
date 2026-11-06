import { creationBalanceService } from "@/lib/commerce/commerce-service";
import type { CreationBalanceService } from "@/lib/commerce/creation-balance-service";
import { MockPaymentProvider } from "./mock-provider";
import { PaymentError, type PaymentProvider } from "./provider";
import { track } from "@/lib/analytics/service";

export class PaymentService {
  constructor(private readonly provider: PaymentProvider, private readonly balances: Pick<CreationBalanceService, "addPurchasedCredits">) {}

  async createCheckout(productId: string, userId: string) {
    const checkout = await this.provider.createCheckout(productId, userId);
    track("checkout_started"); return checkout;
  }

  async completeCheckout(paymentId: string) {
    const result = await this.provider.verifyPayment(paymentId);
    if (result.status !== "paid") throw new PaymentError("模拟购买没有完成，请再试一次。");
    const purchase = result.purchase;
    const balance = await this.balances.addPurchasedCredits(purchase.userId, purchase.creationCount, purchase.productId, purchase.id);
    return { purchase, balance };
  }

  getPurchase(paymentId: string) {
    return this.provider.getPurchase(paymentId);
  }
  getPurchases(userId: string) { return this.provider.getPurchases(userId); }
}

const paymentProvider = new MockPaymentProvider(() => window.localStorage);
export const paymentService = new PaymentService(paymentProvider, creationBalanceService);
