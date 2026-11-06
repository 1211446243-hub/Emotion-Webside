import { GenerationService } from "@/lib/ai/generation-service";
import { getTextAIProvider } from "@/lib/ai/text/provider";
import { getImageAIProvider } from "@/lib/ai/image/provider";
import type { GenerationEvent, GenerationStage } from "@/types/generation";
import type { ArtStylePreset } from "@/types/ai";
import { artStyleLanguage } from "@/data/art-styles";

export const runtime = "nodejs";

/** Local Mock transport, not a real authentication boundary. Real auth arrives with real services. */
export async function POST(request: Request) {
  // Next's local server may normalize request.url to localhost when accessed via 127.0.0.1.
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get("host") ?? requestUrl.host}`;
  if (origin && origin !== expectedOrigin) return new Response(null, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "无法读取这一刻。" }, { status: 400 }); }
  if (typeof body !== "object" || body === null || !("text" in body) || typeof body.text !== "string" || !("userId" in body) || body.userId !== "demo-user") {
    return Response.json({ message: "请先登录并写下这一刻。" }, { status: 400 });
  }
  const { text, userId } = body;
  const expressionIndex = "expressionIndex" in body ? body.expressionIndex : 0;
  if (expressionIndex !== 0 && expressionIndex !== 1) return Response.json({ message: "无法确认表达版本。" }, { status: 400 });
  const style = "stylePreset" in body ? body.stylePreset : undefined;
  const entitlement = "entitlementTier" in body ? body.entitlementTier : undefined;
  if (style !== undefined && (typeof style !== "string" || !Object.hasOwn(artStyleLanguage, style))) return Response.json({ message: "暂不支持这种绘画风格。" }, { status: 400 });
  if (entitlement !== undefined && entitlement !== "free" && entitlement !== "full") return Response.json({ message: "无法确认本次创作权益。" }, { status: 400 });
  const stylePreset = style as ArtStylePreset | undefined;
  if (Array.from(text.trim()).length < 2 || Array.from(text).length > 1000) return Response.json({ message: "文字长度需为 2–1000 个字符。" }, { status: 400 });
  const abort = new AbortController();
  const cancel = () => abort.abort();
  request.signal.addEventListener("abort", cancel, { once: true });
  if (request.signal.aborted) cancel();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: GenerationEvent) => { if (!abort.signal.aborted) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); };
      try {
        const configuredFailure = process.env.MOCK_GENERATION_FAIL_STAGE;
        const failStage: GenerationStage | undefined = ["understanding", "shaping", "painting"].includes(configuredFailure ?? "") ? configuredFailure as GenerationStage : undefined;
        const service = new GenerationService({ text: getTextAIProvider(), image: getImageAIProvider(), failStage });
        const artwork = await service.generateArtwork({ text, userId, stylePreset, entitlementTier: entitlement, expressionIndex }, { signal: abort.signal, onProgress: (stage) => send({ type: "progress", stage }) });
        send({ type: "complete", artwork });
      } catch (error) {
        if (!abort.signal.aborted) {
          if (process.env.NODE_ENV === "development") console.error("Mock generation failed", error);
          send({ type: "error", message: "这一刻没有被成功留下。" });
        }
      } finally {
        request.signal.removeEventListener("abort", cancel);
        if (!abort.signal.aborted) controller.close();
      }
    },
    cancel() { cancel(); request.signal.removeEventListener("abort", cancel); },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
