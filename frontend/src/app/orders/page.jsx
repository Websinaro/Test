"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function OrdersPage() {
  const { firebaseUser, getToken, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    getToken()
      .then((token) => api.getOrders(token))
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [firebaseUser, authLoading, getToken]);

  if (!authLoading && !firebaseUser) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <p className="text-muted mb-6">Log in to see your order history.</p>
        <Link href="/login" className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Your Orders</h1>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-muted">No orders yet — once you check out, they&rsquo;ll show up here.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-ink-soft border border-ink-border rounded-xl2 p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Order #{order.id}</span>
              <span className="text-xs uppercase tracking-wide px-2.5 py-1 rounded-full bg-aurora-gradient-soft text-aurora-cyan border border-aurora-violet/30">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
            <p className="font-display font-bold gradient-text mt-2">${Number(order.total).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
