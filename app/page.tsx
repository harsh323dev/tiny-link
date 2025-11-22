// app/page.tsx
import { prisma } from "@/lib/prisma";
import LinksTable from "./LinksTable";

// Define the type of a link returned from DB
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">TinyLink Dashboard</h1>

      {/* FORM */}
      <form
        action="/api/links"
        method="POST"
        className="max-w-xl mx-auto bg-gray-900 p-6 rounded-lg mb-10"
      >
        <label className="block mb-4">
          Target URL
          <input
            name="url"
            placeholder="https://example.com"
            required
            className="w-full p-2 rounded bg-gray-800 mt-1"
          />
        </label>

        <label className="block mb-4">
          Custom Code (optional)
          <input
            name="code"
            placeholder="myshortcode"
            className="w-full p-2 rounded bg-gray-800 mt-1"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
        >
          Create Short Link
        </button>
      </form>

      {/* TABLE */}
      <LinksTable initialLinks={links} />
    </div>
  );
}
