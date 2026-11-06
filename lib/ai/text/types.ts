import type { EmotionAnalysis } from "@/types/ai";

/** Provider implementations own transport; UI uses a service, never a provider. */
export interface TextAIProvider {
  analyzeEmotion(input: string): Promise<EmotionAnalysis>;
  generateQuote(input: string, analysis: EmotionAnalysis): Promise<string>;
  generatePhilosophicalExplanation(analysis: EmotionAnalysis): Promise<string>;
}
