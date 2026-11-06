import type { Artwork, PublicArtwork } from "@/types/artwork";

export type NewArtwork = Omit<Artwork, "id" | "createdAt" | "updatedAt" | "isPublic" | "isFavorite" | "likeCount">;
export type ArtworkUpdate = Partial<Pick<Artwork, "quote" | "isPublic" | "isFavorite">>;

/** Private-by-default persistence contract; public reads use a separate projection. */
export interface ArtworkRepository {
  appendExpression(id: string, expression: Artwork): Promise<Artwork>;
  getAll(): Promise<Artwork[]>;
  getById(id: string): Promise<Artwork | null>;
  create(input: NewArtwork): Promise<Artwork>;
  update(id: string, input: ArtworkUpdate): Promise<Artwork>;
  delete(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<Artwork | PublicArtwork>;
  togglePublic(id: string): Promise<Artwork>;
  saveGenerated(artwork: Artwork): Promise<Artwork>;
  getPublicAll(): Promise<PublicArtwork[]>;
  getPublicById(id: string): Promise<PublicArtwork | null>;
  getFavorites(): Promise<PublicArtwork[]>;
  isFavorite(id: string): Promise<boolean>;
  toggleLike(id: string): Promise<PublicArtwork>;
  isLiked(id: string): Promise<boolean>;
}
