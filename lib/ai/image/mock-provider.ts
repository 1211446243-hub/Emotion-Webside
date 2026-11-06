import type { ImageAIProvider, ImageGenerationOptions } from "./types";
import type { GeneratedImage, ImageGenerationPrompt } from "@/types/ai";
import { mockArtworks } from "@/data/mock-artworks";
import { ProviderError } from "../errors";

export class MockImageProvider implements ImageAIProvider {
  async generate(prompt: ImageGenerationPrompt, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    if (!prompt.positivePrompt.trim()) throw new ProviderError("Image prompt is empty.");
    if (prompt.aspectRatio !== "4:5") throw new ProviderError("Local Mock artworks support 4:5 only.");
    const text = prompt.positivePrompt.toLowerCase();
    const ranked = mockArtworks.map((artwork) => ({ artwork, score: artwork.keywords.filter((word) => text.includes(word)).length }))
      .sort((a, b) => b.score - a.score);
    // Figure-free requests must not select the one study with a tiny back-view figure.
    const eligible = ranked.filter(({ artwork }) => !text.includes("no people") || artwork.id !== "open-field");
    const index = options.variantIndex ?? 0;
    if (!Number.isSafeInteger(index) || index < 0) throw new ProviderError("Mock variant index is invalid.");
    const selected = eligible[index % eligible.length]?.artwork ?? mockArtworks[5];
    return { url: selected.url, width: 800, height: 1000, provider: "mock", model: "local-art-studies-v1" };
  }
}
