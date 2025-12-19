"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
  onLinksChange: (links: LinkType[]) => void;
}

export default function LinksTable({ initialLinks, onLinksChange }: LinksTableProps) {
  const [links, setLinks] = useState(initialLinks);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  // Sync with parent state when initialLinks changes
  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const updateLinks = (newLinks: LinkType[]) => {
    setLinks(newLinks);
    onLinksChange(newLinks);
  };

  const deleteLink = async (code: string) => {
    setDeletingCode(code);

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        updateLinks(links.filter((l) => l.code !== code));
        toast.success("Link deleted successfully", {
          icon: "🗑️",
        });
      } else {
        toast.error(data.error || "Failed to delete link");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete link. Please try again.");
    } finally {
      setDeletingCode(null);
    }
  };

  const copyToClipboard = async (code: string) => {
    const url = `${window.location.origin}/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!", {
        icon: "📋",
      });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (links.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-12 text-center">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Links Yet</h3>
        <p className="text-gray-500">Create your first short link to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Your Links
        </h2>
        <span className="text-sm text-gray-400">{links.length} total</span>
      </div>

      {/* Links Grid */}
      <div className="grid gap-4">
        {links.map((link) => (
          <div
            key={link.code}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-2xl group"
          >
            <div className="p-5">
              {/* Top Row: Code + Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/link"
                    >
                      /{link.code}
                      <svg
                        className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <button
                      onClick={() => copyToClipboard(link.code)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy link"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400 hover:text-gray-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => deleteLink(link.code)}
                  disabled={deletingCode === link.code}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm font-medium rounded-lg transition-all duration-200 border border-red-600/30 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {deletingCode === link.code ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>

              {/* Target URL */}
              <div className="mb-4">
                <div className="flex items-start gap-2 text-gray-400 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <a
                    href={link.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all hover:text-blue-400 transition-colors flex-1"
                  >
                    {link.targetUrl}
                  </a>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-400">{link.totalClicks}</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-purple-400">
                        {link.lastClickedAt
                          ? new Date(link.lastClickedAt).toLocaleDateString()
                          : "Never"}
                      </p>
                      <p className="text-xs text-gray-500">Last Click</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Created {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
