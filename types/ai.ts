export type EmotionType =
  | "calm" | "joy" | "sadness" | "loneliness" | "uncertainty" | "anxiety"
  | "hope" | "freedom" | "nostalgia" | "confusion" | "peace" | "desire"
  | "detachment" | "melancholy";

export type PhilosophyTheme =
  | "freedom" | "existence" | "time" | "loneliness" | "choice" | "memory"
  | "hope" | "absurdity" | "desire" | "identity" | "meaning" | "mortality"
  | "change" | "uncertainty" | "connection";

export type ArtStylePreset =
  | "post_impressionism" | "expressionism" | "symbolism"
  | "abstract_expressionism" | "dreamlike_oil" | "melancholic_oil";

export type HumanPresence =
  | { enabled: false; representation: "none" }
  | { enabled: true; representation: "back_view" | "silhouette" | "distant" | "obscured" };

export interface EmotionAnalysis {
  primaryEmotion: EmotionType;
  secondaryEmotions: EmotionType[];
  /** Normalized intensity, 0–1. */
  intensity: number;
  philosophicalThemes: PhilosophyTheme[];
  visualMetaphors: string[];
  atmosphere: string;
  colorMood: string[];
  environment: string;
  humanPresence: HumanPresence;
  composition: string;
  lighting: string;
  artisticDirection: string;
}

/** Product-level ratio reservation. V1 generation continues to use 4:5 only. */
export type ArtworkAspectRatio = "4:5" | "1:1" | "9:16" | "16:9";
export type AspectRatio = ArtworkAspectRatio;

export interface ImageGenerationPrompt {
  positivePrompt: string;
  negativePrompt: string;
  stylePreset: ArtStylePreset;
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  provider: string;
  model: string;
}

/** Optional provider accounting. Mock providers deliberately leave these values undefined. */
export interface ProviderUsage {
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  imageCount?: number;
  estimatedCost?: number;
}
