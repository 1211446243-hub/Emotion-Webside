import type { GeneratedImage, ImageGenerationPrompt } from "@/types/ai";

export type { GeneratedImage, ImageGenerationPrompt } from "@/types/ai";

export interface ImageGenerationOptions { variantIndex?: number }

/** Provider-independent image contract; the current implementation selects local Mock assets. */
export interface ImageAIProvider {
  generate(prompt: ImageGenerationPrompt, options?: ImageGenerationOptions): Promise<GeneratedImage>;
}
