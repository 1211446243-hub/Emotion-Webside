import type { TextAIProvider } from "./text/types";
import type { ImageAIProvider } from "./image/types";
import type { Artwork } from "@/types/artwork";
import type { GenerationInput, GenerationStage } from "@/types/generation";
import { buildPrompt } from "./prompt-builder";
import { generationConfig } from "@/config/generation";
import { getCreationEntitlement } from "@/config/creation-entitlements";
import { philosophyThemes } from "@/data/philosophy-themes";

export class GenerationError extends Error {
  constructor(message: string, options?: ErrorOptions) { super(message, options); this.name = "GenerationError"; }
}

function abortIfNeeded(signal?: AbortSignal) { signal?.throwIfAborted(); }
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  abortIfNeeded(signal);
  return new Promise((resolve, reject) => {
    const finish = () => { signal?.removeEventListener("abort", cancel); resolve(); };
    const timer = setTimeout(finish, ms);
    const cancel = () => { clearTimeout(timer); signal?.removeEventListener("abort", cancel); reject(signal?.reason ?? new DOMException("Aborted", "AbortError")); };
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

/** Orchestrates providers and pure prompt building. No UI, transport or persistence logic. */
export class GenerationService {
  constructor(private readonly dependencies: {
    text: TextAIProvider;
    image: ImageAIProvider;
    delays?: Record<GenerationStage, number>;
    failStage?: GenerationStage;
  }) {}

  async generateArtwork(input: GenerationInput, options: { signal?: AbortSignal; onProgress?: (stage: GenerationStage) => void } = {}): Promise<Artwork> {
    const text = input.text.trim();
    if (Array.from(text).length < 2 || Array.from(input.text).length > 1000) throw new GenerationError("文字长度需为 2–1000 个字符。");
    if (!input.userId.trim()) throw new GenerationError("请先登录，再留下这一刻。");
    const stage = async (name: GenerationStage) => {
      abortIfNeeded(options.signal);
      options.onProgress?.(name);
      const delay = (this.dependencies.delays ?? generationConfig.delays)[name];
      if (!Number.isFinite(delay) || delay < 0) throw new GenerationError("Invalid Mock delay.");
      await wait(delay, options.signal);
      if (this.dependencies.failStage === name) throw new GenerationError("Mock failure requested.");
    };
    try {
      await stage("understanding");
      const analysis = await this.dependencies.text.analyzeEmotion(text);
      await stage("shaping");
      const generationPrompt = buildPrompt(analysis, input.stylePreset);
      await stage("painting");
      const entitlement = getCreationEntitlement(input.entitlementTier ?? "free");
      const offset = input.expressionIndex ?? 0;
      const image = await this.dependencies.image.generate(generationPrompt, { variantIndex: offset });
      const candidateImages = [];
      for (let index = 0; index < entitlement.candidateVariants; index++) {
        abortIfNeeded(options.signal);
        candidateImages.push(await this.dependencies.image.generate(generationPrompt, { variantIndex: index + 1 + offset }));
      }
      abortIfNeeded(options.signal);
      const quote = await this.dependencies.text.generateQuote(text, analysis);
      const explanation = entitlement.allowPhilosophicalExplanation
        ? await this.dependencies.text.generatePhilosophicalExplanation(analysis)
        : undefined;
      abortIfNeeded(options.signal);
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const theme = analysis.philosophicalThemes[0] ?? "existence";
      const version = (generated: typeof image, role: "main" | "candidate", versionId: string) => ({
        id: versionId, role, imageUrl: generated.url, aspectRatio: generationPrompt.aspectRatio,
        generationPrompt, provider: generated.provider, model: generated.model,
      } as const);
      const mainArtwork = version(image, "main", `${id}-main`);
      return {
        id, userId: input.userId, originalText: text, quote,
        imageUrl: image.url, analysis, generationPrompt, provider: image.provider, model: image.model,
        stylePreset: generationPrompt.stylePreset, isPublic: false, isFavorite: false, likeCount: 0,
        creationSession: {
          regenerateUsed: false,
          id, userId: input.userId, status: "completed", entitlement,
          aspectRatio: generationPrompt.aspectRatio, mainArtwork,
          candidateArtworks: candidateImages.map((candidate, index) => version(candidate, "candidate", `${id}-candidate-${index + 1}`)),
          philosophy: { theme, themeName: philosophyThemes[theme].name, ...(explanation ? { explanation } : {}), quote },
          createdAt: now, updatedAt: now,
        },
        createdAt: now, updatedAt: now,
      };
    } catch (cause) {
      if (options.signal?.aborted) throw options.signal.reason;
      throw new GenerationError("这一刻没有被成功留下。", { cause });
    }
  }
}
