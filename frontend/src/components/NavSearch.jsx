"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

// Reads the ?search= param, so it must live inside a <Suspense> boundary
// (useSearchParams opts the page out of static prerendering otherwise).
// `variant` picks which markup to render so the desktop bar and the mobile
// expanding row don't both mount from a single shared instance.
export default function NavSearch({ variant = "desktop", onCloseMobile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("search") || "");

  useEffect(() => {
    setQuery(searchParams?.get("search") || "");
  }, [searchParams]);

  function submitSearch(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
    onCloseMobile?.();
  }

  if (variant === "mobile") {
    return (
      <form onSubmit={submitSearch} className="sm:hidden px-5 pb-3 animate-slide-down">
        <div className="relative w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full bg-ink-soft border border-ink-border pl-10 pr-4 py-2.5 text-sm placeholder:text-muted focus:border-aurora-violet outline-none transition"
          />
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submitSearch} className="hidden sm:flex flex-1 max-w-sm ml-auto">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full bg-ink-soft border border-ink-border pl-10 pr-4 py-2 text-sm placeholder:text-muted focus:border-aurora-violet outline-none transition"
        />
      </div>
    </form>
  );
}
