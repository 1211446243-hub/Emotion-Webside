import { UnavailableTextProvider } from "./unavailable-provider";
export class OpenAITextProvider extends UnavailableTextProvider {
  protected readonly providerName = "OpenAI";
}
