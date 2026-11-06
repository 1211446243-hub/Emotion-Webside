import { authService } from "@/lib/auth/auth-service";
import type { User } from "@/types/user";
import { MockArtworkRepository } from "./mock-artwork-repository";
import type { ArtworkRepository } from "./artwork-repository";

type ObservableRepository = ArtworkRepository & {
  getSnapshot: () => string | null;
  subscribe: (listener: () => void) => () => void;
};

/** Composition root: swap the adapter here when adding a database. */
export const artworkService: ObservableRepository = new MockArtworkRepository(
  () => window.localStorage,
  (): User | null => { const session = authService.getSessionSnapshot(); return session ? JSON.parse(session) : null; },
);
