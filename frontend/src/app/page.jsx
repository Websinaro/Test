"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

const CATEGORIES = [
  { label: "All", slug: "" },
  { label: "Audio", slug: "audio" },
  { label: "Wearables", slug: "wearables" },
  { label: "Bags", slug: "bags" },
  { label: "Home", slug: "home" },
];

function Storefront() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = activeCategory ? `?category=${activeCategory}` : "";
    api
      .getProducts(query)
      .then((data) => !cancelled && setProducts(data.products))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-border">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-aurora-gradient opacity-20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-aurora-gradient opacity-10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-aurora-cyan bg-aurora-gradient-soft border border-aurora-violet/30 rounded-full px-4 py-1.5 mb-6">
            New Season Arrivals
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Everyday objects, <span className="gradient-text">tomorrow&rsquo;s finish.</span>
          </h1>
          <p className="text-muted mt-5 max-w-xl mx-auto">
            Considered audio, wearables, and everyday carry — designed to feel as good as they look.
          </p>
          <a
            href="#shop"
            className="inline-block mt-8 btn-gradient text-white font-semibold px-7 py-3.5 rounded-xl"
          >
            Shop the collection
          </a>
        </div>
      </section>

      {/* Category strip + grid */}
      <section id="shop" className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <h2 className="font-display text-2xl font-bold">
            {activeCategory
              ? CATEGORIES.find((c) => c.slug === activeCategory)?.label
              : "Everything"}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <a
                key={c.label}
                href={c.slug ? `/?category=${c.slug}` : "/"}
                className={`text-sm px-4 py-1.5 rounded-full border transition ${
                  activeCategory === c.slug
                    ? "btn-gradient text-white border-transparent"
                    : "border-ink-border text-muted hover:text-porcelain hover:border-aurora-violet/50"
                }`}
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-ink-soft border border-ink-border rounded-xl2 aspect-[3/4]" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl2 py-10 px-4">
            Couldn&rsquo;t load products — is the backend running at{" "}
            <code className="text-xs">NEXT_PUBLIC_API_URL</code>? ({error})
          </div>
        )}

        {!loading && !error && <ProductGrid products={products} />}
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Storefront />
    </Suspense>
  );
}
