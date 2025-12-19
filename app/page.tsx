import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

type LinkFromDB = {
  id: number;
  code: string;
  targetUrl: string;
  totalClicks: number;
  lastClickedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function DashboardPage() {
  const linksFromDb: LinkFromDB[] = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  const links = linksFromDb.map((link: LinkFromDB) => ({
    ...link,
    lastClickedAt: link.lastClickedAt ? link.lastClickedAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  }));

  return <DashboardClient initialLinks={links} />;
}
