import test from "node:test";
import assert from "node:assert/strict";
import { generateArtwork } from "@/lib/ai/generation-client";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";

test("client handles split UTF-8 events and rejects truncated or failed responses", async () => {
  const original = globalThis.fetch;
  const input = { text: "此刻安静", userId: "demo-user" };
  const artwork = await new GenerationService({ text: new MockTextAIProvider(), image: new MockImageProvider(), delays: { understanding: 0, shaping: 0, painting: 0 } }).generateArtwork(input);
  const message = `${JSON.stringify({ type: "progress", stage: "understanding" })}\n${JSON.stringify({ type: "complete", artwork })}\n`;
  try {
    globalThis.fetch = async () => {
      const bytes = new TextEncoder().encode(message);
      return new Response(new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += 3) controller.enqueue(bytes.slice(i, i + 3)); controller.close(); } }));
    };
    const stages: string[] = [];
    const result = await generateArtwork(input, { signal: new AbortController().signal, onProgress: (stage) => stages.push(stage) });
    assert.equal(result.quote, artwork.quote);
    assert.deepEqual(stages, ["understanding"]);
    for (const body of ["", '{"type":"progress","stage":"painting"}\n', '{"type":"error","message":"internal details"}\n', '{"type":"complete","artwork":{}}\n']) {
      globalThis.fetch = async () => new Response(body);
      await assert.rejects(generateArtwork(input, { signal: new AbortController().signal, onProgress: () => undefined }));
    }
    globalThis.fetch = async () => new Response(null, { status: 500 });
    await assert.rejects(generateArtwork(input, { signal: new AbortController().signal, onProgress: () => undefined }));
  } finally { globalThis.fetch = original; }
});
