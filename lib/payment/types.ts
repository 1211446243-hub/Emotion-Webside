import type { Purchase } from "@/types/commerce";

export interface CheckoutSession {
  paymentId: string;
  purchase: Purchase;
}

export interface PaymentResult {
  paymentId: string;
  status: "paid" | "failed";
  purchase: Purchase;
}

