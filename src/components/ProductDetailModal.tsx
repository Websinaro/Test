import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Send,
  Plus,
  Minus,
  MessageSquare,
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenAuth,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setActiveTab('overview');
      setReviewSuccessMsg(null);
      loadReviews(product.id);
    }
  }, [product]);

  const loadReviews = async (productId: number) => {
    setIsLoadingReviews(true);
    try {
      const res = await api.getProductReviews(productId);
      setReviews(res.reviews || []);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'];

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, quantity);
    setTimeout(() => setIsAdding(false), 900);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.addReview({
        productId: product.id,
        rating: newRating,
        title: newReviewTitle,
        comment: newReviewComment,
      });
      setReviews(prev => [res.review, ...prev]);
      setReviewSuccessMsg('Thank you! Your verified review has been published.');
      setNewReviewTitle('');
      setNewReviewComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-detail-modal-btn"
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
          {/* Left Gallery */}
          <div className="p-4 sm:p-6 bg-slate-50/70 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div>
              {/* Main Image */}
              <div className="relative w-full pt-[75%] sm:pt-[80%] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnail selector */}
              {images.length > 1 && (
                <div className="mt-3 sm:mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Fast Shipping</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">Free over $100</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">2-Yr Warranty</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">Full Coverage</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span className="font-semibold text-slate-800">30-Day Return</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">Hassle-Free</span>
              </div>
            </div>
          </div>

          {/* Right Content & Actions */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-blue-600 uppercase tracking-wider">
                  {product.brand || 'Nexus'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 capitalize">{product.category_slug}</span>
              </div>

              {/* Title */}
              <h1 className="mt-1 text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                {product.title}
              </h1>

              {/* Rating & Stock */}
              <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-slate-900">{product.rating}</span>
                </div>
                <span className="text-xs text-slate-500">
                  ({reviews.length || product.review_count} Reviews)
                </span>
                <span className="text-slate-200 hidden sm:inline">|</span>
                {product.in_stock ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity} units)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-600">Out of Stock</span>
                )}
              </div>

              {/* Price & Savings */}
              <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.original_price > product.price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                        ${Number(product.original_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.discount_percent > 0 && (
                    <p className="text-[11px] sm:text-xs text-emerald-600 font-bold mt-0.5">
                      Save ${(Number(product.original_price) - Number(product.price)).toFixed(2)} ({product.discount_percent}% off)
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  <span className="block text-slate-700">Taxes calculated at checkout</span>
                  <span className="text-blue-600">Instant Shipping Available</span>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="mt-5 border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 transition-colors relative cursor-pointer ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Overview & Specs
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 transition-colors relative cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Customer Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4 text-xs text-slate-600 space-y-3">
                {activeTab === 'overview' && (
                  <>
                    <p className="leading-relaxed text-slate-700">{product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Key Highlights:
                        </h4>
                        <ul className="space-y-1.5">
                          {product.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Add Review Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          Write a Review
                        </h4>
                        {/* Rating Star selector */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-amber-500 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {reviewSuccessMsg && (
                        <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                          {reviewSuccessMsg}
                        </div>
                      )}

                      {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-2">
                          <input
                            type="text"
                            placeholder="Headline (e.g. Exceptional sound and comfort)"
                            value={newReviewTitle}
                            onChange={e => setNewReviewTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          />
                          <textarea
                            rows={2}
                            required
                            placeholder="Share your detailed feedback on quality, performance, and durability..."
                            value={newReviewComment}
                            onChange={e => setNewReviewComment(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-[11px] text-slate-500">
                            Please sign in to leave a verified customer review.
                          </p>
                          <button
                            onClick={onOpenAuth}
                            className="mt-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Sign In
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No reviews yet. Be the first to share your thoughts!</p>
                      ) : (
                        reviews.map(rev => (
                          <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{rev.user_name}</span>
                              <div className="flex items-center text-amber-500 text-xs">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                            {rev.title && <p className="font-semibold text-slate-800 mt-1">{rev.title}</p>}
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{rev.comment}</p>
                            <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                              Verified Purchase • {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-mono font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-slate-100 text-slate-600 hover:text-rose-500 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Add to Cart Button */}
              <button
                type="button"
                id="modal-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAdding}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  isAdding
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/25'
                }`}
              >
                {isAdding ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ${(Number(product.price) * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

