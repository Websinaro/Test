"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { firebaseUser, getToken } = useAuth();
  const router = useRouter();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  async function placeOrder() {
    setError("");
    if (!firebaseUser) {
      router.push("/login");
      return;
    }
    setPlacing(true);
    try {
      const token = await getToken();
      await api.createOrder(token, {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity, unitPrice: i.price })),
      });
      clearCart();
      setPlaced(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Order placed 🎉</h1>
        <p className="text-muted mb-8">Thanks for shopping with Nexura — a confirmation has been recorded.</p>
        <Link href="/orders" className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl inline-block">
          View orders
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <p className="text-muted mb-6">Your cart is empty.</p>
        <Link href="/" className="text-aurora-cyan hover:underline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="bg-ink-soft border border-ink-border rounded-xl2 p-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted">{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-ink-border pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span className="gradient-text">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mt-4">
          {error}
        </div>
      )}

      <p className="text-xs text-muted mt-4">
        This starter stores the order in PostgreSQL as &ldquo;pending&rdquo; — plug in Stripe/Razorpay
        here to actually collect payment.
      </p>

      <button
        onClick={placeOrder}
        disabled={placing}
        className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl mt-6 disabled:opacity-60"
      >
        {placing ? "Placing order…" : `Place order — $${subtotal.toFixed(2)}`}
      </button>
    </div>
  );
}
