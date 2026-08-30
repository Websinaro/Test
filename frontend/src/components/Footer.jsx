import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink-border mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>
          <span className="gradient-text font-display font-semibold">Nexura</span> © {new Date().getFullYear()}. All rights reserved.
        </p>
        <div className="flex gap-6">
          <span className="hover:text-porcelain cursor-default transition">Privacy</span>
          <span className="hover:text-porcelain cursor-default transition">Terms</span>
          <span className="hover:text-porcelain cursor-default transition">Support</span>
          <Link href="/dev" className="hover:text-porcelain transition">Dev panel</Link>
        </div>
      </div>
    </footer>
  );
}
