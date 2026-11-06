import type { ArtStylePreset } from "@/types/ai";

export const artStyleLanguage: Record<ArtStylePreset, readonly string[]> = {
  post_impressionism: ["post-impressionist color relationships", "expressive swirling brushwork", "dynamic directional strokes", "emotional sky"],
  expressionism: ["expressive distortion of space", "emotionally charged brushwork", "dramatic restrained contrast"],
  symbolism: ["symbolic spatial relationships", "suggestive objects and layered meaning", "quiet allegorical atmosphere"],
  abstract_expressionism: ["gestural abstract forms", "rhythmic fields of color", "expressive nonliteral spatial tension"],
  dreamlike_oil: ["dreamlike spatial transitions", "soft atmospheric edges", "luminous muted color relationships"],
  melancholic_oil: ["subdued tonal relationships", "contemplative open space", "slow expressive brushwork"],
};
