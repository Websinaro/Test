import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Check, Zap } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, onBuyNow }) => {
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow?.(product);
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
      id={`product-card-${product.id}`}
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col justify-between bg-white border border-slate-200 hover:border-slate-900 rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-lg cursor-pointer"
    >
      {/* Top Floating Badges & Wishlist Action */}
      <div className="flex items-center justify-between z-10 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-white uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistToggle}
          id={`wishlist-toggle-${product.id}`}
          aria-label="Toggle Wishlist"
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image Frame */}
      <div className="relative w-full pt-[80%] bg-slate-50 rounded-lg overflow-hidden mb-3.5 border border-slate-100 flex items-center justify-center">
        <img
          src={mainImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Quick View Floating Pill on Hover */}
        <div className="absolute inset-x-0 bottom-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg pointer-events-auto">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            QUICK VIEW
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Brand and Department */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <span className="text-blue-600">{product.brand || 'Nexus'}</span>
            <span>{product.category_slug}</span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mt-1">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-mono font-bold">
              <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ({product.review_count.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Delivery Snippet */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
            <span className="text-slate-400 font-mono">Free Delivery</span>
          </div>

          {/* Actions Row */}
          <div className="mt-2 flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || isAdding}
              id={`add-to-cart-${product.id}`}
              aria-label="Add to cart"
              className={`flex-1 py-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                isAdding
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98]'
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {onBuyNow && (
              <button
                onClick={handleBuyNow}
                disabled={!product.in_stock}
                id={`buy-now-${product.id}`}
                aria-label="Buy now"
                title="Buy Now"
                className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
