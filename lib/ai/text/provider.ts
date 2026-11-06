import type { TextAIProvider } from "./types";
import { MockTextAIProvider } from "./mock-provider";
import { ProviderError } from "../errors";
import { DeepSeekTextProvider } from "./deepseek-provider";
import { OpenAITextProvider } from "./openai-provider";
import { GeminiTextProvider } from "./gemini-provider";

export type { TextAIProvider } from "./types";

/** Called from the future server-side service, never from a client component. */
export function getTextAIProvider(name = process.env.TEXT_AI_PROVIDER ?? "mock"): TextAIProvider {
  if (name === "mock") return new MockTextAIProvider();
  if (name === "deepseek") return new DeepSeekTextProvider();
  if (name === "openai") return new OpenAITextProvider();
  if (name === "gemini") return new GeminiTextProvider();
  throw new ProviderError(`Text provider "${name}" is not implemented. Use TEXT_AI_PROVIDER=mock.`);
}
