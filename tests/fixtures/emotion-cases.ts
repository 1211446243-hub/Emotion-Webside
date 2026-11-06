import type { EmotionType, PhilosophyTheme } from "@/types/ai";

export const emotionCases: { name: string; input: string; themes: PhilosophyTheme[]; emotion?: EmotionType }[] = [
  { name: "平静中想改变", input: "最近其实过得挺平静，但我总觉得自己还应该去做些什么，我不太想让未来变得一眼就能看到头。", themes: ["freedom", "meaning", "uncertainty"] },
  { name: "童年记忆", input: "今天突然想起小时候住过的地方，很多事情已经记不清了，但那个下午的阳光我还记得。", themes: ["memory", "time"], emotion: "nostalgia" },
  { name: "人生选择", input: "我不知道自己以后要走哪条路，好像每一种选择都意味着放弃另外一种人生。", themes: ["choice", "uncertainty", "existence"] },
  { name: "日常安静", input: "今天没有发生什么特别的事情，我只是坐了很久，突然觉得安静其实也很好。", themes: ["existence"], emotion: "peace" },
  { name: "存在与有限", input: "有时候我觉得人真的很小，世界这么大，我们最后到底会留下些什么？", themes: ["existence", "meaning", "mortality"] },
  { name: "孤独", input: "一个人在空房间待着，忽然觉得孤独。", themes: ["loneliness"], emotion: "loneliness" },
  { name: "自由", input: "我渴望自由，不想被控制，也不想被束缚。", themes: ["freedom"], emotion: "freedom" },
  { name: "无关键词兜底", input: "杯子放在桌上。", themes: ["existence", "meaning"], emotion: "calm" },
  { name: "混合情绪", input: "今天很开心也很快乐，但我依然担心，甚至有点焦虑。", themes: ["existence", "meaning"], emotion: "joy" },
  { name: "希望与联结", input: "期待与朋友相遇，希望能一起走一段。", themes: ["hope", "connection"], emotion: "hope" },
];
