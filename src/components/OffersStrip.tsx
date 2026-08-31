import React from 'react';
import { Award, Truck, RotateCcw, Lock } from 'lucide-react';

export const OffersStrip: React.FC = () => {
  const pillars = [
    {
      icon: <Award className="w-4 h-4" />,
      title: 'Certified Hardware',
      subtitle: 'Manufacturer warranty',
      stat: '100%',
    },
    {
      icon: <Truck className="w-4 h-4" />,
      title: 'Express Shipping',
      subtitle: 'Free over $150',
      stat: '24H',
    },
    {
      icon: <RotateCcw className="w-4 h-4" />,
      title: 'Easy Returns',
      subtitle: 'No-questions policy',
      stat: '30D',
    },
    {
      icon: <Lock className="w-4 h-4" />,
      title: 'Secure Checkout',
      subtitle: 'Encrypted end-to-end',
      stat: '256B',
    },
  ];

  return (
    <div className="mb-8 rounded-xl border border-slate-800 bg-slate-950 shadow-sm overflow-x-auto scrollbar-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-slate-800 lg:divide-y-0 lg:divide-x min-w-[560px] lg:min-w-0">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className="group flex items-center gap-3 px-4 py-3.5 hover:bg-slate-900/70 transition-colors"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 flex items-center justify-center group-hover:border-blue-500/50 group-hover:text-blue-300 transition-colors">
              {pillar.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-white truncate tracking-tight">
                {pillar.title}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {pillar.subtitle}
              </p>
            </div>
            <span className="font-mono text-[10px] font-bold text-slate-600 group-hover:text-blue-400 shrink-0 transition-colors">
              {pillar.stat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
