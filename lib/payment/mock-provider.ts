import { commerceConfig } from "@/config/commerce";
import type { Purchase } from "@/types/commerce";
import { PaymentError, type PaymentProvider } from "./provider";

export const PURCHASE_STORAGE_KEY = "untitled_purchases_v1";

interface PurchaseStore {
  version: 1;
  purchases: Purchase[];
}

type PurchaseStorage = Pick<Storage, "getItem" | "setItem">;
const statuses = new Set<Purchase["status"]>(["pending", "paid", "failed", "refunded"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validPurchase(value: unknown): value is Purchase {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && value.id.length > 0
    && typeof value.userId === "string" && value.userId.length > 0
    && typeof value.productId === "string" && value.productId.length > 0
    && typeof value.amountCny === "number" && Number.isFinite(value.amountCny) && value.amountCny > 0
    && typeof value.creationCount === "number" && Number.isSafeInteger(value.creationCount) && value.creationCount > 0
    && typeof value.status === "string" && statuses.has(value.status as Purchase["status"])
    && typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt));
}

function findProduct(productId: string) {
  return Object.values(commerceConfig.products).find((product) => product.id === productId && product.active);
}

/** Development-only purchase adapter. It never contacts a payment network. */
export class MockPaymentProvider implements PaymentProvider {
  constructor(private readonly storage: () => PurchaseStorage) {}

  private read(): PurchaseStore {
    let raw: string | null;
    try { raw = this.storage().getItem(PURCHASE_STORAGE_KEY); }
    catch { throw new PaymentError("无法读取模拟购买记录，请检查浏览器存储设置。"); }
    if (raw === null) return { version: 1, purchases: [] };
    try {
      const value: unknown = JSON.parse(raw);
      if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.purchases) || !value.purchases.every(validPurchase)) throw new Error("invalid store");
      if (new Set(value.purchases.map((purchase) => purchase.id)).size !== value.purchases.length) throw new Error("duplicate purchase");
      return value as unknown as PurchaseStore;
    } catch {
      throw new PaymentError("模拟购买记录无法读取。为保护已有记录，未覆盖本地存储。");
    }
  }

  private write(store: PurchaseStore) {
    try { this.storage().setItem(PURCHASE_STORAGE_KEY, JSON.stringify(store)); }
    catch { throw new PaymentError("无法保存模拟购买记录，请检查浏览器存储空间。"); }
  }

  async createCheckout(productId: string, userId: string) {
    const product = findProduct(productId);
    if (!product) throw new PaymentError("当前作品包暂时不可用。");
    if (!userId.trim()) throw new PaymentError("请先登录，再继续创作。");
    const store = this.read();
    const purchase: Purchase = {
      id: crypto.randomUUID(), userId, productId: product.id, amountCny: product.priceCny,
      creationCount: product.creationCount, status: "pending", createdAt: new Date().toISOString(),
    };
    store.purchases.unshift(purchase);
    this.write(store);
    return { paymentId: purchase.id, purchase: { ...purchase } };
  }

  async verifyPayment(paymentId: string) {
    const store = this.read();
    const purchase = store.purchases.find((item) => item.id === paymentId);
    if (!purchase) throw new PaymentError("找不到这次模拟购买。");
    if (purchase.status === "failed" || purchase.status === "refunded") return { paymentId, status: "failed" as const, purchase: { ...purchase } };
    if (purchase.status !== "paid") { purchase.status = "paid"; this.write(store); }
    return { paymentId, status: "paid" as const, purchase: { ...purchase } };
  }

  async getPurchase(paymentId: string) {
    const purchase = this.read().purchases.find((item) => item.id === paymentId);
    return purchase ? { ...purchase } : null;
  }
  async getPurchases(userId: string) {
    if (!userId.trim()) throw new PaymentError("请先登录。");
    return this.read().purchases.filter((purchase) => purchase.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((purchase) => ({ ...purchase }));
  }
}
