import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { HeritageDetail } from "@/components/HeritageDetail";

export default async function HeritageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const heritage = await prisma.heritage.findUnique({
    where: { id: parseInt(id) },
  });

  if (!heritage) notFound();

  return <HeritageDetail heritage={heritage} />;
}
