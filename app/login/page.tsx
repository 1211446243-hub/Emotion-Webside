import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";
export const metadata = { title: `登录 — ${siteConfig.name}` };
export default function LoginPage() { return <Suspense fallback={<p className="auth-page">正在打开……</p>}><LoginForm /></Suspense>; }
