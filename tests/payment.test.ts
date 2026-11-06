import test from "node:test";
import assert from "node:assert/strict";
import { commerceConfig } from "@/config/commerce";
import { CreationBalanceService } from "@/lib/commerce/creation-balance-service";
import { MockCreationBalanceRepository } from "@/lib/commerce/mock-creation-balance-repository";
import { MockPaymentProvider, PURCHASE_STORAGE_KEY } from "@/lib/payment/mock-provider";
import { PaymentService } from "@/lib/payment/payment-service";

function memoryStorage() {
  const data = new Map<string, string>();
  let blocked = false;
  return {
    data,
    storage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { if (blocked) throw new Error("storage blocked"); data.set(key, value); },
    },
    block: (value: boolean) => { blocked = value; },
  };
}

test("Mock checkout persists a pending Purchase and verification marks it paid", async () => {
  const memory = memoryStorage();
  const provider = new MockPaymentProvider(() => memory.storage);
  const checkout = await provider.createCheckout(commerceConfig.products.starterPack.id, "demo-user");
  assert.equal(checkout.purchase.status, "pending");
  assert.equal(checkout.purchase.amountCny, 19.9);
  assert.equal(checkout.purchase.creationCount, 5);

  const result = await provider.verifyPayment(checkout.paymentId);
  assert.equal(result.status, "paid");
  assert.equal(result.purchase.status, "paid");
  const restarted = new MockPaymentProvider(() => memory.storage);
  assert.equal((await restarted.getPurchase(checkout.paymentId))?.status, "paid");
});

test("paid checkout adds five credits once even when completion is retried", async () => {
  const purchaseMemory = memoryStorage();
  const balanceMemory = memoryStorage();
  const balances = new CreationBalanceService(new MockCreationBalanceRepository(() => balanceMemory.storage));
  const payments = new PaymentService(new MockPaymentProvider(() => purchaseMemory.storage), balances);
  await balances.getBalance("demo-user");
  for (let index = 0; index < 3; index++) await balances.consumeCreationCredit("demo-user", `free-${index}`);

  const checkout = await payments.createCheckout(commerceConfig.products.starterPack.id, "demo-user");
  const first = await payments.completeCheckout(checkout.paymentId);
  const repeated = await payments.completeCheckout(checkout.paymentId);
  assert.deepEqual(first.balance, { freeRemaining: 0, paidRemaining: 5 });
  assert.deepEqual(repeated.balance, { freeRemaining: 0, paidRemaining: 5 });
  assert.equal((await balances.getTransactions("demo-user")).filter((item) => item.type === "purchase").length, 1);
});

test("a paid Purchase can safely retry credit delivery after a storage failure", async () => {
  const purchaseMemory = memoryStorage();
  const balanceMemory = memoryStorage();
  const balances = new CreationBalanceService(new MockCreationBalanceRepository(() => balanceMemory.storage));
  const provider = new MockPaymentProvider(() => purchaseMemory.storage);
  const payments = new PaymentService(provider, balances);
  await balances.getBalance("demo-user");
  const checkout = await payments.createCheckout(commerceConfig.products.starterPack.id, "demo-user");

  balanceMemory.block(true);
  await assert.rejects(payments.completeCheckout(checkout.paymentId), /无法读取|无法保存/);
  assert.equal((await provider.getPurchase(checkout.paymentId))?.status, "paid");
  balanceMemory.block(false);
  assert.deepEqual((await payments.completeCheckout(checkout.paymentId)).balance, { freeRemaining: 3, paidRemaining: 5 });
  assert.deepEqual((await payments.completeCheckout(checkout.paymentId)).balance, { freeRemaining: 3, paidRemaining: 5 });
});

test("invalid products and corrupt purchase storage fail without overwriting data", async () => {
  const memory = memoryStorage();
  const provider = new MockPaymentProvider(() => memory.storage);
  await assert.rejects(provider.createCheckout("unknown-product", "demo-user"), /不可用/);
  memory.data.set(PURCHASE_STORAGE_KEY, "{broken");
  await assert.rejects(provider.createCheckout(commerceConfig.products.starterPack.id, "demo-user"), /未覆盖/);
  assert.equal(memory.data.get(PURCHASE_STORAGE_KEY), "{broken");
});

