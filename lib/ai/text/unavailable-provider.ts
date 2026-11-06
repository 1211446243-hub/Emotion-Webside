import type { TextAIProvider } from "./types";
import { ProviderError } from "../errors";

/** Explicit extension point: no transport, credentials or silent fallback to Mock. */
export abstract class UnavailableTextProvider implements TextAIProvider {
  protected abstract readonly providerName: string;
  analyzeEmotion: TextAIProvider["analyzeEmotion"] = async () => {
    throw new ProviderError(`${this.providerName} is not implemented. Use TEXT_AI_PROVIDER=mock.`);
  };
  generateQuote: TextAIProvider["generateQuote"] = async () => {
    throw new ProviderError(`${this.providerName} is not implemented. Use TEXT_AI_PROVIDER=mock.`);
  };
  generatePhilosophicalExplanation: TextAIProvider["generatePhilosophicalExplanation"] = async () => {
    throw new ProviderError(`${this.providerName} is not implemented. Use TEXT_AI_PROVIDER=mock.`);
  };
}
