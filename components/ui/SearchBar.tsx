"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  loading?: boolean;
  /** Debounce delay in ms for live search. */
  debounceMs?: number;
}

/** Debounced search input. Fires onSearch after typing settles, or on submit. */
export function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search a brand or item — e.g. Nike Air Force 1",
  loading = false,
  debounceMs = 500,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const lastFired = useRef(initialValue);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2 || q === lastFired.current) return;
    const id = setTimeout(() => {
      lastFired.current = q;
      onSearch(q);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs, onSearch]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q.length < 2) return;
    lastFired.current = q;
    onSearch(q);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/15">
        {loading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cobalt" />
        ) : (
          <Search className="h-5 w-5 shrink-0 text-muted" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search a brand or item"
          className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="hidden rounded-pill bg-brand-gradient px-4 py-1.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:block"
        >
          Search
        </button>
      </div>
    </form>
  );
}
