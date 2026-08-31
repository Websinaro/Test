import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { Category } from '../types/index.ts';

interface HeroBannerProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroStories = [
    {
      id: 1,
      tag: 'ACOUSTICS',
      title: 'Aura Studio Master ANC Headphones',
      subtitle: 'Custom 50mm beryllium transducers with real-time acoustic calibration and 48-hour lossless audio playback.',
      category: 'audio',
      ctaText: 'Explore Audio',
      highlightBadge: 'Studio Audio',
      price: '$349.00',
      specs: ['50mm Beryllium Drivers', 'Spatial Audio Engine', 'Titanium Frame'],
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      themeColor: 'from-slate-950 via-slate-900 to-indigo-950',
      accentGlow: 'bg-indigo-500/20',
      buttonAccent: 'bg-white hover:bg-slate-100 text-slate-950',
    },
    {
      id: 2,
      tag: 'WORKSTATIONS',
      title: 'Vanguard Pro 16 Modular Workstation',
      subtitle: 'Engineered for generative neural workflows, 8K RAW rendering, and multi-threaded simulation loads.',
      category: 'computing',
      ctaText: 'Explore Workstations',
      highlightBadge: '128GB Unified Memory',
      price: '$2,499.00',
      specs: ['Vapor Chamber Cooling', '120Hz Mini-LED Display', 'Magnesium Chassis'],
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      themeColor: 'from-slate-950 via-zinc-900 to-blue-950',
      accentGlow: 'bg-blue-500/20',
      buttonAccent: 'bg-blue-500 hover:bg-blue-400 text-white',
    },
    {
      id: 3,
      tag: 'WEARABLES',
      title: 'Chronos Titanium Autonomous Watch',
      subtitle: 'Aerospace-grade titanium housing with multi-spectrum PPG biosensors and sapphire crystal display.',
      category: 'wearables',
      ctaText: 'Explore Wearables',
      highlightBadge: 'Titanium Build',
      price: '$499.00',
      specs: ['Grade-5 Titanium', 'Dual-Frequency GPS', '100m Water Resistance'],
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      themeColor: 'from-slate-950 via-stone-900 to-amber-950',
      accentGlow: 'bg-amber-500/20',
      buttonAccent: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroStories.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroStories.length]);

  const slide = heroStories[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 text-white border border-slate-800 shadow-2xl mb-8 group select-none">
      {/* Background Gradient & Animated Dynamic Glow */}
      <div className={`relative bg-gradient-to-br ${slide.themeColor} transition-all duration-700`}>
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${slide.accentGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700 animate-pulse-subtle`} />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Grid overlay inside banner */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[400px]">
          {/* Left Editorial Info with AnimatePresence */}
          <div className="lg:col-span-7 space-y-4 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Tag */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    {slide.tag}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none font-sans">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* Tech Specs Micro-Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {slide.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300 backdrop-blur-xs"
                    >
                      <Check className="w-3 h-3 text-blue-400" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                {/* Price and CTA Button */}
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 backdrop-blur-md">
                    <span className="text-2xl font-black text-white font-mono">
                      {slide.price}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectCategory(slide.category)}
                    className={`px-6 py-3 rounded-xl ${slide.buttonAccent} font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Product Showcase Hero Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-md group/frame"
              >
                {/* Decorative Frame Border */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-xl blur-md opacity-75 group-hover/frame:opacity-100 transition duration-500"></div>

                <div className="relative bg-slate-900/90 rounded-lg p-4 border border-white/15 shadow-2xl backdrop-blur-xl space-y-3">
                  {/* Frame Header */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-mono text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                        {slide.highlightBadge}
                      </span>
                    </div>
                  </div>

                  {/* Main Product Image */}
                  <div className="relative pt-[62%] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover/frame:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Footer view link */}
                  <div className="flex items-center justify-end text-[11px] pt-1">
                    <button
                      onClick={() => onSelectCategory(slide.category)}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Products</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual Slide Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroStories.length) % heroStories.length)}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroStories.length)}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Navigation Pagination */}
      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2">
        {heroStories.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Slide ${index + 1}`}
            className={`tap-target-auto h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === index ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
