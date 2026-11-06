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

/** Only implemented destinations are accepted; never redirect to supplied external URLs. */
export function getSafeReturnTo(value: string | null): string {
  if (value && (["/", "/#create", "/create", "/pricing", "/me", "/me/artworks", "/me/favorites", "/me/purchases", "/gallery"].includes(value) || /^\/artwork\/[a-zA-Z0-9_-]+$/.test(value))) return value;
  return "/#create";
}
