import { AuthError, type AuthProvider, type LoginInput, type RegisterInput } from "./auth-provider";
import type { User } from "@/types/user";

const AUTH_KEY = "mock_auth";
const USER_KEY = "mock_user";
const DEFAULT_USER: User = { id: "demo-user", name: "User", avatar: null };
const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_USER);

export function validateLogin(input: LoginInput) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new AuthError("请填写有效的邮箱地址。");
  if (input.password.length < 8 || input.password.length > 128 || !input.password.trim()) throw new AuthError("密码需为 8–128 个字符。");
}

/** Local simulation only: never stores passwords or sends credentials to a server. */
export class MockAuthProvider implements AuthProvider {
  private listeners = new Set<() => void>();
  private storage() {
    if (typeof window === "undefined") throw new AuthError("请在浏览器中登录。");
    return window.localStorage;
  }
  getSessionSnapshot = (): string | null => {
    try {
      const storage = this.storage();
      if (storage.getItem(AUTH_KEY) !== "true") return null;
      const raw = storage.getItem(USER_KEY);
      if (!raw) return DEFAULT_SNAPSHOT;
      const user: unknown = JSON.parse(raw);
      if (typeof user === "object" && user !== null && "id" in user && user.id === "demo-user" && "name" in user && typeof user.name === "string" && user.name.trim() && user.name.length <= 30 && "avatar" in user && user.avatar === null) return raw;
      return DEFAULT_SNAPSHOT;
    } catch { return null; }
  };
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_KEY || event.key === USER_KEY || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => { this.listeners.delete(listener); window.removeEventListener("storage", onStorage); };
  };
  private emit() { this.listeners.forEach((listener) => listener()); }
  private save(user: User) {
    try {
      const storage = this.storage();
      storage.setItem(USER_KEY, JSON.stringify(user));
      storage.setItem(AUTH_KEY, "true");
    } catch { throw new AuthError("浏览器无法保存登录状态，请允许本站使用本地存储后重试。"); }
    this.emit();
    return user;
  }
  async login(input: LoginInput) {
    validateLogin(input);
    return this.save(DEFAULT_USER);
  }
  async register(input: RegisterInput) {
    validateLogin(input);
    const name = input.name.trim();
    if (!name || name.length > 30) throw new AuthError("昵称需为 1–30 个字符。");
    if (input.password !== input.confirmPassword) throw new AuthError("两次输入的密码不一致。");
    return this.save({ ...DEFAULT_USER, name });
  }
  async logout() {
    try { const storage = this.storage(); storage.removeItem(AUTH_KEY); storage.removeItem(USER_KEY); }
    catch { throw new AuthError("暂时无法退出，请检查浏览器的存储设置。"); }
    this.emit();
  }
}
