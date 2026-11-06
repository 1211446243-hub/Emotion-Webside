import { siteConfig } from "@/config/site";
import { assetUrl } from "@/lib/site-path";

export type ShareCardStyle = "editorial" | "immersive";
export interface ShareCardContent { imageUrl: string; quote: string; createdAt: string }

/** Same local artwork, one canvas for both preview and export. No private text is included. */
export async function renderShareCard(content: ShareCardContent, style: ShareCardStyle): Promise<Blob> {
  const image = new Image();
  image.src = assetUrl(content.imageUrl);
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器无法生成卡片。");
  const immersive = style === "immersive";
  ctx.fillStyle = "#f5f2ea"; ctx.fillRect(0, 0, 1080, 1350);
  if (immersive) {
    ctx.drawImage(image, 0, 0, 1080, 1350);
    const gradient = ctx.createLinearGradient(0, 600, 0, 1350);
    gradient.addColorStop(0, "transparent"); gradient.addColorStop(1, "rgba(0,0,0,.8)");
    ctx.fillStyle = gradient; ctx.fillRect(0, 600, 1080, 750);
  } else ctx.drawImage(image, 232, 64, 616, 770);
  ctx.fillStyle = immersive ? "#fffaf0" : "#282722";
  ctx.font = '40px "Songti SC", "SimSun", serif';
  const lines: string[] = []; let line = "";
  for (const char of Array.from(content.quote)) {
    if (ctx.measureText(line + char).width > 872 && line) { lines.push(line); line = ""; }
    line += char;
  }
  if (line) lines.push(line);
  lines.forEach((text, index) => ctx.fillText(text, 104, (immersive ? 1120 - (lines.length - 1) * 66 : 972) + index * 66));
  ctx.font = '20px sans-serif';
  ctx.fillText(new Date(content.createdAt).toLocaleDateString("zh-CN"), 104, 1268);
  ctx.textAlign = "right";
  ctx.font = '18px sans-serif'; ctx.fillText(siteConfig.name, 976, 1268);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("卡片导出失败，请重试。")), "image/png"));
}

export function saveShareCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
