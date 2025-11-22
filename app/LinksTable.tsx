// app/LinksTable.tsx
"use client";

import { useState } from "react";

export type LinkType = {
  id: number;
  code: string;
  targetUrl: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

interface LinksTableProps {
  initialLinks: LinkType[];
}

export default function LinksTable({ initialLinks }: LinksTableProps) {
  const [links, setLinks] = useState(initialLinks);

  const deleteLink = async (code: string) => {
    const res = await fetch(`/api/links/${code}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setLinks(links.filter((l) => l.code !== code));
    } else {
      alert("Failed to delete!!!!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-6">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th className="p-3">Code</th>
            <th className="p-3">URL</th>
            <th className="p-3">Clicks</th>
            <th className="p-3">Last Click</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            <tr key={link.code} className="border-t border-gray-700">
              <td className="p-3 text-blue-400 underline">
                <a href={`/${link.code}`}>{link.code}</a>
              </td>
              <td className="p-3 truncate max-w-xs">{link.targetUrl}</td>
              <td className="p-3">{link.totalClicks}</td>
              <td className="p-3">
                {link.lastClickedAt
                  ? new Date(link.lastClickedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="p-3">
                <button
                  onClick={() => deleteLink(link.code)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {links.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-400">
                No links yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
