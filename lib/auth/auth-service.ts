import type { AuthProvider } from "./auth-provider";
import { MockAuthProvider } from "./mock-auth-provider";
import { creationBalanceService } from "@/lib/commerce/commerce-service";

// Composition root: components never select or instantiate a provider.
const provider = new MockAuthProvider();
export const authService: AuthProvider = {
  getSessionSnapshot: provider.getSessionSnapshot,
  subscribe: provider.subscribe,
  logout: () => provider.logout(),
  login: async (input) => {
    const user = await provider.login(input);
    await creationBalanceService.grantFreeCredits(user.id);
    return user;
  },
  register: async (input) => {
    const user = await provider.register(input);
    await creationBalanceService.grantFreeCredits(user.id);
    return user;
  },
};

function isArtworkReturn(value: string): boolean {
  let url: URL;
  try { url = new URL(value, "https://local.invalid"); } catch { return false; }
  if (url.origin !== "https://local.invalid" || (url.pathname !== "/artwork" && url.pathname !== "/artwork/")) return false;
  const id = url.searchParams.get("id");
  const view = url.searchParams.get("view");
  return Boolean(id && /^[a-zA-Z0-9_-]+$/.test(id) && (view === null || view === "public") && [...url.searchParams.keys()].every((key) => key === "id" || key === "view"));
}

/** Only implemented destinations are accepted; never redirect to supplied external URLs. */
export function getSafeReturnTo(value: string | null): string {
  if (value && (["/", "/#create", "/create", "/pricing", "/me", "/me/artworks", "/me/favorites", "/me/purchases", "/gallery"].includes(value) || isArtworkReturn(value))) return value;
  return "/#create";
}
