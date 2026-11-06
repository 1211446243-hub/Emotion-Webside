import test from "node:test";
import assert from "node:assert/strict";
import { MockArtworkRepository, ARTWORK_STORAGE_KEY } from "@/lib/storage/mock-artwork-repository";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";
import type { User } from "@/types/user";

const author: User = { id: "demo-user", name: "作者", avatar: null };
const other: User = { id: "another-user", name: "访客", avatar: null };
async function fixture() {
  return new GenerationService({ text: new MockTextAIProvider(), image: new MockImageProvider(), delays: { understanding: 0, shaping: 0, painting: 0 } }).generateArtwork({ text: "这是只属于我自己的想法，未来很不确定。", userId: author.id });
}
function setup() {
  let user: User | null = author;
  let blocked = false;
  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { if (blocked) throw new Error("QuotaExceededError"); memory.set(key, value); } };
  const repo = new MockArtworkRepository(() => storage, () => user);
  return { repo, memory, storage, as: (next: User | null) => { user = next; }, block: (next: boolean) => { blocked = next; } };
}

test("new artworks are private, durable, idempotently saved and retain the generation id", async () => {
  const { repo, storage } = setup(); const generated = await fixture();
  const art = await repo.saveGenerated({ ...generated, isPublic: true, isFavorite: true, likeCount: 99 });
  assert.equal(art.id, generated.id); assert.equal(art.isPublic, false); assert.equal(art.isFavorite, false); assert.equal(art.likeCount, 0);
  await repo.saveGenerated(generated); assert.equal((await repo.getAll()).length, 1);
  const restarted = new MockArtworkRepository(() => storage, () => author);
  assert.deepEqual(await restarted.getById(art.id), art);
  assert.equal((await restarted.getPublicAll()).length, 0);
});

test("public projection omits private data even for the owner", async () => {
  const { repo } = setup(); const art = await repo.saveGenerated(await fixture());
  await repo.togglePublic(art.id);
  const [publicArt] = await repo.getPublicAll();
  assert.deepEqual(Object.keys(publicArt).sort(), ["id", "quote", "imageUrl", "createdAt", "likeCount", "authorName"].sort());
  assert.ok(!JSON.stringify(publicArt).includes(art.originalText));
  assert.equal(publicArt.authorName, author.name);
  assert.equal((await repo.getPublicById(art.id))?.id, art.id);
  await repo.togglePublic(art.id); assert.equal(await repo.getPublicById(art.id), null);
});

test("ownership and logged-out access are enforced at the repository boundary", async () => {
  const state = setup(); const art = await state.repo.saveGenerated(await fixture());
  state.as(other); assert.equal(await state.repo.getById(art.id), null); assert.equal((await state.repo.getAll()).length, 0);
  await assert.rejects(state.repo.delete(art.id)); await assert.rejects(state.repo.togglePublic(art.id));
  await assert.rejects(state.repo.toggleFavorite(art.id)); await assert.rejects(state.repo.update(art.id, { quote: "不能修改别人的作品" }));
  state.as(null); await assert.rejects(state.repo.getAll()); await assert.rejects(state.repo.saveGenerated(art));
  assert.equal((await state.repo.getPublicAll()).length, 0);
});

test("favorites and likes persist and disappear for others when an artwork becomes private", async () => {
  const state = setup(); const art = await state.repo.saveGenerated(await fixture()); await state.repo.togglePublic(art.id);
  state.as(other); const response = await state.repo.toggleFavorite(art.id);
  assert.ok(!("originalText" in response)); await state.repo.toggleLike(art.id);
  assert.equal((await state.repo.getFavorites()).length, 1); assert.equal((await state.repo.getPublicById(art.id))?.likeCount, 1);
  assert.equal(await state.repo.isFavorite(art.id), true); assert.equal(await state.repo.isLiked(art.id), true);
  await state.repo.toggleLike(art.id); assert.equal((await state.repo.getPublicById(art.id))?.likeCount, 0);
  state.as(author); await state.repo.togglePublic(art.id); state.as(other);
  assert.equal((await state.repo.getFavorites()).length, 0); await assert.rejects(state.repo.toggleLike(art.id));
});

test("deletion cleans every gallery, favorite and like reference", async () => {
  const state = setup(); const art = await state.repo.saveGenerated(await fixture());
  await state.repo.togglePublic(art.id); await state.repo.toggleFavorite(art.id); await state.repo.toggleLike(art.id);
  state.as(other); await state.repo.toggleFavorite(art.id); await state.repo.toggleLike(art.id);
  state.as(author); await state.repo.delete(art.id);
  assert.equal(await state.repo.getById(art.id), null); assert.deepEqual(await state.repo.getPublicAll(), []); assert.deepEqual(await state.repo.getFavorites(), []);
  state.as(other); assert.deepEqual(await state.repo.getFavorites(), []);
  assert.ok(!state.memory.get(ARTWORK_STORAGE_KEY)?.includes(art.id));
});

test("failed writes never report success and can be retried without duplicates", async () => {
  const state = setup(); const art = await fixture(); let changes = 0; const unsubscribe = state.repo.subscribe(() => { changes++; });
  state.block(true); await assert.rejects(state.repo.saveGenerated(art), /保存失败/); assert.equal(changes, 0); assert.deepEqual(await state.repo.getAll(), []);
  state.block(false); await state.repo.saveGenerated(art); assert.equal(changes, 1);
  state.block(true); await assert.rejects(state.repo.togglePublic(art.id)); assert.equal((await state.repo.getById(art.id))?.isPublic, false);
  state.block(false); await state.repo.saveGenerated(art); assert.equal((await state.repo.getAll()).length, 1); unsubscribe();
});

test("corrupt or unsupported storage is preserved rather than overwritten", async () => {
  const state = setup(); const art = await fixture();
  for (const raw of ["not-json", JSON.stringify({ version: 2 }), JSON.stringify({ version: 1, artworks: [null], authors: {}, favorites: {}, likes: {} })]) {
    state.memory.set(ARTWORK_STORAGE_KEY, raw);
    await assert.rejects(state.repo.getPublicAll(), /未覆盖/); await assert.rejects(state.repo.saveGenerated(art), /未覆盖/);
    assert.equal(state.memory.get(ARTWORK_STORAGE_KEY), raw);
  }
});

test("create and update follow ownership and favorites contracts", async () => {
  const state = setup(); const generated = await fixture();
  const created = await state.repo.create(generated); assert.notEqual(created.id, generated.id);
  const updated = await state.repo.update(created.id, { quote: "有些时刻，安静地留在这里。", isFavorite: true });
  assert.equal(updated.isFavorite, true); assert.equal((await state.repo.getFavorites()).length, 1);
  await state.repo.update(created.id, { isFavorite: false }); assert.deepEqual(await state.repo.getFavorites(), []);
});

test("pre-Phase-3 artworks without a CreationSession remain readable", async () => {
  const state = setup();
  const generated = await fixture();
  const legacy = { ...generated, creationSession: undefined };
  await state.repo.saveGenerated(legacy);
  const restarted = new MockArtworkRepository(() => state.storage, () => author);
  const loaded = await restarted.getById(legacy.id);
  assert.equal(loaded?.imageUrl, legacy.imageUrl);
  assert.equal(loaded?.creationSession, undefined);
});
