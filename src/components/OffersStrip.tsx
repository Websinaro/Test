import React from 'react';
import { Award, Truck, RotateCcw, Lock } from 'lucide-react';

export const OffersStrip: React.FC = () => {
  const pillars = [
    {
      icon: <Award className="w-4 h-4 text-blue-600" />,
      title: 'Certified Quality Hardware',
      subtitle: 'Original manufacturer warranty',
      badge: 'VERIFIED',
      bgColor: 'bg-blue-50/50 hover:bg-blue-50/80',
      borderColor: 'border-blue-100/80',
    },
    {
      icon: <Truck className="w-4 h-4 text-emerald-600" />,
      title: 'Free Express Shipping',
      subtitle: 'Complimentary on orders over $150',
      badge: 'FAST',
      bgColor: 'bg-emerald-50/50 hover:bg-emerald-50/80',
      borderColor: 'border-emerald-100/80',
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-purple-600" />,
      title: '30-Day Easy Returns',
      subtitle: 'Hassle-free money-back guarantee',
      badge: 'RISK-FREE',
      bgColor: 'bg-purple-50/50 hover:bg-purple-50/80',
      borderColor: 'border-purple-100/80',
    },
    {
      icon: <Lock className="w-4 h-4 text-amber-600" />,
      title: 'Secure Checkout',
      subtitle: '256-bit encrypted data protection',
      badge: 'ENCRYPTED',
      bgColor: 'bg-amber-50/50 hover:bg-amber-50/80',
      borderColor: 'border-amber-100/80',
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-8 shadow-xs overflow-x-auto scrollbar-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-[580px] lg:min-w-0">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className={`group relative flex items-center gap-3 p-3 rounded-xl ${pillar.bgColor} border ${pillar.borderColor} transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5`}
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 group-hover:scale-105 transition-transform">
              {pillar.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {pillar.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {pillar.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
