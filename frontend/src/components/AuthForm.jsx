"use client";

export function TextField({ label, type = "text", value, onChange, placeholder, required = true }) {
  return (
    <label className="block">
      <span className="text-sm text-muted mb-1.5 block">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 text-porcelain placeholder:text-muted/60 focus:border-aurora-violet outline-none transition"
      />
    </label>
  );
}

export function Divider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted uppercase tracking-wide">
      <span className="flex-1 h-px bg-ink-border" />
      {label}
      <span className="flex-1 h-px bg-ink-border" />
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
      {message}
    </div>
  );
}
