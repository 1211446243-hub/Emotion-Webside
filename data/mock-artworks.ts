/** Locally authored visual placeholders, not AI-generated paintings. */
export const mockArtworks = [
  { id: "open-field", url: "/mock/artworks/open-field.svg", keywords: ["windswept", "horizon", "freedom"], alt: "赭色旷野上，微小背影望向起伏的天空" },
  { id: "crossroads", url: "/mock/artworks/crossroads.svg", keywords: ["diverging", "forked", "threshold"], alt: "黄昏荒野中，两条小路伸向不同的远方" },
  { id: "quiet-room", url: "/mock/artworks/quiet-room.svg", keywords: ["corridor", "chair", "solitary"], alt: "深绿色的空房间，一把椅子停在微光里" },
  { id: "afternoon", url: "/mock/artworks/afternoon.svg", keywords: ["old room", "window frame", "recollection", "worn floor"], alt: "旧房间的窗边，下午的光留下温暖的长影" },
  { id: "mist", url: "/mock/artworks/mist.svg", keywords: ["mist-covered", "fog", "twilight"], alt: "灰蓝雾气中，一条道路逐渐消失" },
  { id: "shore", url: "/mock/artworks/shore.svg", keywords: ["shore", "water", "bridge", "boundless", "immense sky"], alt: "苍蓝海面与辽阔天空之间，一线暖光浮现" },
] as const;

export function getArtworkAlt(url: string): string {
  return mockArtworks.find((artwork) => artwork.url === url)?.alt ?? "这一刻的艺术作品";
}
