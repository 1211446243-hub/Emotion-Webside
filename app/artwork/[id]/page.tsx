import { ArtworkDetail } from "@/components/artwork/artwork-detail";
import { siteConfig } from "@/config/site";
export const metadata = { title: `一个时刻 — ${siteConfig.name}` };
export default async function ArtworkPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> }) {
  const [{ id }, { view }] = await Promise.all([params, searchParams]);
  return <ArtworkDetail key={`${id}-${view}`} id={id} publicView={view === "public"} />;
}
