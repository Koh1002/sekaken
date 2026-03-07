import { supabase, toHeritage } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { HeritageDetail } from "@/components/HeritageDetail";

export default async function HeritageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("heritages")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error || !data) notFound();

  return <HeritageDetail heritage={toHeritage(data)} />;
}
