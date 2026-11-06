"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArtworkDetail } from "@/components/artwork/artwork-detail";

function ArtworkQuery() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const view = params.get("view");
  return <ArtworkDetail key={`${id}-${view ?? ""}`} id={id} publicView={view === "public"} />;
}

export default function ArtworkPage() {
  return <Suspense fallback={<div className="detail-loading" role="status">正在打开这一刻……</div>}><ArtworkQuery /></Suspense>;
}
