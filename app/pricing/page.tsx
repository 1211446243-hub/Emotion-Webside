import { PricingExperience } from "@/components/commerce/pricing-experience";
import { siteConfig } from "@/config/site";

export const metadata = { title: `完整创作 — ${siteConfig.name}`, description: "继续留下这一刻。" };
export default function PricingPage() { return <PricingExperience />; }

