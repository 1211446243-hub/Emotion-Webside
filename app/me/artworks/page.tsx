import { CollectionPage } from "@/components/gallery/collection-page";
import { siteConfig } from "@/config/site";
export const metadata = { title: `我的作品 — ${siteConfig.name}` };
export default function MyArtworksPage() { return <CollectionPage mode="mine" />; }
