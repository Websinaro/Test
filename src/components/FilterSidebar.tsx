import React from 'react';
import { Star, RotateCcw, Check, ChevronDown, Sparkles, Filter, X, ShieldCheck, Tag, SlidersHorizontal } from 'lucide-react';
import { Category, Product } from '../types/index.ts';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  priceRange: number;
  onPriceRangeChange: (price: number) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedDiscount: number;
  onDiscountChange: (discount: number) => void;
  onlyInStock: boolean;
  onOnlyInStockChange: (inStock: boolean) => void;
  onlyAssured: boolean;
  onOnlyAssuredChange: (assured: boolean) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
  availableBrands: string[];
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  selectedBrand,
  onBrandChange,
  selectedDiscount,
  onDiscountChange,
  onlyInStock,
  onOnlyInStockChange,
  onlyAssured,
  onOnlyAssuredChange,
  onResetFilters,
  totalProductsCount,
  availableBrands,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    priceRange < 2000 ||
    selectedRating > 0 ||
    selectedBrand !== '' ||
    selectedDiscount > 0 ||
    onlyInStock ||
    onlyAssured;

  const priceTiers = [
    { label: 'All Tiers', max: 2000 },
    { label: 'Under $100', max: 100 },
    { label: '$100 to $250', max: 250 },
    { label: '$250 to $500', max: 500 },
    { label: '$500 to $1,000', max: 1000 },
    { label: '$1,000+', max: 2000 },
  ];

  return (
    <div className={`bg-white ${isMobileDrawer ? 'p-6' : 'rounded-3xl border border-slate-200/90 p-5 shadow-xs'} space-y-6 text-slate-800`}>
      {/* Header: Title and Clear All */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-mono">
            Filter Products
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              RESET ALL
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Close Filter"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Certified Quality Filter */}
      <div className="pb-4 border-b border-slate-100">
        <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-all">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-950 text-white font-mono font-bold text-[9px] tracking-widest uppercase">
              CERTIFIED
            </span>
            <span className="text-xs font-bold text-slate-900">Certified Hardware Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyAssured}
            onChange={e => onOnlyAssuredChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* 2. Department Categories */}
      <div className="pb-4 border-b border-slate-100 space-y-2.5">
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Categories
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-950 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] font-mono ${selectedCategory === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
              {totalProductsCount}
            </span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Price Range & Tiers */}
      <div className="pb-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Price Range
          </h4>
          <span className="text-xs font-black text-slate-950 font-mono">
            Under ${priceRange}
          </span>
        </div>

        <input
          type="range"
          min="20"
          max="2000"
          step="10"
          value={priceRange}
          onChange={e => onPriceRangeChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {priceTiers.map(tier => (
            <button
              key={tier.label}
              onClick={() => onPriceRangeChange(tier.max)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all text-left truncate cursor-pointer ${
                priceRange === tier.max
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Customer Rating */}
      <div className="pb-4 border-b border-slate-100 space-y-2">
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map(star => (
            <button
              key={star}
              onClick={() => onRatingChange(selectedRating === star ? 0 : star)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                selectedRating === star
                  ? 'bg-amber-50 text-amber-950 border border-amber-300 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-950 text-amber-400 text-[10px] font-mono font-bold">
                  {star} <Star className="w-2.5 h-2.5 fill-current" />
                </span>
                <span>Stars and Above</span>
              </div>
              {selectedRating === star && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Brand Selection */}
      {availableBrands.length > 0 && (
        <div className="pb-4 border-b border-slate-100 space-y-2">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Brand
          </h4>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            <button
              onClick={() => onBrandChange('')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                selectedBrand === ''
                  ? 'bg-slate-950 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Brands</span>
            </button>

            {availableBrands.map(brand => (
              <button
                key={brand}
                onClick={() => onBrandChange(selectedBrand === brand ? '' : brand)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedBrand === brand
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{brand}</span>
                {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Discount */}
      <div className="pb-4 border-b border-slate-100 space-y-2">
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Special Discounts
        </h4>
        <div className="space-y-1">
          {[40, 30, 20, 10].map(disc => (
            <button
              key={disc}
              onClick={() => onDiscountChange(selectedDiscount === disc ? 0 : disc)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                selectedDiscount === disc
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{disc}% off or more</span>
              {selectedDiscount === disc && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Stock Status */}
      <div>
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          Availability
        </h4>
        <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer">
          <span className="text-xs font-bold text-slate-800">In-Stock Only</span>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={e => onOnlyInStockChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Mobile Drawer Done Button */}
      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={onCloseMobileDrawer}
            className="w-full py-3 rounded-2xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};
