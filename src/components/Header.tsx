import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  Sparkles,
  MapPin,
  HelpCircle,
  ShieldCheck,
  Zap,
  Headphones,
  Laptop,
  Smartphone,
  Home,
  Watch,
  Gamepad2,
  Tag,
  Store,
  Layers,
  Globe,
  SlidersHorizontal,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { Category } from '../types/index.ts';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSidebar: () => void;
  onOpenAuthModal: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenSidebar,
  onOpenAuthModal,
  onOpenOrders,
  onOpenAdmin,
}) => {
  const { user, logout } = useAuth();
  const { totalItemsCount, openCart, subtotal } = useCart();
  const { wishlist, openWishlist } = useWishlist();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('New York, NY 10001');
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(deliveryLocation);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLocation.trim()) {
      setDeliveryLocation(tempLocation.trim());
      setIsChangingLocation(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'audio':
        return <Headphones className="w-4 h-4" />;
      case 'computing':
        return <Laptop className="w-4 h-4" />;
      case 'smart-home':
        return <Home className="w-4 h-4" />;
      case 'wearables':
        return <Watch className="w-4 h-4" />;
      case 'gaming':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all font-sans text-slate-800">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Brand Logo & Sidebar Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSidebar}
              id="sidebar-toggle-btn"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center gap-2 cursor-pointer font-bold text-xs border border-slate-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-slate-800" />
              <span className="hidden sm:inline">Menu</span>
            </button>

            <button
              onClick={() => onSelectCategory('all')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              id="brand-logo-btn"
            >
              {/* Geometric Monogram */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-900 text-white flex items-center justify-center font-black tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-sm font-mono text-blue-400">N</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 font-sans">
                    NEXUS<span className="text-blue-600">.</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                    ATELIER
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block -mt-0.5">
                  Electronics & Precision Hardware
                </span>
              </div>
            </button>
          </div>

          {/* Location Delivery Selector Pill */}
          <button
            onClick={() => setIsChangingLocation(true)}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left group cursor-pointer"
            title="Change Delivery Location"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Deliver To</span>
              <span className="font-bold text-slate-800 max-w-[130px] truncate block leading-tight">
                {deliveryLocation}
              </span>
            </div>
          </button>

          {/* Center Search Input */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-4">
            <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/30 focus-within:border-blue-600 rounded-xl border border-slate-200 transition-all">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-4 h-4" />
              </div>

              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search headphones, laptops, smart home, wearables, accessories..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 mr-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Department Dropdown Selector */}
              <div className="hidden md:flex items-center pr-1.5">
                <select
                  value={selectedCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                  className="bg-white text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="all">All Departments</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Wishlist Pill */}
            <button
              onClick={openWishlist}
              id="wishlist-btn"
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              title="Saved Items"
            >
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-700" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-700">Wishlist</span>
            </button>

            {/* Cart Button with Subtotal Pill */}
            <button
              onClick={openCart}
              id="cart-header-btn"
              className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 group-hover:bg-amber-400 group-hover:text-slate-950 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-950 transition-colors">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400 group-hover:text-blue-100 uppercase tracking-wider font-mono">
                  Cart
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="user-menu-btn"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  id="login-btn-header"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {/* Account Dropdown */}
              {userDropdownOpen && user && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800 uppercase">
                        {user.role}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>Purchase History & Tracking</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openWishlist();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>Saved Hardware ({wishlist.length})</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Store Administration</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Curated Department Strip (Modern Pill Navigation) */}
      <div className="border-t border-slate-200/70 bg-slate-50/50 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2 sm:gap-4 min-w-max">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* All Products */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Products</span>
            </button>

            {/* Department categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-slate-500'}>
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pincode & Destination Modal */}
      {isChangingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Delivery Destination</h3>
                  <p className="text-[11px] text-slate-500">Set your delivery destination</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingLocation(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLocationSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City, Region or Postal Code
                </label>
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA 94107 or London, UK"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingLocation(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
