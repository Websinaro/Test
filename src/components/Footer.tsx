import React from 'react';
import { ShieldCheck, Lock, ArrowUpRight } from 'lucide-react';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const linkColumns = [
    {
      title: 'Departments',
      links: ['Audio & Sound', 'Workstations', 'Smart Home', 'Wearables', 'Gaming', 'Vault Allocations'],
    },
    {
      title: 'Support',
      links: ['Order Tracking', 'Studio Trial', 'Enterprise Procurement', 'Factory Recalibration'],
    },
    {
      title: 'Policies',
      links: ['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Warranty'],
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-500 border-t border-slate-800 text-xs font-sans">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black font-mono text-xs">
              N
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white font-sans uppercase">
              NEXUS<span className="text-blue-500">.</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
            Precision hardware for people who ship. No fluff, no filler — just verified specs and fast delivery.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>ENCRYPTED CHECKOUT</span>
          </div>
        </div>

        {linkColumns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h4 className="font-mono font-bold text-[10px] uppercase tracking-widest text-slate-300">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="group flex items-center gap-1 text-slate-500 hover:text-white transition-colors text-[11px]"
                  >
                    {link}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-[10px] font-mono text-slate-600 text-center">
          <div>© {new Date().getFullYear()} NEXUS. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>SECURE CHECKOUT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
