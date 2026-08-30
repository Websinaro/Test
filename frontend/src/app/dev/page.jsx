"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

const STORAGE_KEY = "nexura_dev_key";
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  imageUrl: "",
  categoryId: "",
  stock: "100",
  isFeatured: false,
};

export default function DevPanelPage() {
  const [devKey, setDevKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [keyError, setKeyError] = useState("");

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  // Restore a previously entered key for this browser session
  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setDevKey(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      api.getCategories().then((data) => setCategories(data.categories)).catch(() => {});
    }
  }, [unlocked]);

  function handleUnlock(e) {
    e.preventDefault();
    setKeyError("");
    if (!devKey.trim()) {
      setKeyError("Enter the dev key first.");
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, devKey);
    setUnlocked(true);
  }

  function update(field) {
    return (e) => {
      const value = field === "isFeatured" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCreated(null);

    if (!form.name || !form.price || !form.imageUrl) {
      setError("Name, price, and image URL are required.");
      return;
    }

    setSaving(true);
    try {
      const { product } = await api.createProduct(devKey, {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        imageUrl: form.imageUrl,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        stock: Number(form.stock) || 0,
        isFeatured: form.isFeatured,
      });
      setCreated(product);
      setForm(EMPTY_FORM);
    } catch (err) {
      if (err.message?.toLowerCase().includes("invalid dev key")) {
        // Key was wrong/stale — kick back to the unlock screen
        window.sessionStorage.removeItem(STORAGE_KEY);
        setUnlocked(false);
      }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm bg-ink-soft border border-ink-border rounded-xl2 p-8"
        >
          <h1 className="font-display text-2xl font-bold mb-1">Dev panel</h1>
          <p className="text-sm text-muted mb-6">
            Enter the <code className="text-xs">DEV_SECRET</code> configured on the backend.
          </p>
          <input
            type="password"
            value={devKey}
            onChange={(e) => setDevKey(e.target.value)}
            placeholder="Dev key"
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition mb-3"
          />
          {keyError && <p className="text-sm text-red-300 mb-3">{keyError}</p>}
          <button type="submit" className="w-full btn-gradient text-white font-semibold py-3 rounded-xl">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Add a product</h1>
        <button
          onClick={() => {
            window.sessionStorage.removeItem(STORAGE_KEY);
            setUnlocked(false);
          }}
          className="text-sm text-muted hover:text-red-400 transition"
        >
          Lock
        </button>
      </div>

      <p className="text-xs text-muted bg-aurora-gradient-soft border border-aurora-violet/30 rounded-lg px-4 py-2.5 mb-6">
        This panel is gated by a shared dev key, not a real admin role system — fine for a solo
        dev or small team, swap for proper role-based auth before opening it up to others.
      </p>

      <form onSubmit={handleSubmit} className="bg-ink-soft border border-ink-border rounded-xl2 p-6 sm:p-8 space-y-4">
        <label className="block">
          <span className="text-sm text-muted mb-1.5 block">Product name *</span>
          <input
            value={form.name}
            onChange={update("name")}
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            placeholder="Aurora Wireless Headphones"
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted mb-1.5 block">Description</span>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={3}
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition resize-none"
            placeholder="Short, specific product description…"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Price ($) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={update("price")}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
              placeholder="79.00"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Compare-at price ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.comparePrice}
              onChange={update("comparePrice")}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
              placeholder="99.00"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-muted mb-1.5 block">Image URL *</span>
          <input
            value={form.imageUrl}
            onChange={update("imageUrl")}
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            placeholder="https://images.unsplash.com/…"
          />
        </label>

        {form.imageUrl && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-porcelain border border-ink-border">
            <Image
              src={form.imageUrl}
              alt="Preview"
              fill
              sizes="96px"
              className="object-cover"
              onError={() => {}}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Category</span>
            <select
              value={form.categoryId}
              onChange={update("categoryId")}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Stock</span>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={update("stock")}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            />
          </label>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={update("isFeatured")}
            className="w-4 h-4 accent-aurora-violet"
          />
          Feature on homepage
        </label>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}
        {created && (
          <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5">
            Added &ldquo;{created.name}&rdquo; ✓
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add product"}
        </button>
      </form>
    </div>
  );
}
