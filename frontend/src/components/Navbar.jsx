"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { firebaseUser, profile, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-ink/80 border-b border-ink-border">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <Link href="/" className="font-display font-700 text-xl tracking-tight">
          <span className="gradient-text font-bold">Nexura</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="/" className="hover:text-porcelain transition">Home</Link>
          <Link href="/?category=audio" className="hover:text-porcelain transition">Audio</Link>
          <Link href="/?category=wearables" className="hover:text-porcelain transition">Wearables</Link>
          <Link href="/?category=bags" className="hover:text-porcelain transition">Bags</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-ink-soft transition" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-aurora-gradient text-white text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {firebaseUser ? (
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-aurora-gradient flex items-center justify-center text-sm font-semibold uppercase"
              >
                {profile?.name?.[0] || firebaseUser.email?.[0] || "U"}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-ink-soft border border-ink-border rounded-xl shadow-glow overflow-hidden text-sm">
                  <Link href="/profile" onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-ink transition">
                    Profile
                  </Link>
                  <Link href="/orders" onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-ink transition">
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-ink transition text-red-400"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
