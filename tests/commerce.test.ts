import test from "node:test";
import assert from "node:assert/strict";
import { commerceConfig } from "@/config/commerce";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { CreationBalanceService } from "@/lib/commerce/creation-balance-service";
import { CreationCompletionService } from "@/lib/commerce/creation-completion-service";
import { CreationPolicyService } from "@/lib/commerce/creation-policy-service";
import { COMMERCE_STORAGE_KEY, MockCreationBalanceRepository } from "@/lib/commerce/mock-creation-balance-repository";
import { MockArtworkRepository } from "@/lib/storage/mock-artwork-repository";
import type { User } from "@/types/user";

const user: User = { id: "demo-user", name: "User", avatar: null };

function memoryStorage() {
  const data = new Map<string, string>();
  let blocked = false;
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { if (blocked) throw new Error("storage blocked"); data.set(key, value); },
  };
  return { data, storage, block: (value: boolean) => { blocked = value; } };
}

function setupBalance() {
  const memory = memoryStorage();
  const repository = new MockCreationBalanceRepository(() => memory.storage);
  const service = new CreationBalanceService(repository);
  const policy = new CreationPolicyService(service);
  return { ...memory, repository, service, policy };
}

async function generatedArtwork() {
  return new GenerationService({
    text: new MockTextAIProvider(),
    image: new MockImageProvider(),
    delays: { understanding: 0, shaping: 0, painting: 0 },
  }).generateArtwork({ text: "我想把这个安静的下午留下来。", userId: user.id });
}

test("new users receive three free creations exactly once and persist", async () => {
  const state = setupBalance();
  assert.deepEqual(await state.service.getBalance(user.id), { freeRemaining: 3, paidRemaining: 0 });
  assert.deepEqual(await state.service.grantFreeCredits(user.id), { freeRemaining: 3, paidRemaining: 0 });
  assert.equal((await state.service.getTransactions(user.id)).filter((item) => item.type === "free_grant").length, 1);

  const restarted = new CreationBalanceService(new MockCreationBalanceRepository(() => state.storage));
  assert.deepEqual(await restarted.getBalance(user.id), { freeRemaining: 3, paidRemaining: 0 });
});

test("free credits are consumed before paid credits and session consumption is idempotent", async () => {
  const state = setupBalance();
  await state.service.getBalance(user.id);
  await state.service.addPurchasedCredits(user.id, commerceConfig.products.starterPack.creationCount, commerceConfig.products.starterPack.id);
  await state.service.consumeCreationCredit(user.id, "session-1");
  await state.service.consumeCreationCredit(user.id, "session-2");
  await state.service.consumeCreationCredit(user.id, "session-3");
  assert.deepEqual(await state.service.consumeCreationCredit(user.id, "session-4"), { freeRemaining: 0, paidRemaining: 4 });
  assert.deepEqual(await state.service.consumeCreationCredit(user.id, "session-4"), { freeRemaining: 0, paidRemaining: 4 });
  assert.equal((await state.service.getTransactions(user.id)).filter((item) => item.type === "creation").length, 4);
});

test("policy reports free, then paid, then exhausted without negative balances", async () => {
  const state = setupBalance();
  assert.deepEqual(await state.policy.canCreate(user.id), { allowed: true, source: "free" });
  await state.service.addPurchasedCredits(user.id, 1, "test-product");
  for (let index = 0; index < 3; index++) await state.service.consumeCreationCredit(user.id, `free-${index}`);
  assert.deepEqual(await state.policy.canCreate(user.id), { allowed: true, source: "paid" });
  await state.service.consumeCreationCredit(user.id, "paid-1");
  assert.deepEqual(await state.policy.canCreate(user.id), { allowed: false, source: "none", reason: "quota_exhausted" });
  await assert.rejects(state.service.consumeCreationCredit(user.id, "blocked"), /已经用完/);
  assert.deepEqual(await state.service.getBalance(user.id), { freeRemaining: 0, paidRemaining: 0 });
});

test("refund restores the original source once", async () => {
  const state = setupBalance();
  await state.service.getBalance(user.id);
  await state.service.consumeCreationCredit(user.id, "session-refund");
  assert.deepEqual(await state.service.refundCreationCredit(user.id, "session-refund"), { freeRemaining: 3, paidRemaining: 0 });
  assert.deepEqual(await state.service.refundCreationCredit(user.id, "session-refund"), { freeRemaining: 3, paidRemaining: 0 });
  assert.equal((await state.service.getTransactions(user.id)).filter((item) => item.type === "refund").length, 1);
});

test("completion saves first, consumes once, and a failed save consumes nothing", async () => {
  const commerce = setupBalance();
  await commerce.service.getBalance(user.id);
  const artworkMemory = memoryStorage();
  const artworks = new MockArtworkRepository(() => artworkMemory.storage, () => user);
  const completion = new CreationCompletionService(artworks, commerce.service);
  const artwork = await generatedArtwork();

  artworkMemory.block(true);
  await assert.rejects(completion.complete(artwork), /保存失败/);
  assert.deepEqual(await commerce.service.getBalance(user.id), { freeRemaining: 3, paidRemaining: 0 });

  artworkMemory.block(false);
  await completion.complete(artwork);
  await completion.complete(artwork);
  assert.equal((await artworks.getAll()).length, 1);
  assert.deepEqual(await commerce.service.getBalance(user.id), { freeRemaining: 2, paidRemaining: 0 });
});

test("failed generation never reaches completion and leaves balance unchanged", async () => {
  const commerce = setupBalance();
  await commerce.service.getBalance(user.id);
  const service = new GenerationService({
    text: new MockTextAIProvider(), image: new MockImageProvider(),
    delays: { understanding: 0, shaping: 0, painting: 0 }, failStage: "painting",
  });
  await assert.rejects(service.generateArtwork({ text: "这次生成会失败。", userId: user.id }));
  assert.deepEqual(await commerce.service.getBalance(user.id), { freeRemaining: 3, paidRemaining: 0 });
});

test("corrupt commerce storage is preserved and failed writes emit no transaction", async () => {
  const state = setupBalance();
  state.data.set(COMMERCE_STORAGE_KEY, "{broken");
  await assert.rejects(state.service.getBalance(user.id), /未覆盖/);
  assert.equal(state.data.get(COMMERCE_STORAGE_KEY), "{broken");

  state.data.delete(COMMERCE_STORAGE_KEY);
  state.block(true);
  await assert.rejects(state.service.grantFreeCredits(user.id), /无法保存/);
  assert.equal(state.data.has(COMMERCE_STORAGE_KEY), false);
});

test("completion retries a failed debit after saving without duplicate artwork or charge", async () => {
  const commerce = setupBalance();
  await commerce.service.getBalance(user.id);
  const memory = memoryStorage();
  const artworks = new MockArtworkRepository(() => memory.storage, () => user);
  const completion = new CreationCompletionService(artworks, commerce.service);
  const artwork = await generatedArtwork();
  commerce.block(true);
  await assert.rejects(completion.complete(artwork), /无法保存/);
  assert.equal((await artworks.getAll()).length, 1);
  assert.deepEqual(await commerce.service.getBalance(user.id), { freeRemaining: 3, paidRemaining: 0 });
  commerce.block(false);
  await completion.complete(artwork);
  await completion.complete(artwork);
  assert.equal((await artworks.getAll()).length, 1);
  assert.deepEqual(await commerce.service.getBalance(user.id), { freeRemaining: 2, paidRemaining: 0 });
  assert.equal((await commerce.service.getTransactions(user.id)).filter((entry) => entry.type === "creation").length, 1);
});

test("favorite, visibility and deletion preserve the ledger; browser adapters restore artwork and session", async () => {
  const commerce = setupBalance();
  const memory = memoryStorage();
  const artworks = new MockArtworkRepository(() => memory.storage, () => user);
  await commerce.service.getBalance(user.id);
  const artwork = await generatedArtwork();
  await new CreationCompletionService(artworks, commerce.service).complete(artwork);
  const ledger = commerce.data.get(COMMERCE_STORAGE_KEY);
  await artworks.toggleFavorite(artwork.id);
  await artworks.togglePublic(artwork.id);
  await artworks.togglePublic(artwork.id);
  const restored = await new MockArtworkRepository(() => memory.storage, () => user).getById(artwork.id);
  assert.deepEqual(restored?.creationSession, artwork.creationSession);
  assert.equal(restored?.isFavorite, true);
  assert.equal(restored?.isPublic, false);
  assert.equal(commerce.data.get(COMMERCE_STORAGE_KEY), ledger);
  await artworks.delete(artwork.id);
  assert.equal((await artworks.getFavorites()).length, 0);
  assert.equal(commerce.data.get(COMMERCE_STORAGE_KEY), ledger);
});
