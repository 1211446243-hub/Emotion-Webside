"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authService, getSafeReturnTo } from "@/lib/auth/auth-service";
import { AuthError } from "@/lib/auth/auth-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = getSafeReturnTo(params.get("returnTo"));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return <section className="auth-page" aria-labelledby="auth-title">
    <p className="eyebrow">A PLACE FOR YOUR MOMENTS</p>
    <h1 id="auth-title">{register ? "给此刻，一个名字。" : "回来，接着写。"}</h1>
    <p className="auth-intro">{register ? "留一个称呼，继续刚才的想法。" : "那些没写完的话，可以慢慢来。"}</p>
    <form className="auth-form" onSubmit={async (event) => {
      event.preventDefault();
      if (pending) return;
      setPending(true); setError("");
      const form = event.currentTarget;
      const data = new FormData(form);
      const email = String(data.get("email") ?? "");
      const password = String(data.get("password") ?? "");
      try {
        if (register) await authService.register({ email, password, name: String(data.get("name") ?? ""), confirmPassword: String(data.get("confirmPassword") ?? "") });
        else await authService.login({ email, password });
        form.reset();
        router.replace(returnTo);
      } catch (cause) {
        setError(cause instanceof AuthError ? cause.message : "暂时无法登录，请再试一次。");
      } finally { setPending(false); }
    }}>
      {register && <label>昵称<input name="name" autoComplete="nickname" required maxLength={30} /></label>}
      <label>邮箱<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>密码<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={8} maxLength={128} aria-describedby="password-note" /></label>
      <p id="password-note" className="auth-note">8–128 个字符</p>
      {register && <label>确认密码<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>}
      <p className="auth-error" role="alert">{error}</p>
      <button className="generate-button" type="submit" disabled={pending}>{pending ? "请稍候……" : register ? "注册并继续" : "登录并继续"}<span aria-hidden="true">↗</span></button>
    </form>
    <p className="auth-switch">{register ? "已有账号？" : "第一次来？"}<Link href={`/${register ? "login" : "register"}?returnTo=${encodeURIComponent(returnTo)}`}>{register ? "登录" : "注册"}</Link></p>
    <p className="auth-disclosure">当前为模拟登录，格式正确即可进入。<br />不会创建真实账号，也不会保存密码。</p>
  </section>;
}
