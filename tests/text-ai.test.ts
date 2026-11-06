import test from "node:test";
import assert from "node:assert/strict";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { getTextAIProvider } from "@/lib/ai/text/provider";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { artStyleLanguage } from "@/data/art-styles";
import { philosophyThemes } from "@/data/philosophy-themes";
import { emotionCases } from "./fixtures/emotion-cases";
import type { ArtStylePreset, HumanPresence } from "@/types/ai";

const provider = new MockTextAIProvider();

for (const example of emotionCases) {
  test(`analysis and prompt: ${example.name}`, async () => {
    const analysis = await provider.analyzeEmotion(example.input);
    for (const theme of example.themes) assert.ok(analysis.philosophicalThemes.includes(theme), `${example.name}: missing ${theme}`);
    if (example.emotion) assert.equal(analysis.primaryEmotion, example.emotion);
    assert.ok(analysis.intensity >= 0 && analysis.intensity <= 1);
    assert.ok(!analysis.secondaryEmotions.includes(analysis.primaryEmotion));
    assert.ok(analysis.visualMetaphors.length && analysis.colorMood.length && analysis.environment && analysis.composition && analysis.lighting);
    const quote = await provider.generateQuote(example.input, analysis);
    const explanation = await provider.generatePhilosophicalExplanation(analysis);
    assert.ok(Array.from(quote).length >= 10 && Array.from(quote).length <= 45);
    assert.ok(explanation.length >= 20);
    const prompt = buildPrompt(analysis);
    assert.equal(prompt.aspectRatio, "4:5");
    assert.equal(prompt.stylePreset, "post_impressionism");
    assert.ok(prompt.positivePrompt.includes(analysis.environment));
    assert.ok(prompt.positivePrompt.includes(analysis.visualMetaphors[0]));
    assert.ok(!prompt.positivePrompt.includes(example.input));
    assert.ok(prompt.negativePrompt.includes("clear frontal portrait"));
    assert.ok(prompt.negativePrompt.includes("front-facing person"));
    assert.ok(prompt.negativePrompt.includes("visible detailed face"));
    assert.ok(prompt.positivePrompt.includes("five percent"));
  });
}

test("all 15 philosophy themes have complete data and are independently reachable", async () => {
  assert.equal(Object.keys(philosophyThemes).length, 15);
  for (const [id, theme] of Object.entries(philosophyThemes)) {
    assert.ok(theme.name && theme.keywords.length && theme.metaphors.length && theme.environments.length && theme.lighting && theme.composition && theme.colors.length);
    const analysis = await provider.analyzeEmotion(theme.keywords[0]);
    assert.ok(analysis.philosophicalThemes.includes(id as keyof typeof philosophyThemes));
  }
});

test("mixed emotions and deterministic results", async () => {
  const input = emotionCases[8].input;
  const analysis = await provider.analyzeEmotion(input);
  assert.ok(analysis.secondaryEmotions.includes("anxiety"));
  assert.deepEqual(analysis, await provider.analyzeEmotion(input));
  assert.equal(await provider.generateQuote(input, analysis), await provider.generateQuote(input, analysis));
});

test("intensity remains bounded and responds to modifiers", async () => {
  const mild = await provider.analyzeEmotion("有点焦虑");
  const strong = await provider.analyzeEmotion("非常特别强烈极其焦虑，总是无法安静！");
  assert.ok(strong.intensity > mild.intensity && strong.intensity <= 1 && mild.intensity >= 0);
});

test("input boundaries count Unicode characters", async () => {
  for (const input of ["", "  ", "字", "字".repeat(1001)]) await assert.rejects(provider.analyzeEmotion(input));
  await provider.analyzeEmotion("字".repeat(1000));
  await provider.analyzeEmotion("🌿".repeat(1000));
  await assert.rejects(provider.analyzeEmotion("🌿".repeat(1001)));
});

test("every style remains provider-independent", async () => {
  const analysis = await provider.analyzeEmotion("向往自由");
  for (const style of Object.keys(artStyleLanguage) as ArtStylePreset[]) {
    const result = buildPrompt(analysis, style);
    assert.equal(result.stylePreset, style);
    assert.ok(result.positivePrompt.includes(artStyleLanguage[style][0]));
    assert.ok(result.positivePrompt.includes("visible impasto"));
    assert.ok(result.negativePrompt.includes("watermark"));
  }
});

test("all permitted figures and no-figure compositions preserve portrait restrictions", async () => {
  const analysis = await provider.analyzeEmotion("世界很安静");
  const presences: HumanPresence[] = [
    { enabled: true, representation: "back_view" }, { enabled: true, representation: "silhouette" },
    { enabled: true, representation: "distant" }, { enabled: true, representation: "obscured" },
    { enabled: false, representation: "none" },
  ];
  for (const humanPresence of presences) {
    const prompt = buildPrompt({ ...analysis, humanPresence });
    assert.ok(prompt.negativePrompt.includes("clear frontal portrait"));
    if (humanPresence.enabled) assert.ok(prompt.positivePrompt.includes("no visible face"));
    else {
      assert.ok(prompt.positivePrompt.includes("no people"));
      assert.ok(!prompt.positivePrompt.includes("small human figure"));
      assert.ok(prompt.negativePrompt.includes("crowd"));
    }
  }
  assert.throws(() => buildPrompt({ ...analysis, intensity: NaN }));
  assert.throws(() => buildPrompt({ ...analysis, intensity: 2 }));
});

test("factory defaults to Mock; unavailable providers fail explicitly", async () => {
  const saved = process.env.TEXT_AI_PROVIDER;
  try {
    delete process.env.TEXT_AI_PROVIDER;
    assert.ok(getTextAIProvider() instanceof MockTextAIProvider);
    for (const name of ["deepseek", "openai", "gemini"]) {
      process.env.TEXT_AI_PROVIDER = name;
      await assert.rejects(getTextAIProvider().analyzeEmotion("此刻安静"), /not implemented/);
    }
    assert.throws(() => getTextAIProvider("unknown"), /not implemented/);
  } finally { if (saved === undefined) delete process.env.TEXT_AI_PROVIDER; else process.env.TEXT_AI_PROVIDER = saved; }
});
