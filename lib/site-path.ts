const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix local asset paths when the site is hosted under a GitHub Pages project path. */
export function assetUrl(path: string): string {
  if (!basePath || !path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}

/** Static-host artwork address. The id lives in the query so unknown works still open after export. */
export function artworkPath(id: string, view?: "public"): string {
  const params = new URLSearchParams({ id });
  if (view === "public") params.set("view", "public");
  return `/artwork?${params.toString()}`;
}

export function absoluteArtworkUrl(id: string): string {
  return `${window.location.origin}${assetUrl(artworkPath(id, "public"))}`;
}
