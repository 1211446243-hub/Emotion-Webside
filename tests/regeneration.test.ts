import test from "node:test";
import assert from "node:assert/strict";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";
import { MockArtworkRepository } from "@/lib/storage/mock-artwork-repository";
import { RegenerationService } from "@/lib/creation/regeneration-service";

async function setup(tier: "free" | "full" = "full") {
  const memory = new Map<string, string>(); let blocked = false;
  memory.set("untitled_commerce_v1", "unchanged-balance");
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { if (blocked) throw new Error("full"); memory.set(key, value); } };
  const user = { id: "demo-user", name: "Test", avatar: null };
  const repo = new MockArtworkRepository(() => storage, () => user);
  const generator = new GenerationService({ text: new MockTextAIProvider(), image: new MockImageProvider(), delays: { understanding: 0, shaping: 0, painting: 0 } });
  const original = await generator.generateArtwork({ text: "我在未知的路口寻找方向", userId: user.id, entitlementTier: tier });
  await repo.saveGenerated(original);
  const service = new RegenerationService(repo, (input) => generator.generateArtwork(input));
  return { repo, service, original, memory, storage, user, block: (value: boolean) => { blocked = value; } };
}

test("one included expression persists without overwriting original or changing balance; second is rejected", async () => {
  const state = await setup();
  const result = await state.service.regenerate(state.original.id);
  assert.equal(result.imageUrl, state.original.imageUrl);
  assert.deepEqual(result.creationSession?.mainArtwork, state.original.creationSession?.mainArtwork);
  assert.equal(result.creationSession?.regenerateUsed, true);
  assert.notEqual(result.creationSession?.regeneratedExpression?.mainArtwork.imageUrl, result.imageUrl);
  assert.equal((await state.repo.getAll()).length, 1);
  assert.equal(state.memory.get("untitled_commerce_v1"), "unchanged-balance");
  const restored = new MockArtworkRepository(() => state.storage, () => state.user);
  assert.deepEqual(await restored.getById(result.id), result);
  await assert.rejects(state.service.regenerate(result.id), /已经/);
  await restored.togglePublic(result.id);
  assert.ok(!("creationSession" in (await restored.getPublicById(result.id))!));
});

test("free creations cannot regenerate; failed saves preserve unused entitlement", async () => {
  const free = await setup("free");
  await assert.rejects(free.service.regenerate(free.original.id), /不包含/);
  const full = await setup(); full.block(true);
  await assert.rejects(full.service.regenerate(full.original.id), /保存失败/);
  assert.equal((await full.repo.getById(full.original.id))?.creationSession?.regenerateUsed, false);
  full.block(false);
  await full.service.regenerate(full.original.id);
});

test("concurrent requests append at most one expression", async () => {
  const state = await setup();
  const results = await Promise.allSettled([state.service.regenerate(state.original.id), state.service.regenerate(state.original.id)]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
});
