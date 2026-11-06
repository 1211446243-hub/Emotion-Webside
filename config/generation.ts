import type { GenerationStage } from "@/types/generation";

export const generationConfig = {
  delays: { understanding: 950, shaping: 850, painting: 2400 } satisfies Record<GenerationStage, number>,
  labels: {
    understanding: "正在理解这一刻……",
    shaping: "正在寻找它的形状……",
    painting: "正在把它变成一幅画……",
  } satisfies Record<GenerationStage, string>,
};
