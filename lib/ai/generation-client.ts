import type { Artwork } from "@/types/artwork";
import type { GenerationEvent, GenerationInput, GenerationStage } from "@/types/generation";
import { mockArtworks } from "@/data/mock-artworks";
import { isCreationSession } from "@/lib/creation/session-validation";
import { consumeDebugFailure } from "@/lib/debug/service";
import { GenerationService } from "@/lib/ai/generation-service";
import { MockTextAIProvider } from "@/lib/ai/text/mock-provider";
import { MockImageProvider } from "@/lib/ai/image/mock-provider";

function hasArtworkFields(art: object): boolean {
  return ["id", "userId", "originalText", "quote", "provider", "model", "createdAt", "updatedAt", "stylePreset"].every((key) => key in art && typeof Reflect.get(art, key) === "string")
    && "analysis" in art && typeof art.analysis === "object" && art.analysis !== null
    && "generationPrompt" in art && typeof art.generationPrompt === "object" && art.generationPrompt !== null
    && "isFavorite" in art && art.isFavorite === false && "likeCount" in art && art.likeCount === 0
    && "creationSession" in art && isCreationSession(art.creationSession);
}

function parseEvent(line: string): GenerationEvent {
  const value: unknown = JSON.parse(line);
  if (!value || typeof value !== "object" || !("type" in value)) throw new Error("Invalid generation event.");
  if (value.type === "error") return { type: "error", message: "这一刻没有被成功留下。" };
  if (value.type === "progress" && "stage" in value && (value.stage === "understanding" || value.stage === "shaping" || value.stage === "painting")) return { type: "progress", stage: value.stage };
  if (value.type === "complete" && "artwork" in value && value.artwork && typeof value.artwork === "object") {
    const art = value.artwork;
    if (hasArtworkFields(art) && "imageUrl" in art && mockArtworks.some((item) => item.url === art.imageUrl) && "isPublic" in art && art.isPublic === false) {
      return { type: "complete", artwork: art as Artwork };
    }
  }
  throw new Error("Invalid generation response.");
}

/** GitHub Pages has no server. Mock providers run in the browser for that build only. */
async function generateArtworkLocally(input: GenerationInput, options: { signal: AbortSignal; onProgress: (stage: GenerationStage) => void }): Promise<Artwork> {
  if (consumeDebugFailure()) throw new Error("这一刻没有被成功留下。");
  const service = new GenerationService({ text: new MockTextAIProvider(), image: new MockImageProvider() });
  return service.generateArtwork(input, { signal: options.signal, onProgress: options.onProgress });
}

/** UI facade: same-origin transport when a server exists, local Mock when the site is static. */
export async function generateArtwork(input: GenerationInput, options: { signal: AbortSignal; onProgress: (stage: GenerationStage) => void }): Promise<Artwork> {
  if (process.env.NEXT_PUBLIC_STATIC_GENERATION === "1") return generateArtworkLocally(input, options);
  if (consumeDebugFailure()) throw new Error("这一刻没有被成功留下。");
  const signal = AbortSignal.any([options.signal, AbortSignal.timeout(20000)]);
  const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal, cache: "no-store" });
  if (!response.ok || !response.body) throw new Error("这一刻没有被成功留下。");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let artwork: Artwork | undefined;
  const consume = (line: string) => {
    if (!line.trim()) return;
    const event = parseEvent(line);
    if (event.type === "error") throw new Error(event.message);
    if (event.type === "progress") options.onProgress(event.stage);
    if (event.type === "complete") artwork = event.artwork;
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) { consume(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1); }
      if (buffer.length > 100000) throw new Error("Generation response is too large.");
    }
    buffer += decoder.decode();
    consume(buffer);
    signal.throwIfAborted();
    if (!artwork) throw new Error("这一刻没有被成功留下。");
    return artwork;
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
