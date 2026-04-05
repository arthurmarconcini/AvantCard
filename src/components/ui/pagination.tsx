"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-xs font-semibold text-zinc-400 tabular-nums px-3 select-none">
        {currentPage} <span className="text-zinc-600">de</span> {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
