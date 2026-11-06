import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";
import { getImageAIProvider } from "@/lib/ai/image/provider";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { mockArtworks } from "@/data/mock-artworks";
import type { GenerationStage } from "@/types/generation";
import { POST } from "@/app/api/generate/route";

const text = new MockTextAIProvider();
const image = new MockImageProvider();
const delays = { understanding: 0, shaping: 0, painting: 0 };
const input = { text: "我不知道以后要走哪条路，每一种选择都意味着放弃。", userId: "demo-user" };

test("six local Mock images exist, are 4:5 and contain no external resources", async () => {
  assert.equal(mockArtworks.length, 6);
  for (const art of mockArtworks) {
    await access(`public${art.url}`);
    const svg = await readFile(`public${art.url}`, "utf8");
    assert.ok(svg.includes('width="800" height="1000"'));
    assert.ok(!/<script|<image|href=/i.test(svg));
  }
});

test("Mock images match choice, solitude, memory, uncertainty and freedom", async () => {
  for (const [value, expected] of [["人生充满选择，不知道哪条路", "crossroads"], ["孤独，一个人在空房间", "quiet-room"], ["想起小时候记得的旧房间", "afternoon"], ["不知道未来，迷茫不确定", "mist"], ["渴望自由，不想被束缚", "open-field"]]) {
    const result = await image.generate(buildPrompt(await text.analyzeEmotion(value)));
    assert.ok(result.url.endsWith(`${expected}.svg`), `${value}: ${result.url}`);
    assert.equal(result.provider, "mock");
  }
  const analysis = await text.analyzeEmotion("自由远方");
  const noHuman = await image.generate(buildPrompt({ ...analysis, humanPresence: { enabled: false, representation: "none" } }));
  assert.ok(!noHuman.url.includes("open-field"));
  assert.throws(() => getImageAIProvider("runninghub"), /not implemented/);
});

test("service produces ordered progress and a complete private artwork with unique ids", async () => {
  const service = new GenerationService({ text, image, delays });
  const stages: GenerationStage[] = [];
  const art = await service.generateArtwork(input, { onProgress: (stage) => stages.push(stage) });
  assert.deepEqual(stages, ["understanding", "shaping", "painting"]);
  assert.equal(art.userId, "demo-user");
  assert.equal(art.originalText, input.text);
  assert.equal(art.isPublic, false);
  assert.equal(art.isFavorite, false);
  assert.equal(art.likeCount, 0);
  assert.equal(art.generationPrompt.aspectRatio, "4:5");
  assert.ok(art.quote && art.analysis && art.provider && art.model);
  assert.equal(art.creationSession?.entitlement.tier, "free");
  assert.equal(art.creationSession?.mainArtwork.imageUrl, art.imageUrl);
  assert.ok(!Number.isNaN(Date.parse(art.createdAt)));
  assert.equal(art.createdAt, art.updatedAt);
  assert.notEqual(art.id, (await service.generateArtwork(input)).id);
});

test("cancellation halts later stages before image generation", async () => {
  const controller = new AbortController();
  let images = 0;
  const service = new GenerationService({ text, image: { async generate(prompt) { images++; return image.generate(prompt); } }, delays: { ...delays, shaping: 50 } });
  await assert.rejects(service.generateArtwork(input, { signal: controller.signal, onProgress: (stage) => { if (stage === "shaping") controller.abort(); } }), { name: "AbortError" });
  assert.equal(images, 0);
});

test("service rejects invalid input before contacting providers", async () => {
  const service = new GenerationService({ text, image, delays });
  for (const value of ["", " ", "一", "字".repeat(1001)]) await assert.rejects(service.generateArtwork({ ...input, text: value }));
  await assert.rejects(service.generateArtwork({ ...input, userId: "" }));
});

test("each mock failure stage rejects without a partial success", async () => {
  for (const failStage of ["understanding", "shaping", "painting"] as const) {
    const service = new GenerationService({ text, image, delays, failStage });
    await assert.rejects(service.generateArtwork(input), /没有被成功留下/);
  }
});

test("provider failures are wrapped and a later retry can succeed", async () => {
  let failed = false;
  const service = new GenerationService({ text, delays, image: { async generate(prompt) { if (!failed) { failed = true; throw new Error("mock transport failure"); } return image.generate(prompt); } } });
  await assert.rejects(service.generateArtwork(input), /没有被成功留下/);
  assert.equal((await service.generateArtwork(input)).isPublic, false);
});

test("local route rejects malformed input and external origins", async () => {
  const request = (body: string, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/generate", { method: "POST", headers: { "Content-Type": "application/json", origin }, body });
  assert.equal((await POST(request("{"))).status, 400);
  assert.equal((await POST(request(JSON.stringify({ ...input, userId: "other-user" })))) .status, 400);
  assert.equal((await POST(request(JSON.stringify({ ...input, text: " " })))) .status, 400);
  assert.equal((await POST(request(JSON.stringify({ ...input, stylePreset: "unknown" })))).status, 400);
  assert.equal((await POST(request(JSON.stringify({ ...input, entitlementTier: "premium" })))).status, 400);
  assert.equal((await POST(request(JSON.stringify(input), "http://external.invalid"))).status, 403);
  const localAlias = new Request("http://localhost:3000/api/generate", { method: "POST", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" }, body: "{}" });
  assert.equal((await POST(localAlias)).status, 400);
});
