"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted mb-8">Looks like you haven&rsquo;t added anything yet.</p>
        <Link href="/" className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-ink-soft border border-ink-border rounded-xl2 p-4"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-porcelain shrink-0">
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.name}</h3>
              <p className="gradient-text font-semibold mt-1">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center border border-ink-border rounded-lg overflow-hidden">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-3 py-1.5 hover:bg-ink transition"
              >
                −
              </button>
              <span className="px-3 text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-3 py-1.5 hover:bg-ink transition"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
              className="text-muted hover:text-red-400 transition p-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-ink-soft border border-ink-border rounded-xl2 p-6 flex items-center justify-between">
        <div>
          <p className="text-muted text-sm">Subtotal</p>
          <p className="font-display text-2xl font-bold gradient-text">${subtotal.toFixed(2)}</p>
        </div>
        <Link href="/checkout" className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-xl">
          Checkout
        </Link>
      </div>
    </div>
  );
}
