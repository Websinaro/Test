"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { firebaseUser, profile, loading, getToken, refreshProfile, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  if (!loading && !firebaseUser) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <p className="text-muted mb-6">Log in to view your profile.</p>
        <Link href="/login" className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = await getToken();
      await api.updateMe(token, { name, phone });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Your Profile</h1>

      <div className="bg-ink-soft border border-ink-border rounded-xl2 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          {profile?.photo_url ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image src={profile.photo_url} alt={profile.name} fill sizes="64px" className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-aurora-gradient flex items-center justify-center text-xl font-bold uppercase">
              {profile?.name?.[0] || "U"}
            </div>
          )}
          <div>
            <p className="font-medium text-lg">{profile?.name}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Phone number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted mb-1.5 block">Email</span>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full rounded-xl bg-ink/50 border border-ink-border px-4 py-3 text-muted cursor-not-allowed"
            />
          </label>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-red-400 hover:text-red-300 transition text-sm font-medium px-4 py-3"
            >
              Sign out
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-aurora-cyan hover:underline text-sm">
          View your order history →
        </Link>
      </div>
    </div>
  );
}
