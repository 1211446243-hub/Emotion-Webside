import { notFound } from "next/navigation";
import { DebugPanel } from "@/components/debug/debug-panel";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DebugPanel />;
}
