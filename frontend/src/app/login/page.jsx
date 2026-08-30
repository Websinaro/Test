"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TextField, Divider, ErrorBanner } from "@/components/AuthForm";
import GoogleButton from "@/components/GoogleButton";
import { friendlyAuthError } from "@/lib/authErrors";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            Welcome <span className="gradient-text">back</span>
          </h1>
          <p className="text-muted mt-2 text-sm">Log in to continue shopping.</p>
        </div>

        <div className="bg-ink-soft border border-ink-border rounded-xl2 p-6 sm:p-8 space-y-5">
          <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />
          <Divider />

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label="Email" type="email" value={form.email} onChange={update("email")} placeholder="jane@example.com" />
            <TextField label="Password" type="password" value={form.password} onChange={update("password")} placeholder="Your password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            New to Nexura?{" "}
            <Link href="/signup" className="text-aurora-cyan hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
