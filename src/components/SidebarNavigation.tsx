import React, { useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  Package,
  User,
  LogOut,
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Laptop,
  Home,
  Watch,
  Gamepad2,
  Smartphone,
  ChevronRight,
  Lock,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  ExternalLink,
  Layers,
  PhoneCall,
  Mail,
} from 'lucide-react';
import { Category } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenDeals: () => void;
  onOpenAuthModal: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenDeals,
  onOpenAuthModal,
  onOpenOrders,
  onOpenAdmin,
}) => {
  const { user, logout } = useAuth();
  const { totalItemsCount, subtotal, openCart } = useCart();
  const { wishlist, openWishlist } = useWishlist();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'audio':
        return <Headphones className="w-4 h-4 text-blue-600" />;
      case 'computing':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'smart-home':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'wearables':
        return <Watch className="w-4 h-4 text-purple-600" />;
      case 'gaming':
        return <Gamepad2 className="w-4 h-4 text-rose-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white text-slate-900 shadow-2xl flex flex-col h-full z-10 overflow-hidden transform transition-transform duration-300 ease-out">
        {/* 1. Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black font-mono text-base shadow-sm">
              N
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                NEXUS ATELIER
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Electronics & Hardware
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4 sm:p-5 space-y-6">
          {/* User Account Quick Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 uppercase">
                    {user.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrders();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Customer Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sign in to track orders, manage wishlist, and access support.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer text-center"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Navigation Grid (Cart, Wishlist, Orders) */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Quick Access
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Shopping Cart */}
              <button
                onClick={() => {
                  onClose();
                  openCart();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors text-center cursor-pointer group"
              >
                <div className="relative w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono font-bold text-[9px]">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Cart
                </span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  onClose();
                  openWishlist();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors text-center cursor-pointer group"
              >
                <div className="relative w-8 h-8 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px]">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="block text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Wishlist
                </span>
              </button>

              {/* Order History */}
              <button
                onClick={() => {
                  onClose();
                  if (!user) onOpenAuthModal();
                  else onOpenOrders();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-1">
                  <Package className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Orders
                </span>
              </button>
            </div>
          </div>

          {/* Shop Departments / Categories */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Product Categories
              </h3>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onClose();
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">All Hardware Catalog</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {categories.map((category) => {
                const isSelected = selectedCategory === category.slug;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onSelectCategory(category.slug);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category.slug)}
                      <span className="text-xs font-medium text-slate-800">
                        {category.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Store Tools & Administration */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Store Management
            </h3>
            <div className="space-y-1">
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-slate-700" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Admin Dashboard
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Product & inventory management
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Footer Contact Information */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>support@nexusatelier.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
