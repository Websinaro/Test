import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Package,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Order, ShippingAddress } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, subtotal, discountAmount, taxAmount, shippingFee, totalAmount, coupon, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Address form
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('100 Silicon Way, Suite 400');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zipCode, setZipCode] = useState('94107');
  const [country, setCountry] = useState('United States');

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gpay' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(fullName || 'Sarah Connor');

  if (!isOpen) return null;

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !street || !city || !zipCode) {
      setCheckoutError('Please fill in all required shipping address fields.');
      return;
    }
    setCheckoutError(null);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    setIsSubmitting(true);

    const shippingAddress: ShippingAddress = {
      fullName,
      email,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
    };

    const items = cart.map(item => ({
      productId: item.product_id,
      title: item.product.title,
      image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : '',
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    try {
      const res = await api.checkout({
        shippingAddress,
        paymentMethod,
        items,
        couponCode: coupon?.code,
        userEmail: email,
        userName: fullName,
        userPhone: phone,
      });

      setCreatedOrder(res.order);
      setStep('confirmation');
      await clearCart();
      onOrderSuccess(res.order);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#ec4899', '#f59e0b'],
        });
      } catch (e) {
        // confetti fallback
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please verify your payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 pb-4 sm:pb-5 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {step === 'confirmation' ? 'Order Confirmed!' : 'Checkout'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                {step === 'details' && 'Step 1 of 2: Shipping & Contact Information'}
                {step === 'payment' && 'Step 2 of 2: Payment & Final Review'}
                {step === 'confirmation' && 'Your order is confirmed and being prepared'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {checkoutError && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* Step 1: Address Details */}
        {step === 'details' && (
          <form onSubmit={handleDetailsNext} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 018-9942"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Street name, apartment, unit, suite"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 sm:pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Order Total: <strong className="text-blue-600 font-mono text-base ml-1">${totalAmount.toFixed(2)}</strong>
              </div>
              <button
                type="submit"
                id="checkout-next-btn"
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Method */}
        {step === 'payment' && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 sm:p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs font-bold block">Credit Card</span>
                <span className="text-[10px] text-slate-500 font-medium">Visa, MC, Amex</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className={`p-3 sm:p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paymentMethod === 'gpay'
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <span className="text-xs font-bold block">Google Pay</span>
                <span className="text-[10px] text-slate-500 font-medium">1-Click Express</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 sm:p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs font-bold block">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500 font-medium">Pay upon receipt</span>
              </button>
            </div>

            {/* Card Inputs if card selected */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expiration Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Security Code (CVC)
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Order Review List */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Summary ({cart.length} items)
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (6%)</span>
                  <span className="font-mono font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="font-mono text-blue-600 text-base">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Back and Place Order Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={isSubmitting}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ${totalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Order Confirmation */}
        {step === 'confirmation' && createdOrder && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Thank You for Your Order!
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                We have received your order and sent a confirmation receipt to{' '}
                <strong className="text-slate-900">{createdOrder.user_email}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="max-w-md mx-auto p-5 rounded-lg bg-slate-50 border border-slate-200 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans font-medium">Order Number</span>
                <span className="font-bold text-blue-600">{createdOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-medium">Tracking Code</span>
                <span className="text-slate-800 font-semibold">{createdOrder.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-medium">Payment Status</span>
                <span className="text-emerald-700 font-bold uppercase font-sans">Paid & Confirmed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-medium">Estimated Delivery</span>
                <span className="text-slate-800 font-semibold font-sans">
                  {createdOrder.estimated_delivery
                    ? new Date(createdOrder.estimated_delivery).toLocaleDateString()
                    : 'Within 3 Business Days'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                <span className="font-sans">Total Paid</span>
                <span className="text-blue-600">${Number(createdOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
