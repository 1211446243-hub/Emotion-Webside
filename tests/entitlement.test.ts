import test from "node:test";
import assert from "node:assert/strict";
import { creationEntitlements, getCreationEntitlement, getEntitlementTierForSource } from "@/config/creation-entitlements";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";
import { isCreationSession } from "@/lib/creation/session-validation";

const input = { text: "我站在两条路之间，不知道未来应该选择哪里。", userId: "demo-user" };
const service = new GenerationService({
  text: new MockTextAIProvider(), image: new MockImageProvider(),
  delays: { understanding: 0, shaping: 0, painting: 0 },
});

test("entitlement rules are centralized and credit sources map to free or full", () => {
  assert.equal(getEntitlementTierForSource("free"), "free");
  assert.equal(getEntitlementTierForSource("paid"), "full");
  assert.deepEqual(getCreationEntitlement("free"), creationEntitlements.free);
  assert.equal(creationEntitlements.free.candidateVariants, 0);
  assert.equal(creationEntitlements.full.candidateVariants, 3);
  assert.equal(creationEntitlements.full.allowPhilosophicalExplanation, true);
});

test("free creation saves one main artwork and the original quote without paid additions", async () => {
  const artwork = await service.generateArtwork({ ...input, entitlementTier: "free" });
  const session = artwork.creationSession;
  assert.ok(session && isCreationSession(session));
  assert.equal(session.entitlement.tier, "free");
  assert.equal(session.mainArtwork.imageUrl, artwork.imageUrl);
  assert.deepEqual(session.candidateArtworks, []);
  assert.equal(session.philosophy.quote, artwork.quote);
  assert.equal(session.philosophy.explanation, undefined);
  assert.equal(session.cost, undefined);
  assert.equal(session.providerUsage, undefined);
});

test("full creation saves a main artwork, three distinct candidates and philosophy", async () => {
  const artwork = await service.generateArtwork({ ...input, entitlementTier: "full" });
  const session = artwork.creationSession;
  assert.ok(session && isCreationSession(session));
  assert.equal(session.entitlement.tier, "full");
  assert.equal(session.aspectRatio, "4:5");
  assert.equal(session.candidateArtworks.length, 3);
  assert.equal(new Set([session.mainArtwork.imageUrl, ...session.candidateArtworks.map((item) => item.imageUrl)]).size, 4);
  assert.ok(session.philosophy.themeName);
  assert.ok(session.philosophy.explanation);
  assert.equal(session.philosophy.quote, artwork.quote);
});
