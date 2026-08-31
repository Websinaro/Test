import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface WishlistContextType {
  wishlist: Product[];
  isWishlistOpen: boolean;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const local = localStorage.getItem('nexus_guest_wishlist');
    return local ? JSON.parse(local) : [];
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        try {
          const res = await api.getWishlist();
          setWishlist(res.wishlist || []);
        } catch (err) {
          console.warn('Failed to load wishlist:', err);
        }
      }
    }
    loadWishlist();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('nexus_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const isWishlisted = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    if (user) {
      try {
        const res = await api.toggleWishlist(product.id);
        setWishlist(res.wishlist);
      } catch (err) {
        console.error('Wishlist toggle API error:', err);
      }
    } else {
      setWishlist(prev => {
        if (prev.some(p => p.id === product.id)) {
          return prev.filter(p => p.id !== product.id);
        } else {
          return [...prev, product];
        }
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlistOpen,
        isWishlisted,
        toggleWishlist,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        toggleWishlistDrawer: () => setIsWishlistOpen(prev => !prev),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
