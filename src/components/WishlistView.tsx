import React from 'react';
import { Heart, ShoppingBag, Trash2, X, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types/index.ts';

interface WishlistViewProps {
  onQuickView: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ onQuickView }) => {
  const { wishlist, isWishlistOpen, closeWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = async (product: Product) => {
    await addToCart(product, 1);
    await toggleWishlist(product);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 sm:pb-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Saved Items ({wishlist.length})
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                Items you bookmarked for later
              </p>
            </div>
          </div>

          <button
            onClick={closeWishlist}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {wishlist.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your wishlist is currently empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click the heart icon on any product to save it here for later.
              </p>
              <button
                onClick={closeWishlist}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {wishlist.map(product => {
                const image = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-lg bg-white border border-slate-200 flex flex-col justify-between group hover:border-blue-500/50 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="relative pt-[70%] rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={image}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 shadow-xs text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {product.brand || 'Nexus'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {product.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-mono font-bold text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                      <button
                        onClick={() => onQuickView(product)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

