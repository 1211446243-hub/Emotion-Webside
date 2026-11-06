import test from "node:test";
import assert from "node:assert/strict";
import { MockAnalyticsProvider } from "@/lib/analytics/mock-provider";
import { analyticsEvents, type AnalyticsEvent } from "@/lib/analytics/types";
import { MockPaymentProvider } from "@/lib/payment/mock-provider";
import { MockCreationBalanceRepository } from "@/lib/commerce/mock-creation-balance-repository";
import { consumeDebugFailure } from "@/lib/debug/service";

test("Analytics only emits allowlisted names and timestamps, never arbitrary private payloads", () => {
  const previous = process.env.NODE_ENV; const logs: unknown[][] = [];
  const info = console.info;
  try {
    Object.assign(process.env, { NODE_ENV: "development" });
    console.info = (...args) => { logs.push(args); };
    const provider = new MockAnalyticsProvider();
    for (const event of analyticsEvents) provider.track(event);
    provider.track("private original text" as AnalyticsEvent);
    assert.equal(logs.length, 12);
    for (const entry of logs) assert.deepEqual(Object.keys(entry[1] as object).sort(), ["event", "occurredAt"]);
    Object.assign(process.env, { NODE_ENV: "production" });
    provider.track("creation_started"); assert.equal(logs.length, 12);
  } finally { console.info = info; if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV"); else Object.assign(process.env, { NODE_ENV: previous }); }
});

test("Purchase history filters users, restores statuses, and preserves corrupt data", async () => {
  const data = new Map<string, string>();
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
  const provider = new MockPaymentProvider(() => storage);
  const checkout = await provider.createCheckout("starter-pack", "one");
  await provider.createCheckout("starter-pack", "two");
  await provider.verifyPayment(checkout.paymentId);
  const restored = new MockPaymentProvider(() => storage);
  assert.equal((await restored.getPurchases("one")).length, 1);
  assert.equal((await restored.getPurchases("one"))[0].status, "paid");
  assert.deepEqual(await restored.getPurchases("three"), []);
  data.set("untitled_purchases_v1", "broken");
  await assert.rejects(restored.getPurchases("one"));
  assert.equal(data.get("untitled_purchases_v1"), "broken");
});

test("production debug mutations are rejected and failure switch is inactive", async () => {
  const previous = process.env.NODE_ENV;
  try {
    Object.assign(process.env, { NODE_ENV: "production" });
    const repository = new MockCreationBalanceRepository(() => { throw new Error("must not read storage"); });
    await assert.rejects(repository.setDebugBalance("demo-user", { freeRemaining: 3, paidRemaining: 0 }), /仅限开发环境/);
    assert.equal(consumeDebugFailure(), false);
  } finally { if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV"); else Object.assign(process.env, { NODE_ENV: previous }); }
});

