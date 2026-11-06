import { RequireAuth } from "@/components/auth/require-auth";
export default function MeLayout({ children }: { children: React.ReactNode }) { return <RequireAuth>{children}</RequireAuth>; }
