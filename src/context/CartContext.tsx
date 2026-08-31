import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  coupon: Coupon | null;
  couponError: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  totalItemsCount: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('nexus_guest_cart');
    return local ? JSON.parse(local) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync with backend if user is authenticated
  useEffect(() => {
    async function syncUserCart() {
      if (user) {
        try {
          const res = await api.getCart();
          if (res.cart && res.cart.length > 0) {
            setCart(res.cart);
          } else if (cart.length > 0) {
            // Push guest items to server
            for (const item of cart) {
              await api.addToCart(item.product_id, item.quantity);
            }
            const synced = await api.getCart();
            setCart(synced.cart);
          }
        } catch (err) {
          console.warn('Failed to load user cart:', err);
        }
      }
    }
    syncUserCart();
  }, [user]);

  // Persist guest cart locally
  useEffect(() => {
    if (!user) {
      localStorage.setItem('nexus_guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (user) {
      try {
        const res = await api.addToCart(product.id, quantity);
        setCart(res.cart);
      } catch (err) {
        console.error('Add to cart API failed:', err);
      }
    } else {
      setCart(prev => {
        const existing = prev.find(item => item.product_id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product_id: product.id, quantity, product }];
      });
    }
    setIsCartOpen(true);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    if (user) {
      try {
        const res = await api.updateCartQuantity(productId, quantity);
        setCart(res.cart);
      } catch (err) {
        console.error('Update quantity API failed:', err);
      }
    } else {
      setCart(prev =>
        prev.map(item => (item.product_id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = async (productId: number) => {
    if (user) {
      try {
        const res = await api.removeFromCart(productId);
        setCart(res.cart);
      } catch (err) {
        console.error('Remove from cart API failed:', err);
      }
    } else {
      setCart(prev => prev.filter(item => item.product_id !== productId));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
        setCart([]);
      } catch (err) {
        console.error('Clear cart API failed:', err);
      }
    } else {
      setCart([]);
      localStorage.removeItem('nexus_guest_cart');
    }
    setCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product ? Number(item.product.price) * item.quantity : 0), 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setCoupon(res.coupon);
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotal > 0 ? parseFloat((discountedSubtotal * 0.06).toFixed(2)) : 0;
  const shippingFee = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
  const totalAmount = parseFloat((discountedSubtotal + taxAmount + shippingFee).toFixed(2));
  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        coupon,
        couponError,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount,
        shippingFee,
        totalAmount,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen(prev => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
