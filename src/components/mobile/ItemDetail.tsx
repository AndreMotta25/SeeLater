"use client";

import { type Item } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ItemDetailProps {
  item: Item;
  onMarkAsViewed?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAsUnviewed?: (id: string) => void;
}

export function ItemDetail({
  item,
  onMarkAsViewed,
  onDelete,
  onMarkAsUnviewed,
}: ItemDetailProps) {
  const router = useRouter();
  const [viewed, setViewed] = useState(item.viewed);

  async function handleMarkAsViewed() {
    setViewed(true);
    if (onMarkAsViewed) {
      await onMarkAsViewed(item.id);
    }
  }

  async function handleMarkAsUnviewed() {
    setViewed(false);
    if (onMarkAsUnviewed) {
      await onMarkAsUnviewed(item.id);
    }
  }

  async function handleDelete() {
    if (confirm("Tem certeza que deseja remover este item?")) {
      if (onDelete) {
        await onDelete(item.id);
      }
      router.back();
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString("pt-BR", { month: "short" });
    return `Salvo em ${day} ${month}`;
  };

  return (
    <div className="pb-20">
      {/* Cover Image */}
      <div className="px-4 pt-4">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#1A1A2E]">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-[#6366F1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#EF4444] mb-3 font-heading">
          {item.title}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {item.siteName && (
            <span className="px-3 py-1 rounded-full bg-[#6366F1] text-white text-xs font-semibold">
              {item.siteName}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-[#2A2A3E] text-white text-xs font-semibold">
            {item.type === "video"
              ? "Vídeo"
              : item.type === "article"
                ? "Artigo"
                : item.type === "repo"
                  ? "Repositório"
                  : item.type === "tweet"
                    ? "Tweet"
                    : "Outro"}
          </span>
          {item.category && (
            <span className="px-3 py-1 rounded-full bg-[#2A2A3E] text-white text-xs font-semibold">
              {item.category}
            </span>
          )}
        </div>

        {/* Date */}
        <p className="text-sm text-[#94A3B8] mb-6">
          {formatDate(item.createdAt)}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Open Link */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-[#6366F1] text-white font-semibold rounded-full hover:bg-[#5558E8] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 3H21V9M21 3L14 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Abrir link
          </a>

          {/* Mark as Viewed/Unviewed */}
          {viewed ? (
            <button
              onClick={handleMarkAsUnviewed}
              className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-[#2D2D44] text-[#6366F1] font-semibold rounded-full border border-[#6366F1]/30 hover:bg-[#3A3A5C] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Marcar como não visto
            </button>
          ) : (
            <button
              onClick={handleMarkAsViewed}
              className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-[#2D2D44] text-[#6366F1] font-semibold rounded-full border border-[#6366F1]/30 hover:bg-[#3A3A5C] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 12L11 15L16 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Marcar como visto
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-[#1F161A] text-[#EF4444] font-semibold rounded-full hover:bg-[#2A1C22] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Remover
          </button>
        </div>

        {/* Description Card */}
        {item.description && (
          <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2A3E]">
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {item.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
