import { CollectionPage } from "@/components/gallery/collection-page";
import { siteConfig } from "@/config/site";
export const metadata = { title: `我的收藏 — ${siteConfig.name}` };
export default function FavoritesPage() { return <CollectionPage mode="favorites" />; }
