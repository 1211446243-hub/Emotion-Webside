import { ProfilePage } from "@/components/profile/profile-page";
import { siteConfig } from "@/config/site";
export const metadata = { title: `我的空间 — ${siteConfig.name}` };
export default function MePage() { return <ProfilePage />; }
