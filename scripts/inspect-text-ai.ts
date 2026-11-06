import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { emotionCases } from "@/tests/fixtures/emotion-cases";

async function inspect() {
  const provider = new MockTextAIProvider();
  for (const example of emotionCases) {
    const analysis = await provider.analyzeEmotion(example.input);
    console.log(JSON.stringify({ name: example.name, analysis, quote: await provider.generateQuote(example.input, analysis), prompt: buildPrompt(analysis) }));
  }
}
void inspect();
