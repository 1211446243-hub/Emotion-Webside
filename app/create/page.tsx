import { GenerationState } from "@/components/create/generation-state";
import { siteConfig } from "@/config/site";

export const metadata = { title: `留下此刻 — ${siteConfig.name}` };
export default function CreatePage() { return <GenerationState />; }
