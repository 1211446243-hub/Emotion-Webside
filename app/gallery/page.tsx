import { CollectionPage } from "@/components/gallery/collection-page";
import { siteConfig } from "@/config/site";
export const metadata = { title: `作品广场 — ${siteConfig.name}` };
export default function GalleryPage() { return <CollectionPage mode="public" />; }
