"use client";

import GoogleIcon from "@/components/icons/GoogleIcon";

export default function GoogleButton({ onClick, loading, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-border bg-white text-ink font-medium py-3 px-4 hover:bg-porcelain-dim transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <GoogleIcon />
      <span>{loading ? "Please wait…" : label}</span>
    </button>
  );
}
