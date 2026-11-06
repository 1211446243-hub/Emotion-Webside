import type { Artwork, PublicArtwork } from "@/types/artwork";
import type { User } from "@/types/user";
import type { ArtworkRepository, ArtworkUpdate, NewArtwork } from "./artwork-repository";
import { mockArtworks } from "@/data/mock-artworks";
import { isCreationSession } from "@/lib/creation/session-validation";

export const ARTWORK_STORAGE_KEY = "thought_artworks_v1";
interface Store { version: 1; artworks: Artwork[]; authors: Record<string, string>; favorites: Record<string, string[]>; likes: Record<string, string[]> }
export class StorageError extends Error {
  constructor(message: string) { super(message); this.name = "StorageError"; }
}
const empty = (): Store => ({ version: 1, artworks: [], authors: {}, favorites: {}, likes: {} });
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isStringListMap(value: unknown): value is Record<string, string[]> { return isRecord(value) && Object.values(value).every((list) => Array.isArray(list) && list.every((id) => typeof id === "string")); }
function validArtwork(value: unknown): value is Artwork {
  if (!isRecord(value)) return false;
  return ["id", "userId", "originalText", "quote", "provider", "model", "stylePreset", "createdAt", "updatedAt"].every((key) => typeof value[key] === "string")
    && /^[a-zA-Z0-9_-]+$/.test(String(value.id)) && mockArtworks.some((item) => item.url === value.imageUrl)
    && typeof value.isPublic === "boolean" && typeof value.isFavorite === "boolean"
    && typeof value.likeCount === "number" && Number.isFinite(value.likeCount) && value.likeCount >= 0
    && !Number.isNaN(Date.parse(String(value.createdAt))) && !Number.isNaN(Date.parse(String(value.updatedAt)))
    && isRecord(value.analysis) && isRecord(value.generationPrompt)
    && (value.creationSession === undefined || isCreationSession(value.creationSession));
}

/** Versioned browser adapter. Public reads explicitly omit all private fields. */
export class MockArtworkRepository implements ArtworkRepository {
  private listeners = new Set<() => void>();
  constructor(private readonly storage: () => Pick<Storage, "getItem" | "setItem">, private readonly currentUser: () => User | null) {}
  private user(): User { const user = this.currentUser(); if (!user) throw new StorageError("请先登录。"); return user; }
  private read(): Store {
    let raw: string | null;
    try { raw = this.storage().getItem(ARTWORK_STORAGE_KEY); } catch { throw new StorageError("无法读取本地作品，请检查浏览器存储设置。"); }
    if (raw === null) return empty();
    try {
      const data: unknown = JSON.parse(raw);
      if (!isRecord(data) || data.version !== 1 || !Array.isArray(data.artworks) || !data.artworks.every(validArtwork) || !isRecord(data.authors) || !Object.values(data.authors).every((name) => typeof name === "string") || !isStringListMap(data.favorites) || !isStringListMap(data.likes)) throw new Error("invalid store");
      if (new Set(data.artworks.map((art) => art.id)).size !== data.artworks.length) throw new Error("duplicate ids");
      return data as unknown as Store;
    } catch { throw new StorageError("本地作品数据无法读取。为保护已有内容，未覆盖存储；请保留浏览器数据后再处理。"); }
  }
  private write(store: Store) {
    try { this.storage().setItem(ARTWORK_STORAGE_KEY, JSON.stringify(store)); }
    catch { throw new StorageError("保存失败，可能是本地空间不足或存储被禁用。请重试。"); }
    this.listeners.forEach((listener) => listener());
  }
  getSnapshot = (): string | null => { try { return this.storage().getItem(ARTWORK_STORAGE_KEY); } catch { return "storage-unavailable"; } };
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    const onStorage = (event: StorageEvent) => { if (event.key === ARTWORK_STORAGE_KEY || event.key === null) listener(); };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => { this.listeners.delete(listener); if (typeof window !== "undefined") window.removeEventListener("storage", onStorage); };
  };
  private owner(store: Store, id: string): Artwork {
    const user = this.user(); const art = store.artworks.find((item) => item.id === id && item.userId === user.id);
    if (!art) throw new StorageError("找不到这幅作品，或它不属于你。"); return art;
  }
  private visible(store: Store, id: string): Artwork {
    const user = this.user(); const art = store.artworks.find((item) => item.id === id && (item.isPublic || item.userId === user.id));
    if (!art) throw new StorageError("这幅作品已不再可见。"); return art;
  }
  private likeCount(store: Store, id: string) { return Object.values(store.likes).filter((list) => list.includes(id)).length; }
  private project(store: Store, art: Artwork): PublicArtwork {
    return { id: art.id, quote: art.quote, imageUrl: art.imageUrl, createdAt: art.createdAt, likeCount: this.likeCount(store, art.id), authorName: store.authors[art.userId] ?? "User" };
  }
  private ownedView(store: Store, art: Artwork): Artwork { return { ...art, isFavorite: (store.favorites[art.userId] ?? []).includes(art.id), likeCount: this.likeCount(store, art.id) }; }
  async getAll() { const user = this.user(); const store = this.read(); return store.artworks.filter((art) => art.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((art) => this.ownedView(store, art)); }
  async getById(id: string) { const user = this.user(); const store = this.read(); const art = store.artworks.find((item) => item.id === id && item.userId === user.id); return art ? this.ownedView(store, art) : null; }
  async create(input: NewArtwork) { const now = new Date().toISOString(); return this.saveGenerated({ ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now, isPublic: false, isFavorite: false, likeCount: 0 }); }
  async saveGenerated(artwork: Artwork) {
    const user = this.user(); const store = this.read();
    if (!validArtwork(artwork) || artwork.userId !== user.id) throw new StorageError("无法保存这幅作品。");
    const existing = store.artworks.find((art) => art.id === artwork.id);
    if (existing) { if (existing.userId !== user.id) throw new StorageError("作品标识冲突。"); return this.ownedView(store, existing); }
    const art = { ...artwork, isPublic: false, isFavorite: false, likeCount: 0 };
    store.artworks.unshift(art); store.authors[user.id] = user.name; this.write(store); return this.ownedView(store, art);
  }
  async update(id: string, input: ArtworkUpdate) {
    const store = this.read(); const art = this.owner(store, id);
    if (input.quote !== undefined) { if (!input.quote.trim() || input.quote.length > 45) throw new StorageError("短句需为 1–45 个字符。"); art.quote = input.quote; }
    if (input.isPublic !== undefined) art.isPublic = input.isPublic;
    if (input.isFavorite !== undefined) { const favorites = new Set(store.favorites[art.userId] ?? []); if (input.isFavorite) favorites.add(id); else favorites.delete(id); store.favorites[art.userId] = [...favorites]; }
    art.updatedAt = new Date().toISOString(); this.write(store); return this.ownedView(store, art);
  }
  async appendExpression(id: string, expression: Artwork) {
    const store = this.read();
    const art = this.owner(store, id);
    const session = art.creationSession;
    if (!session?.entitlement.allowRegenerate || session.entitlement.regenerateLimit !== 1) throw new StorageError("这幅作品不包含重新表达权益。");
    if (session.regenerateUsed || session.regeneratedExpression) throw new StorageError("这次创作已经换过一种表达。");
    const next = expression.creationSession;
    if (!validArtwork(expression) || !next || next.entitlement.tier !== "full" || next.regeneratedExpression
      || next.regenerateUsed || expression.userId !== art.userId || expression.originalText !== art.originalText
      || expression.imageUrl === art.imageUrl) throw new StorageError("新的表达尚未完成，请重试。");
    session.regeneratedExpression = next;
    session.regenerateUsed = true;
    session.updatedAt = art.updatedAt = new Date().toISOString();
    this.write(store);
    return this.ownedView(store, art);
  }
  async delete(id: string) {
    const store = this.read(); this.owner(store, id); store.artworks = store.artworks.filter((art) => art.id !== id);
    for (const map of [store.favorites, store.likes]) for (const key of Object.keys(map)) map[key] = map[key].filter((item) => item !== id);
    this.write(store);
  }
  async togglePublic(id: string) { const store = this.read(); const art = this.owner(store, id); art.isPublic = !art.isPublic; art.updatedAt = new Date().toISOString(); this.write(store); return this.ownedView(store, art); }
  async toggleFavorite(id: string) {
    const store = this.read(); const art = this.visible(store, id); const user = this.user(); const list = new Set(store.favorites[user.id] ?? []);
    if (list.has(id)) list.delete(id); else list.add(id); store.favorites[user.id] = [...list]; this.write(store);
    return art.userId === user.id ? this.ownedView(store, art) : this.project(store, art);
  }
  async isFavorite(id: string) { const store = this.read(); this.visible(store, id); return (store.favorites[this.user().id] ?? []).includes(id); }
  async getPublicAll() { const store = this.read(); return store.artworks.filter((art) => art.isPublic).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((art) => this.project(store, art)); }
  async getPublicById(id: string) { const store = this.read(); const art = store.artworks.find((item) => item.id === id && item.isPublic); return art ? this.project(store, art) : null; }
  async getFavorites() { const user = this.user(); const store = this.read(); return store.artworks.filter((art) => (store.favorites[user.id] ?? []).includes(art.id) && (art.userId === user.id || art.isPublic)).map((art) => this.project(store, art)); }
  async isLiked(id: string) { const store = this.read(); this.visible(store, id); return (store.likes[this.user().id] ?? []).includes(id); }
  async toggleLike(id: string) {
    const user = this.user(); const store = this.read(); const art = this.visible(store, id);
    if (!art.isPublic) throw new StorageError("只有公开作品可以点赞。");
    const list = new Set(store.likes[user.id] ?? []); if (list.has(id)) list.delete(id); else list.add(id);
    store.likes[user.id] = [...list]; this.write(store); return this.project(store, art);
  }
}
