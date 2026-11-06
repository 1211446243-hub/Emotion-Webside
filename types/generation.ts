import type { Artwork } from "./artwork";
import type { ArtStylePreset } from "./ai";
import type { CreationEntitlementTier } from "./commerce";

export type GenerationStage = "understanding" | "shaping" | "painting";
export interface GenerationInput { text: string; userId: string; stylePreset?: ArtStylePreset; entitlementTier?: CreationEntitlementTier; expressionIndex?: 0 | 1 }
export type GenerationEvent =
  | { type: "progress"; stage: GenerationStage }
  | { type: "complete"; artwork: Artwork }
  | { type: "error"; message: string };
