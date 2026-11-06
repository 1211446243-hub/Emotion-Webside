import test from "node:test";
import assert from "node:assert/strict";
import { MockAuthProvider, validateLogin } from "@/lib/auth/mock-auth-provider";
import { getSafeReturnTo } from "@/lib/auth/auth-service";

test("credential validation rejects malformed input", () => {
  for (const email of ["", "invalid", "a@b", "a b@c.com"]) assert.throws(() => validateLogin({ email, password: "12345678" }));
  for (const password of ["", "short", "        ", "x".repeat(129)]) assert.throws(() => validateLogin({ email: "a@b.com", password }));
  assert.doesNotThrow(() => validateLogin({ email: "a@b.com", password: "12345678" }));
});

test("only implemented local return paths are allowed", () => {
  for (const path of [null, "https://example.com", "//example.com", "javascript:alert(1)", "/login", "/me/unknown", "/\\evil", "%2f%2fevil"]) assert.equal(getSafeReturnTo(path), "/#create");
  assert.equal(getSafeReturnTo("/"), "/");
  assert.equal(getSafeReturnTo("/pricing"), "/pricing");
  assert.equal(getSafeReturnTo("/artwork?id=work_1"), "/artwork?id=work_1");
  assert.equal(getSafeReturnTo("/artwork?id=work_1&view=public"), "/artwork?id=work_1&view=public");
  assert.equal(getSafeReturnTo("/artwork?id=work_1&view=private"), "/#create");
});

test("mock session, storage failures, subscriptions and password privacy", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const store = new Map<string, string>();
  const events = new EventTarget();
  let fail = false;
  const localStorage = {
    getItem: (key: string) => { if (fail) throw new Error("denied"); return store.get(key) ?? null; },
    setItem: (key: string, value: string) => { if (fail) throw new Error("denied"); store.set(key, value); },
    removeItem: (key: string) => { if (fail) throw new Error("denied"); store.delete(key); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) } });
  try {
    const provider = new MockAuthProvider();
    let changes = 0;
    const unsubscribe = provider.subscribe(() => { changes++; });
    const credentials = { email: "demo@example.com", password: "private-password" };
    assert.equal(provider.getSessionSnapshot(), null);
    await assert.rejects(provider.register({ ...credentials, name: " ", confirmPassword: credentials.password }));
    await assert.rejects(provider.register({ ...credentials, name: "User", confirmPassword: "mismatch" }));
    assert.equal(provider.getSessionSnapshot(), null);
    await provider.register({ ...credentials, name: "拾光", confirmPassword: credentials.password });
    assert.equal(store.get("mock_auth"), "true");
    assert.equal(JSON.parse(provider.getSessionSnapshot() ?? "{}").name, "拾光");
    assert.equal(new MockAuthProvider().getSessionSnapshot(), provider.getSessionSnapshot());
    assert.ok(!JSON.stringify([...store]).includes(credentials.password));
    assert.ok(!JSON.stringify([...store]).includes(credentials.email));
    await provider.logout();
    assert.equal(provider.getSessionSnapshot(), null);
    assert.equal(changes, 2);
    await provider.login(credentials);
    assert.equal(JSON.parse(provider.getSessionSnapshot() ?? "{}").id, "demo-user");
    store.set("mock_user", "corrupt");
    assert.equal(provider.getSessionSnapshot(), null);
    fail = true;
    await assert.rejects(provider.login(credentials), /本地存储/);
    assert.equal(provider.getSessionSnapshot(), null);
    await assert.rejects(provider.logout(), /存储/);
    unsubscribe();
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
