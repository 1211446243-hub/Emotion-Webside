import { artworkService } from "@/lib/storage/artwork-service";
import { creationBalanceService } from "./commerce-service";
import { CreationCompletionService } from "./creation-completion-service";

export const creationCompletionService = new CreationCompletionService(artworkService, creationBalanceService);

