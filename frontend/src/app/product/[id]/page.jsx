"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const { id: slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(slug)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-20 text-center text-muted">Loading…</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <p className="text-red-300 mb-4">{error || "Product not found."}</p>
        <Link href="/" className="text-aurora-cyan hover:underline">Back to shop</Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <Link href="/" className="text-sm text-muted hover:text-porcelain transition">← Back to shop</Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div className="relative aspect-square bg-porcelain rounded-xl2 overflow-hidden">
          <Image src={product.image_url} alt={product.name} fill sizes="50vw" className="object-cover" />
        </div>

        <div>
          {product.category_name && (
            <p className="text-xs uppercase tracking-widest text-aurora-cyan mb-2">{product.category_name}</p>
          )}
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-1 mt-3 text-sm text-aurora-gold">
            {"★".repeat(Math.round(Number(product.rating)))}
            {"☆".repeat(5 - Math.round(Number(product.rating)))}
            <span className="text-muted ml-1">{Number(product.rating).toFixed(1)} rating</span>
          </div>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-display text-3xl font-bold gradient-text">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-muted line-through">${Number(product.compare_price).toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted mt-5 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-ink-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 hover:bg-ink-soft transition"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-4 font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 hover:bg-ink-soft transition"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                addItem(product, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              className="flex-1 btn-gradient text-white font-semibold py-3 rounded-xl"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>

          <p className="text-xs text-muted mt-4">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} · Free shipping over $50
          </p>
        </div>
      </div>
    </div>
  );
}
