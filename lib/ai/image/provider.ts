import type { ImageAIProvider } from "./types";
import { MockImageProvider } from "./mock-provider";
import { ProviderError } from "../errors";

export function getImageAIProvider(name = process.env.IMAGE_AI_PROVIDER ?? "mock"): ImageAIProvider {
  if (name === "mock") return new MockImageProvider();
  throw new ProviderError(`Image provider "${name}" is not implemented. Use IMAGE_AI_PROVIDER=mock.`);
}
