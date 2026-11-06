import type { EmotionAnalysis, EmotionType, PhilosophyTheme } from "@/types/ai";
import type { TextAIProvider } from "./types";
import { philosophyThemes } from "@/data/philosophy-themes";
import { mockQuotes } from "@/data/mock-quotes";
import { ProviderError } from "../errors";

const emotionKeywords: Record<EmotionType, readonly string[]> = {
  calm: ["平静", "平常", "没什么"], joy: ["开心", "快乐", "高兴", "喜悦"],
  sadness: ["难过", "伤心", "哭", "失去"], loneliness: ["孤独", "孤单", "一个人", "没人"],
  uncertainty: ["不知道", "不确定", "未来", "以后"], anxiety: ["焦虑", "担心", "害怕", "紧张"],
  hope: ["希望", "期待", "盼望"], freedom: ["自由", "束缚", "控制", "远方", "一眼就能看到头"],
  nostalgia: ["小时候", "以前", "想起", "怀念", "过去", "记得"], confusion: ["迷茫", "困惑", "想不明白"],
  peace: ["安静", "安心", "释然"], desire: ["渴望", "想要", "应该去做"],
  detachment: ["不重要", "无所谓", "放下"], melancholy: ["惆怅", "低落", "失落"],
};

const atmospheres: Record<EmotionType, string> = {
  calm: "quiet and unhurried", joy: "gently buoyant and open", sadness: "subdued and tender",
  loneliness: "spacious and solitary", uncertainty: "unresolved and suspended", anxiety: "tense yet restrained",
  hope: "tentatively luminous", freedom: "open and windswept", nostalgia: "distant and softened by recollection",
  confusion: "disoriented but contemplative", peace: "still and settled", desire: "quietly reaching",
  detachment: "light and distanced", melancholy: "muted and reflective",
};

function validateInput(input: string) {
  const length = Array.from(input.trim()).length;
  if (length < 2 || Array.from(input).length > 1000) throw new ProviderError("文字长度需为 2–1000 个字符。");
}

function rankedMatches<Key extends string>(entries: [Key, readonly string[]][], input: string): Key[] {
  return entries.map(([key, words]) => ({ key, score: words.filter((word) => input.includes(word)).length }))
    .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).map(({ key }) => key);
}

/** Deterministic keyword simulation, not a psychological assessment or a real AI request. */
export class MockTextAIProvider implements TextAIProvider {
  async analyzeEmotion(input: string): Promise<EmotionAnalysis> {
    validateInput(input);
    const themeEntries = (Object.keys(philosophyThemes) as PhilosophyTheme[]).map((key): [PhilosophyTheme, readonly string[]] => [key, philosophyThemes[key].keywords]);
    const emotionEntries = (Object.keys(emotionKeywords) as EmotionType[]).map((key): [EmotionType, readonly string[]] => [key, emotionKeywords[key]]);
    const themeMatches = rankedMatches(themeEntries, input);
    const emotionMatches = rankedMatches(emotionEntries, input);
    const themes: PhilosophyTheme[] = themeMatches.length ? themeMatches.slice(0, 3) : ["existence", "meaning"];
    const primaryEmotion = emotionMatches[0] ?? "calm";
    const secondaryEmotions = emotionMatches.slice(1, 4);
    const primary = philosophyThemes[themes[0]];
    const intense = ["非常", "特别", "强烈", "极其", "总是", "无法", "！"].filter((word) => input.includes(word)).length;
    const mild = ["有点", "一点", "轻微", "偶尔"].some((word) => input.includes(word));
    const intensity = Math.round(Math.min(1, Math.max(0, 0.35 + intense * 0.15 + secondaryEmotions.length * 0.05 - (mild ? 0.15 : 0))) * 100) / 100;
    return {
      primaryEmotion, secondaryEmotions, intensity,
      philosophicalThemes: themes,
      visualMetaphors: themes.map((theme) => philosophyThemes[theme].metaphors[0]),
      atmosphere: [atmospheres[primaryEmotion], ...secondaryEmotions.map((emotion) => atmospheres[emotion])].join("; "),
      colorMood: [...new Set(themes.flatMap((theme) => philosophyThemes[theme].colors))].slice(0, 5),
      environment: primary.environments[0],
      humanPresence: { enabled: true, representation: "back_view" },
      composition: primary.composition,
      lighting: primary.lighting,
      artisticDirection: "symbolic landscape with restrained emotional movement",
    };
  }

  async generateQuote(input: string, analysis: EmotionAnalysis): Promise<string> {
    validateInput(input);
    const choices = mockQuotes[analysis.philosophicalThemes[0] ?? "existence"];
    if (!choices) throw new ProviderError("无法识别短句主题。");
    // Stable variation makes repeated development checks reproducible.
    const hash = Array.from(input).reduce((sum, char) => (sum + (char.codePointAt(0) ?? 0)) % 2, 0);
    return choices[hash];
  }

  async generatePhilosophicalExplanation(analysis: EmotionAnalysis): Promise<string> {
    const theme = analysis.philosophicalThemes[0];
    if (!theme || !philosophyThemes[theme]) throw new ProviderError("无法生成哲学主题说明。");
    return philosophyThemes[theme].explanation;
  }
}
