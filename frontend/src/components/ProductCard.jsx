"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(100 - (Number(product.price) / Number(product.compare_price)) * 100)
    : null;

  return (
    <div className="group relative bg-ink-soft border border-ink-border rounded-xl2 overflow-hidden hover:border-aurora-violet/50 transition-colors">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-porcelain overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-aurora-gradient text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category_name && (
          <p className="text-xs uppercase tracking-wide text-muted mb-1">{product.category_name}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display font-semibold text-porcelain leading-snug line-clamp-1 hover:text-aurora-cyan transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1.5 text-xs text-aurora-gold">
          {"★".repeat(Math.round(Number(product.rating) || 0))}
          {"☆".repeat(5 - Math.round(Number(product.rating) || 0))}
          <span className="text-muted ml-1">{Number(product.rating).toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg gradient-text">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">
                ${Number(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
            className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
