import { artworkService } from "@/lib/storage/artwork-service";
import { generateArtwork } from "@/lib/ai/generation-client";
import { RegenerationService } from "./regeneration-service";

export const regenerationService = new RegenerationService(artworkService, (input) =>
  generateArtwork(input, { signal: new AbortController().signal, onProgress: () => undefined }));
