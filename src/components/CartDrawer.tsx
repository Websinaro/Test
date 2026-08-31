import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    couponError,
    subtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    totalAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const target = codeToApply || couponInput;
    if (!target.trim()) return;
    setIsApplying(true);
    const success = await applyCoupon(target.trim());
    setIsApplying(false);
    if (success) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={closeCart} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          className="w-screen max-w-full sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between h-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Review your selected items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  id="clear-cart-btn"
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors p-1 cursor-pointer"
                  title="Clear Cart"
                >
                  Clear
                </button>
              )}
              <button
                onClick={closeCart}
                id="close-cart-btn"
                aria-label="Close cart"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-500 mb-4 border border-blue-100">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your cart is currently empty</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our selection of premium tech, audio, and smart gear to get started.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(item => {
                const product = item.product;
                if (!product) return null;
                const image = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={item.product_id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5 items-center hover:border-slate-300 transition-all"
                  >
                    <img
                      src={image}
                      alt={product.title}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          aria-label="Remove item"
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-blue-600 uppercase tracking-wider font-bold">
                        {product.brand || 'Nexus'}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ${(Number(product.price) * item.quantity).toFixed(2)}
                        </span>

                        {/* Quantity Buttons */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/90 space-y-4">
              {/* Promo Coupon Input */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="coupon-input"
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code (e.g. WELCOME20)"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={isApplying || !couponInput.trim()}
                    id="apply-coupon-btn"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    {isApplying ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {/* Quick Coupon Chips */}
                {!coupon && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-slate-500 py-0.5 font-medium">Quick Codes:</span>
                    {['WELCOME20', 'SAVE10', 'PROMO50'].map(code => (
                      <button
                        key={code}
                        onClick={() => handleApplyCoupon(code)}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-mono font-bold transition-colors cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}

                {/* Applied Coupon Pill */}
                {coupon && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Coupon <strong className="font-mono">{coupon.code}</strong> applied (-${discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (6%)</span>
                  <span className="font-mono font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE (Over $100)</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-base text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                id="proceed-checkout-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
