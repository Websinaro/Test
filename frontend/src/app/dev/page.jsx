"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

const KEY_STORAGE = "nexura_dev_key";
const EMAIL_STORAGE = "nexura_dev_email";
const EMPTY_FORM = {
  name: "",
  description: "",
  detailedDescription: "",
  price: "",
  comparePrice: "",
  imageUrl: "",
  categoryId: "",
  stock: "100",
  isFeatured: false,
};

function DevAuthGate({ onUnlock }) {
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter both the dev email and password.");
      return;
    }
    setLoading(true);
    try {
      const call = mode === "signup" ? api.devSignup : api.devLogin;
      const { token } = await call({ email: email.trim(), password });
      onUnlock(token, email.trim());
    } catch (err) {
      // If signup says the account already exists, nudge to the login tab
      if (mode === "signup" && err.message?.toLowerCase().includes("already exists")) {
        setMode("login");
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-ink-soft border border-ink-border rounded-xl2 p-8 animate-fade-in-up"
      >
        <h1 className="font-display text-2xl font-bold mb-1">Dev panel</h1>
        <p className="text-sm text-muted mb-6">
          {mode === "signup"
            ? "First time here? Sign up with the DEV_EMAIL / DEV_PASSWORD configured on the backend."
            : "Log in with your dev email and password."}
        </p>

        <div className="flex gap-1 bg-ink border border-ink-border rounded-xl p-1 mb-5 text-sm">
          {["signup", "login"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg transition capitalize ${
                mode === m ? "btn-gradient text-white" : "text-muted hover:text-porcelain"
              }`}
            >
              {m === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        <label className="block mb-3">
          <span className="text-sm text-muted mb-1.5 block">Dev email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dev@example.com"
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-muted mb-1.5 block">Dev password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
          />
        </label>

        {error && <p className="text-sm text-red-300 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
        </button>

        <p className="text-xs text-muted mt-4 text-center">
          These must match <code className="text-[11px]">DEV_EMAIL</code> /{" "}
          <code className="text-[11px]">DEV_PASSWORD</code> in the backend&rsquo;s <code className="text-[11px]">.env</code>.
        </p>
      </form>
    </div>
  );
}

export default function DevPanelPage() {
  const [devKey, setDevKey] = useState("");
  const [devEmail, setDevEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  // Restore a previously authenticated session for this browser tab
  useEffect(() => {
    const savedKey = window.sessionStorage.getItem(KEY_STORAGE);
    const savedEmail = window.sessionStorage.getItem(EMAIL_STORAGE);
    if (savedKey) {
      setDevKey(savedKey);
      setDevEmail(savedEmail || "");
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      api.getCategories().then((data) => setCategories(data.categories)).catch(() => {});
    }
  }, [unlocked]);

  function handleUnlock(token, email) {
    window.sessionStorage.setItem(KEY_STORAGE, token);
    window.sessionStorage.setItem(EMAIL_STORAGE, email);
    setDevKey(token);
    setDevEmail(email);
    setUnlocked(true);
  }

  function handleLock() {
    window.sessionStorage.removeItem(KEY_STORAGE);
    window.sessionStorage.removeItem(EMAIL_STORAGE);
    setUnlocked(false);
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
        detailedDescription: form.detailedDescription || undefined,
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
        handleLock();
      }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!unlocked) {
    return <DevAuthGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Add a product</h1>
          {devEmail && <p className="text-xs text-muted mt-1">Signed in as {devEmail}</p>}
        </div>
        <button onClick={handleLock} className="text-sm text-muted hover:text-red-400 transition">
          Log out
        </button>
      </div>

      <p className="text-xs text-muted bg-aurora-gradient-soft border border-aurora-violet/30 rounded-lg px-4 py-2.5 mb-6">
        This panel is gated by a single dev identity from env vars, not a full admin/role system —
        fine for a solo dev or small team, swap for proper role-based auth before opening it up to others.
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
          <span className="text-sm text-muted mb-1.5 block">Short description</span>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={2}
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition resize-none"
            placeholder="Short, specific product description…"
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted mb-1.5 block">Detailed description</span>
          <textarea
            value={form.detailedDescription}
            onChange={update("detailedDescription")}
            rows={4}
            className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition resize-none"
            placeholder="Full spec sheet, materials, what's in the box, care instructions…"
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
            <span className="text-sm text-muted mb-1.5 block">Compare-at (original) price ($)</span>
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
