import type { ArtStylePreset, ArtworkAspectRatio, EmotionAnalysis, ImageGenerationPrompt, PhilosophyTheme, ProviderUsage } from "./ai";
import type { CreationEntitlement } from "./commerce";

export interface CreationCost {
  textModelCost?: number;
  imageGenerationCost?: number;
  storageCost?: number;
  totalCost?: number;
}

export interface CreationArtworkVersion {
  id: string;
  role: "main" | "candidate";
  imageUrl: string;
  thumbnailUrl?: string;
  aspectRatio: ArtworkAspectRatio;
  generationPrompt: ImageGenerationPrompt;
  provider: string;
  model: string;
}

export interface CreationPhilosophy {
  theme: PhilosophyTheme;
  themeName: string;
  explanation?: string;
  quote: string;
}

export interface CreationSession {
  regenerateUsed?: boolean;
  /** The original stays in mainArtwork; the second expression is appended here. */
  regeneratedExpression?: CreationSession;
  id: string;
  userId: string;
  status: "completed";
  entitlement: CreationEntitlement;
  aspectRatio: ArtworkAspectRatio;
  mainArtwork: CreationArtworkVersion;
  candidateArtworks: CreationArtworkVersion[];
  philosophy: CreationPhilosophy;
  providerUsage?: ProviderUsage[];
  cost?: CreationCost;
  createdAt: string;
  updatedAt: string;
}

export interface Artwork {
  id: string;
  userId: string;
  originalText: string;
  quote: string;
  imageUrl: string;
  thumbnailUrl?: string;
  analysis: EmotionAnalysis;
  generationPrompt: ImageGenerationPrompt;
  provider: string;
  model: string;
  stylePreset: ArtStylePreset;
  /** New creations include a complete session; optional keeps pre-Phase-3 LocalStorage readable. */
  creationSession?: CreationSession;
  isPublic: boolean;
  isFavorite: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Public views must use a projection, never serialize an entire Artwork. */
export type PublicArtwork = Pick<Artwork, "id" | "quote" | "imageUrl" | "thumbnailUrl" | "createdAt" | "likeCount"> & { authorName: string };
