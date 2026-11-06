/** Completion is shown only once the local artwork is actually loaded. */
export function preloadImage(url: string, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const cleanup = () => { clearTimeout(timeout); image.onload = null; image.onerror = null; signal.removeEventListener("abort", cancel); };
    const cancel = () => { cleanup(); image.src = ""; reject(signal.reason ?? new DOMException("Aborted", "AbortError")); };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("Artwork loading timed out.")); }, 8000);
    image.onload = () => { cleanup(); resolve(); };
    image.onerror = () => { cleanup(); reject(new Error("Artwork could not be loaded.")); };
    signal.addEventListener("abort", cancel, { once: true });
    image.src = url;
  });
}
