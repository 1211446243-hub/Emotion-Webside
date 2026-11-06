import type { ArtStylePreset, EmotionAnalysis, ImageGenerationPrompt } from "@/types/ai";
import { artStyleLanguage } from "@/data/art-styles";
import { PromptValidationError } from "./errors";

const NEGATIVE_CONSTRAINTS = [
  "clear frontal portrait", "detailed facial features", "selfie", "beauty portrait",
  "commercial photography", "fashion photography", "anime", "cartoon", "3d render",
  "plastic skin", "AI beauty face", "text", "logo", "watermark", "signature", "low quality", "blurry low resolution",
] as const;

const HUMAN_REPRESENTATIONS = {
  back_view: "a small human figure seen entirely from behind",
  silhouette: "a small faceless silhouette",
  distant: "a tiny distant figure with no discernible facial features",
  obscured: "a small figure whose face is fully obscured by shadow or an object",
} as const;

/** Pure, provider-independent assembly. Never includes original user text or provider parameters. */
export function buildPrompt(analysis: EmotionAnalysis, stylePreset: ArtStylePreset = "post_impressionism"): ImageGenerationPrompt {
  if (!Number.isFinite(analysis.intensity) || analysis.intensity < 0 || analysis.intensity > 1) throw new PromptValidationError("Intensity must be between 0 and 1.");
  if (!analysis.environment.trim() || !analysis.visualMetaphors.length || !analysis.colorMood.length) throw new PromptValidationError("Visual analysis is incomplete.");
  const style = artStyleLanguage[stylePreset];
  if (!style) throw new PromptValidationError("Unsupported art style.");
  const human = analysis.humanPresence;
  if (human.enabled ? !(human.representation in HUMAN_REPRESENTATIONS) : human.representation !== "none") throw new PromptValidationError("Invalid human representation.");
  const subject = human.enabled ? HUMAN_REPRESENTATIONS[human.representation] : "an unpeopled symbolic landscape";
  const humanRules = human.enabled
    ? "human presence occupies at most five percent of the frame, no visible face, no frontal view, never a portrait"
    : "no people, no human figures, no portraits";
  const positivePrompt = [
    subject,
    `environment: ${analysis.environment}`,
    `visual metaphors: ${analysis.visualMetaphors.join("; ")}`,
    humanRules,
    `composition: ${analysis.composition}`,
    `lighting: ${analysis.lighting}`,
    `color relationships: ${analysis.colorMood.join(", ")}`,
    `atmosphere: ${analysis.atmosphere}; ${analysis.intensity >= 0.7 ? "strong but restrained" : "subtle"} emotional contrast`,
    analysis.artisticDirection,
    ...style,
    "visible impasto, hand-painted oil texture, tactile layered pigment",
    "coherent fine art composition, intentional brushwork, no lettering or signatures",
  ].join(", ");
  const negativePrompt = [...NEGATIVE_CONSTRAINTS, ...(human.enabled ? ["front-facing person", "visible detailed face"] : ["people", "human figure", "crowd"])].join(", ");
  return { positivePrompt, negativePrompt, stylePreset, aspectRatio: "4:5" };
}

export class PromptBuilder {
  build(analysis: EmotionAnalysis, stylePreset: ArtStylePreset = "post_impressionism") {
    return buildPrompt(analysis, stylePreset);
  }
}
