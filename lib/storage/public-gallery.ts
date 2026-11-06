import type { PublicArtwork } from "@/types/artwork";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const TOKEN_KEY = "thought_gallery_owner_v1";
const ALLOWED = new Set([
  "/mock/artworks/open-field.svg",
  "/mock/artworks/crossroads.svg",
  "/mock/artworks/quiet-room.svg",
  "/mock/artworks/afternoon.svg",
  "/mock/artworks/mist.svg",
  "/mock/artworks/shore.svg",
]);

export class GalleryError extends Error {
  constructor(message: string) { super(message); this.name = "GalleryError"; }
}

export function galleryEnabled() { return Boolean(url && key); }

type Row = { id?: unknown; quote?: unknown; image_url?: unknown; author_name?: unknown; created_at?: unknown };

function authHeaders(): Record<string, string> {
  return { apikey: key ?? "", Authorization: `Bearer ${key ?? ""}` };
}

function project(row: Row): PublicArtwork | null {
  if (typeof row.id !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(row.id)) return null;
  if (typeof row.quote !== "string" || !row.quote.trim() || row.quote.length > 80) return null;
  if (typeof row.image_url !== "string" || !ALLOWED.has(row.image_url)) return null;
  if (typeof row.author_name !== "string" || !row.author_name.trim() || row.author_name.length > 32) return null;
  if (typeof row.created_at !== "string" || Number.isNaN(Date.parse(row.created_at))) return null;
  return { id: row.id, quote: row.quote, imageUrl: row.image_url, createdAt: row.created_at, likeCount: 0, authorName: row.author_name };
}

let cached: { at: number; rows: PublicArtwork[] } | null = null;
let pending: Promise<PublicArtwork[]> | null = null;

function remember(rows: PublicArtwork[]) {
  cached = { at: Date.now(), rows };
  return rows;
}

export function listPublicMoments(force = false): Promise<PublicArtwork[]> {
  if (!galleryEnabled()) return Promise.resolve([]);
  if (pending) return pending;
  if (!force && cached && Date.now() - cached.at < 15000) return Promise.resolve(cached.rows);
  pending = fetch(`${url}/rest/v1/public_moments?select=id,quote,image_url,author_name,created_at&order=created_at.desc`, { headers: authHeaders() })
    .then(async (response) => {
      if (!response.ok) throw new GalleryError("作品广场暂时无法读取，请稍后再试。");
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new GalleryError("作品广场暂时无法读取，请稍后再试。");
      return remember(data.flatMap((item) => {
        const art = project(item as Row);
        return art ? [art] : [];
      }));
    })
    .catch((error: unknown) => { throw error instanceof GalleryError ? error : new GalleryError("作品广场暂时无法连接，请稍后再试。"); })
    .finally(() => { pending = null; });
  return pending;
}

export async function getPublicMoment(id: string): Promise<PublicArtwork | null> {
  if (!galleryEnabled() || !/^[A-Za-z0-9_-]{8,80}$/.test(id)) return null;
  if (cached && Date.now() - cached.at < 15000) return cached.rows.find((item) => item.id === id) ?? null;
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/public_moments?select=id,quote,image_url,author_name,created_at&id=eq.${id}`, { headers: authHeaders() });
  } catch { throw new GalleryError("作品广场暂时无法连接，请稍后再试。"); }
  if (!response.ok) throw new GalleryError("作品广场暂时无法读取，请稍后再试。");
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data[0]) return null;
  return project(data[0] as Row);
}

function ownerToken(): string {
  if (typeof localStorage === "undefined") throw new GalleryError("请在浏览器中公开作品。");
  const current = localStorage.getItem(TOKEN_KEY);
  if (current && /^[A-Za-z0-9]{32,80}$/.test(current)) return current;
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

async function rpc(name: string, body: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch { throw new GalleryError("作品广场暂时无法连接，请稍后再试。"); }
  if (!response.ok) throw new GalleryError("作品广场暂时无法更新，请稍后再试。");
  cached = null;
}

export async function publishMoment(input: { id: string; quote: string; imageUrl: string; authorName: string; createdAt: string }) {
  const quote = input.quote.trim();
  const authorName = input.authorName.trim().slice(0, 32);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(input.id) || !quote || quote.length > 80 || !ALLOWED.has(input.imageUrl) || !authorName) {
    throw new GalleryError("这幅作品无法公开到广场。");
  }
  await rpc("publish_moment", {
    moment_id: input.id,
    moment_quote: quote,
    moment_image: input.imageUrl,
    moment_author: authorName,
    moment_created: input.createdAt,
    moment_token: ownerToken(),
  });
}

export async function unpublishMoment(id: string) {
  if (!galleryEnabled() || !/^[A-Za-z0-9_-]{8,80}$/.test(id)) return;
  await rpc("unpublish_moment", { moment_id: id, moment_token: ownerToken() });
}
