import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
  Mail,
  Zap,
} from 'lucide-react';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 2000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs font-sans">
      {/* 1. Newsletter & Atelier Dispatch Strip */}
      <div className="border-b border-slate-900 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight font-sans">
                Atelier Dispatch & Hardware Releases
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Receive confidential allocation alerts, benchmark breakdowns, and early access to numbered batches.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter work or studio email..."
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Join Dispatch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black font-mono text-sm">
              N
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              NEXUS<span className="text-blue-500">.</span> ATELIER
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Curated precision hardware, custom acoustic listening monitors, high-throughput silicon workstations, and biometric accessories. Calibrated for uncompromising professionals.
          </p>

          <div className="pt-2 flex items-center gap-3 text-slate-400 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              99.98% System Uptime
            </span>
            <span>•</span>
            <span>SOC2 Type II Certified</span>
          </div>
        </div>

        {/* Column 1: Hardware Catalog */}
        <div className="space-y-3">
          <h4 className="font-mono font-bold text-[11px] uppercase tracking-widest text-slate-200">
            Departments
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Acoustic & Studio Audio</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Silicon Workstations</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Autonomous Smart Living</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Titanium Bio-Wearables</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Next-Gen VR & Gaming</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Limited Vault Allocations</a></li>
          </ul>
        </div>

        {/* Column 2: Studio Services */}
        <div className="space-y-3">
          <h4 className="font-mono font-bold text-[11px] uppercase tracking-widest text-slate-200">
            Concierge & Support
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Order Tracking & Telemetry</a></li>
            <li><a href="#" className="hover:text-white transition-colors">30-Day Studio Trial</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Acoustic Room Tuning Guide</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Enterprise Procurement</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Factory Recalibration</a></li>
          </ul>
        </div>

        {/* Column 3: Trust & Policies */}
        <div className="space-y-3">
          <h4 className="font-mono font-bold text-[11px] uppercase tracking-widest text-slate-200">
            Trust & Policies
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="flex items-center gap-1.5 text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure, Encrypted Checkout</span>
              </span>
            </li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Warranty Information</a></li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal & Protocols Bar */}
      <div className="border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} NEXUS ATELIER INC. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>TLS 1.3 // AES-256</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>GLOBAL CDN ACTIVE</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
