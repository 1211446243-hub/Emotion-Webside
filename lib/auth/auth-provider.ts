import type { User } from "@/types/user";

export interface LoginInput { email: string; password: string }
export interface RegisterInput extends LoginInput { name: string; confirmPassword: string }

/** UI depends on this contract; a future real provider owns its session transport. */
export interface AuthProvider {
  getSessionSnapshot(): string | null;
  subscribe(listener: () => void): () => void;
  login(input: LoginInput): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
}

export class AuthError extends Error {
  constructor(message: string) { super(message); this.name = "AuthError"; }
}
