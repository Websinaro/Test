import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Check, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface ProductListRowProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductListRow: React.FC<ProductListRowProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [isAdding, setIsAdding] = React.useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      id={`product-list-row-${product.id}`}
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-slate-200/90 hover:border-slate-400/80 rounded-3xl p-4 sm:p-5 transition-all duration-200 hover:shadow-lg cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative w-full md:w-56 h-48 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
        <img
          src={mainImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.discount_percent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-600 text-white uppercase">
              -{product.discount_percent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl transition-all shadow-xs cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200 backdrop-blur-md'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Middle Specs & Description */}
      <div className="flex-1 space-y-2 min-w-0 w-full">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
            {product.brand || 'Nexus Atelier'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {product.category_slug}
          </span>
          {product.is_featured && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              CERTIFIED
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug">
          {product.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Ratings & Warranty */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 text-white font-mono font-bold text-[10px]">
            <Star className="w-3 h-3 fill-current text-amber-400" />
            <span>{product.rating}</span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {product.review_count.toLocaleString()} Verified Reviews
          </span>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2-Year Full Warranty</span>
          </div>
        </div>
      </div>

      {/* Right Price & Actions */}
      <div className="w-full md:w-52 shrink-0 md:border-l md:border-slate-100 md:pl-6 space-y-3 flex flex-col justify-center">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-950 font-mono">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <Truck className="w-3 h-3" /> Free Express Delivery
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAdding}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-blue-600 text-white'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
