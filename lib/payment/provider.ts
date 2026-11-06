import type { Purchase } from "@/types/commerce";
import type { CheckoutSession, PaymentResult } from "./types";

export interface PaymentProvider {
  getPurchases(userId: string): Promise<Purchase[]>;
  createCheckout(productId: string, userId: string): Promise<CheckoutSession>;
  verifyPayment(paymentId: string): Promise<PaymentResult>;
  getPurchase(paymentId: string): Promise<Purchase | null>;
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}
