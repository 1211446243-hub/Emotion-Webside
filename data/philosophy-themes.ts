import type { PhilosophyTheme } from "@/types/ai";

export interface PhilosophyThemeDefinition {
  name: string;
  explanation: string;
  keywords: readonly string[];
  metaphors: readonly string[];
  environments: readonly string[];
  lighting: string;
  composition: string;
  colors: readonly string[];
}

// English visual vocabulary is model-independent; Chinese keywords are only Mock heuristics.
export const philosophyThemes: Record<PhilosophyTheme, PhilosophyThemeDefinition> = {
  freedom: {
    name: "自由", explanation: "自由并不总是抵达远方，也可能是重新辨认自己愿意走向哪里的能力。", keywords: ["自由", "束缚", "不想被控制", "远方", "一眼就能看到头", "不一样", "离开"],
    metaphors: ["an unbroken horizon", "birds beyond an open boundary"],
    environments: ["a vast windswept field beneath an open sky", "a high ridge above the sea"],
    lighting: "open daylight with subtle warmth along the horizon",
    composition: "expansive negative space with low horizon and outward visual movement",
    colors: ["muted ochre", "deep cobalt", "warm ivory"],
  },
  existence: {
    name: "存在", explanation: "存在的分量不取决于声音大小；一个被感受到的片刻，本身已经占据了世界的一部分。", keywords: ["存在", "世界", "人很小", "人真的很小", "人生", "活着", "安静", "没有发生"],
    metaphors: ["a small trace beneath an immense sky", "a vast horizon beyond a weathered stone"],
    environments: ["an immense quiet plain beneath a boundless sky", "an open shore beneath distant stars"],
    lighting: "soft atmospheric light from a distant sky",
    composition: "an overwhelming landscape with a tiny focal point and generous empty space",
    colors: ["slate blue", "earth grey", "pale gold"],
  },
  time: {
    name: "时间", explanation: "时间并不只带走事物，也让曾经贴得太近的感受慢慢显出轮廓。", keywords: ["时间", "长大", "岁月", "小时候", "记不清", "年", "黄昏"],
    metaphors: ["long shadows across a worn floor", "seasonal traces on an old wall"],
    environments: ["a weathered room at sunset", "an old building beside a leafless tree"],
    lighting: "low amber sunlight extending long shadows",
    composition: "diagonal shadows guide the eye through layers of worn surfaces",
    colors: ["faded amber", "dusty brown", "quiet blue"],
  },
  loneliness: {
    name: "孤独", explanation: "孤独让人与世界之间的距离变得清晰，也让那些微小的声音终于可以被听见。", keywords: ["孤独", "一个人", "孤单", "无人", "没人", "空房间"],
    metaphors: ["an empty chair in a large room", "one illuminated window in a silent city"],
    environments: ["an immense empty corridor", "a sparse city square after dusk"],
    lighting: "a single dim light amid cool shadows",
    composition: "an off-center focal point isolated by a large quiet space",
    colors: ["charcoal blue", "muted green", "dim amber"],
  },
  choice: {
    name: "选择", explanation: "每一次选择都同时包含靠近与告别；方向因此不是答案，而是愿意承担的距离。", keywords: ["选择", "哪条路", "放弃", "决定", "岔路", "以后"],
    metaphors: ["two diverging paths", "a threshold between two distant lights"],
    environments: ["an open wilderness with a forked path", "a quiet bridge between two landscapes"],
    lighting: "two subtle directions of light at dusk",
    composition: "branching lines lead toward separate vanishing points",
    colors: ["burnt sienna", "muted indigo", "pale amber"],
  },
  memory: {
    name: "记忆", explanation: "记忆保存的往往不是完整事实，而是某束光、某种温度以及当时的自己。", keywords: ["以前", "小时候", "过去", "记得", "想起", "回忆", "住过", "怀念"],
    metaphors: ["a faded window frame", "an empty familiar room softened at its edges"],
    environments: ["an old room filled with afternoon light", "a familiar courtyard with faded walls"],
    lighting: "diffused afternoon light through a dusty window",
    composition: "layered frames and softened edges suggest incomplete recollection",
    colors: ["faded ochre", "dusty rose", "grey green"],
  },
  hope: {
    name: "希望", explanation: "希望不必先成为确定的答案；它常以很小的亮处，让人愿意再向前一步。", keywords: ["希望", "期待", "微光", "重新开始", "盼望"],
    metaphors: ["a small warm light at the end of a road", "a narrow opening in heavy clouds"],
    environments: ["a long quiet road before dawn", "a dark plain beneath slowly opening clouds"],
    lighting: "restrained warm light in a small distant area",
    composition: "a distant modest light balances a large shadowed foreground",
    colors: ["deep blue grey", "muted gold", "soft cream"],
  },
  absurdity: {
    name: "荒诞", explanation: "当世界拒绝给出解释，人仍可以在不协调之中选择自己的姿态与行动。", keywords: ["荒诞", "不合理", "没有出口", "莫名其妙", "荒唐"],
    metaphors: ["a door opening onto a blank wall", "an impossible staircase with mismatched scale"],
    environments: ["an impossible architectural courtyard", "a silent room with an oversized doorway"],
    lighting: "incongruous shadows in otherwise ordinary daylight",
    composition: "dislocated perspective and unsettling proportions within a calm frame",
    colors: ["chalk white", "oxide red", "desaturated teal"],
  },
  desire: {
    name: "欲望", explanation: "欲望既指出缺少的事物，也悄悄描出我们正在成为怎样的人。", keywords: ["渴望", "想要", "欲望", "得到", "不满足"],
    metaphors: ["a distant unreachable fruit", "a reflection beyond a closed window"],
    environments: ["a sparse orchard beyond a low wall", "a quiet room facing a distant warm landscape"],
    lighting: "concentrated warm highlights beyond a shaded foreground",
    composition: "an interval of empty space separates the foreground from an inviting focal point",
    colors: ["muted crimson", "dark olive", "amber"],
  },
  identity: {
    name: "自我", explanation: "自我不是一幅固定肖像，而是在经历、关系与一次次选择之间持续变化的轮廓。", keywords: ["我是谁", "自己是谁", "自我", "身份", "不像自己"],
    metaphors: ["a fragmented reflection without a face", "overlapping shadows without a fixed outline"],
    environments: ["a still room with an obscured mirror", "a shallow reflective pool"],
    lighting: "soft divided light with ambiguous edges",
    composition: "offset reflections echo one another without resolving into a portrait",
    colors: ["smoke grey", "muted violet", "warm stone"],
  },
  meaning: {
    name: "意义", explanation: "意义未必等在路的终点；许多时候，它在寻找与投入的过程里逐渐形成。", keywords: ["意义", "为什么", "留下些什么", "做些什么", "目标", "寻找", "为了什么"],
    metaphors: ["a faint trail toward a distant light", "an incomplete map without lettering"],
    environments: ["a wide plain crossed by a faint path", "a quiet landscape with an unknown destination"],
    lighting: "a faint distant glow in atmospheric haze",
    composition: "a subtle directional line leads beyond the visible frame",
    colors: ["earth brown", "dusty blue", "faint gold"],
  },
  mortality: {
    name: "有限", explanation: "有限让告别成为真实，也让尚能触碰的人与事拥有无法替代的重量。", keywords: ["最后", "死亡", "终点", "有限", "消逝", "告别"],
    metaphors: ["a fallen leaf beside an enduring stone", "a shoreline erasing a small trace"],
    environments: ["a still autumn shore", "a weathered garden at the edge of dusk"],
    lighting: "fading natural light with gentle transitions",
    composition: "a fragile small detail rests within a slowly changing landscape",
    colors: ["umber", "ash grey", "faded copper"],
  },
  change: {
    name: "变化", explanation: "变化很少在一瞬间完成；它常从一道光、一种习惯或一个微小决定开始。", keywords: ["变化", "改变", "变了", "新的", "开始", "结束"],
    metaphors: ["a river crossing seasonal boundaries", "new leaves beside weathered branches"],
    environments: ["a riverside between two seasons", "a landscape under moving clouds"],
    lighting: "changing light between shadow and a pale opening",
    composition: "a flowing diagonal connects contrasting areas of the landscape",
    colors: ["moss green", "rust", "pale blue"],
  },
  uncertainty: {
    name: "未知", explanation: "未知不是一片空无，而是尚未显形的部分；看不清时，眼前的一步仍然成立。", keywords: ["不知道", "迷茫", "以后", "未来", "不确定", "未知", "看不清"],
    metaphors: ["a path disappearing into fog", "stairs dissolving beyond an obscured horizon"],
    environments: ["a mist-covered road at twilight", "indistinct buildings beneath a low sky"],
    lighting: "diffused twilight with no clear light source",
    composition: "vanishing lines dissolve before reaching the horizon",
    colors: ["mist grey", "muted blue", "faded mauve"],
  },
  connection: {
    name: "联结", explanation: "人与人不必完全相同或彼此占有；被看见与被回应，已经改变了各自的距离。", keywords: ["陪伴", "朋友", "一起", "相遇", "联系", "理解我", "家人"],
    metaphors: ["two distant lights reflected in shared water", "a narrow bridge connecting separate banks"],
    environments: ["two quiet shores connected by a small bridge", "a calm courtyard with neighboring windows"],
    lighting: "gentle light shared across separated spaces",
    composition: "two modest focal points connected by a subtle visual rhythm",
    colors: ["warm grey", "muted terracotta", "soft green"],
  },
};
