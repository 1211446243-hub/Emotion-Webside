import type { CreationBalance, CreationCreditSource, CreationTransaction } from "@/types/commerce";
import { CreationBalanceError, isCreationCreditSource, type CreationBalanceRepository } from "./creation-balance-repository";
import { track } from "@/lib/analytics/service";

export const COMMERCE_STORAGE_KEY = "untitled_commerce_v1";

interface CommerceStore {
  version: 1;
  balances: Record<string, CreationBalance>;
  transactions: CreationTransaction[];
}

type CommerceStorage = Pick<Storage, "getItem" | "setItem">;
const emptyStore = (): CommerceStore => ({ version: 1, balances: {}, transactions: [] });
const transactionTypes = new Set<CreationTransaction["type"]>(["free_grant", "purchase", "creation", "refund"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function validBalance(value: unknown): value is CreationBalance {
  return isRecord(value) && isCount(value.freeRemaining) && isCount(value.paidRemaining);
}

function validTransaction(value: unknown): value is CreationTransaction {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && value.id.length > 0
    && typeof value.userId === "string" && value.userId.length > 0
    && typeof value.type === "string" && transactionTypes.has(value.type as CreationTransaction["type"])
    && typeof value.amount === "number" && Number.isSafeInteger(value.amount) && value.amount !== 0
    && (value.source === undefined || isCreationCreditSource(value.source))
    && (value.sessionId === undefined || typeof value.sessionId === "string")
    && (value.productId === undefined || typeof value.productId === "string")
    && typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt));
}

function validateIdentity(userId: string) {
  if (!userId.trim()) throw new CreationBalanceError("无法确认当前用户。", "invalid_operation");
}

function validateAmount(amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new CreationBalanceError("创作次数必须是正整数。", "invalid_operation");
}

/** Versioned LocalStorage adapter. Every balance change and its ledger entry share one write. */
export class MockCreationBalanceRepository implements CreationBalanceRepository {
  private listeners = new Set<() => void>();

  constructor(private readonly storage: () => CommerceStorage) {}

  private read(): CommerceStore {
    let raw: string | null;
    try { raw = this.storage().getItem(COMMERCE_STORAGE_KEY); }
    catch { throw new CreationBalanceError("无法读取创作次数，请检查浏览器存储设置。", "storage_unavailable"); }
    if (raw === null) return emptyStore();
    try {
      const data: unknown = JSON.parse(raw);
      if (!isRecord(data) || data.version !== 1 || !isRecord(data.balances) || !Object.values(data.balances).every(validBalance)
        || !Array.isArray(data.transactions) || !data.transactions.every(validTransaction)) throw new Error("invalid store");
      if (new Set(data.transactions.map((transaction) => transaction.id)).size !== data.transactions.length) throw new Error("duplicate transaction");
      return data as unknown as CommerceStore;
    } catch {
      throw new CreationBalanceError("创作次数数据无法读取。为保护已有记录，未覆盖本地存储。", "storage_unavailable");
    }
  }

  private write(store: CommerceStore) {
    try { this.storage().setItem(COMMERCE_STORAGE_KEY, JSON.stringify(store)); }
    catch { throw new CreationBalanceError("无法保存创作次数，请检查浏览器存储空间。", "storage_unavailable"); }
    this.listeners.forEach((listener) => listener());
  }

  private transaction(input: Omit<CreationTransaction, "id" | "createdAt">): CreationTransaction {
    return { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  }

  getSnapshot = (): string | null => {
    try { return this.storage().getItem(COMMERCE_STORAGE_KEY); }
    catch { return "storage-unavailable"; }
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    const onStorage = (event: StorageEvent) => { if (event.key === COMMERCE_STORAGE_KEY || event.key === null) listener(); };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      this.listeners.delete(listener);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  };

  async getBalance(userId: string) {
    validateIdentity(userId);
    const balance = this.read().balances[userId];
    return balance ? { ...balance } : null;
  }
  async setDebugBalance(userId: string, balance: CreationBalance) {
    if (process.env.NODE_ENV !== "development") throw new Error("Debug 仅限开发环境。");
    validateIdentity(userId);
    if (!validBalance(balance)) throw new Error("无效测试额度。");
    const store = this.read();
    const previous = store.balances[userId] ?? { freeRemaining: 0, paidRemaining: 0 };
    for (const source of ["free", "paid"] as const) {
      const field = source === "free" ? "freeRemaining" : "paidRemaining";
      const amount = balance[field] - previous[field];
      if (amount) store.transactions.push(this.transaction({ userId, type: amount > 0 ? "refund" : "creation", source, amount, sessionId: `debug-${crypto.randomUUID()}` }));
    }
    store.balances[userId] = { ...balance }; this.write(store);
    window.dispatchEvent(new StorageEvent("storage", { key: COMMERCE_STORAGE_KEY }));
  }

  async getTransactions(userId: string) {
    validateIdentity(userId);
    return this.read().transactions.filter((transaction) => transaction.userId === userId).map((transaction) => ({ ...transaction }));
  }

  async grantFreeCredits(userId: string, amount: number) {
    validateIdentity(userId); validateAmount(amount);
    const store = this.read();
    const existing = store.balances[userId];
    if (existing) return { ...existing };
    const balance = { freeRemaining: amount, paidRemaining: 0 };
    store.balances[userId] = balance;
    store.transactions.push(this.transaction({ userId, type: "free_grant", amount, source: "free" }));
    this.write(store);
    return { ...balance };
  }

  async addPurchasedCredits(userId: string, amount: number, productId?: string, purchaseId?: string) {
    validateIdentity(userId); validateAmount(amount);
    const store = this.read();
    if (purchaseId) {
      const existing = store.transactions.find((transaction) => transaction.userId === userId && transaction.type === "purchase" && transaction.sessionId === purchaseId);
      if (existing) return { ...(store.balances[userId] ?? { freeRemaining: 0, paidRemaining: 0 }) };
    }
    const balance = store.balances[userId] ?? { freeRemaining: 0, paidRemaining: 0 };
    balance.paidRemaining += amount;
    store.balances[userId] = balance;
    store.transactions.push(this.transaction({ userId, type: "purchase", amount, source: "paid", productId, sessionId: purchaseId }));
    this.write(store);
    track("purchase_completed");
    return { ...balance };
  }

  async consumeCreationCredit(userId: string, sessionId: string) {
    validateIdentity(userId);
    if (!sessionId.trim()) throw new CreationBalanceError("缺少创作记录。", "invalid_operation");
    const store = this.read();
    const existing = store.transactions.find((transaction) => transaction.userId === userId && transaction.type === "creation" && transaction.sessionId === sessionId);
    if (existing) return { ...(store.balances[userId] ?? { freeRemaining: 0, paidRemaining: 0 }) };
    const balance = store.balances[userId];
    if (!balance || (balance.freeRemaining === 0 && balance.paidRemaining === 0)) throw new CreationBalanceError("可用创作次数已经用完。", "quota_exhausted");
    const source: CreationCreditSource = balance.freeRemaining > 0 ? "free" : "paid";
    if (source === "free") balance.freeRemaining -= 1;
    else balance.paidRemaining -= 1;
    store.transactions.push(this.transaction({ userId, type: "creation", amount: -1, source, sessionId }));
    this.write(store);
    track("creation_completed");
    if (source === "free") { track("free_creation_used"); if (balance.freeRemaining === 0) track("free_quota_exhausted"); }
    return { ...balance };
  }

  async refundCreationCredit(userId: string, sessionId: string) {
    validateIdentity(userId);
    if (!sessionId.trim()) throw new CreationBalanceError("缺少创作记录。", "invalid_operation");
    const store = this.read();
    const balance = store.balances[userId];
    const creation = store.transactions.find((transaction) => transaction.userId === userId && transaction.type === "creation" && transaction.sessionId === sessionId);
    if (!balance || !creation?.source) throw new CreationBalanceError("找不到可以退回的创作记录。", "invalid_operation");
    const refunded = store.transactions.some((transaction) => transaction.userId === userId && transaction.type === "refund" && transaction.sessionId === sessionId);
    if (refunded) return { ...balance };
    if (creation.source === "free") balance.freeRemaining += 1;
    else balance.paidRemaining += 1;
    store.transactions.push(this.transaction({ userId, type: "refund", amount: 1, source: creation.source, sessionId }));
    this.write(store);
    return { ...balance };
  }
}
