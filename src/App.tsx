import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { WishlistProvider, useWishlist } from './context/WishlistContext.tsx';
import { Category, Product, Order } from './types/index.ts';
import { api } from './services/api.ts';

// Components
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { OffersStrip } from './components/OffersStrip.tsx';
import { FilterSidebar } from './components/FilterSidebar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductListRow } from './components/ProductListRow.tsx';
import { SidebarNavigation } from './components/SidebarNavigation.tsx';
import { AmbientBackground } from './components/AmbientBackground.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { WishlistView } from './components/WishlistView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Footer } from './components/Footer.tsx';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Package,
  ArrowUpDown,
  Filter,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function MainStoreContent() {
  const { user } = useAuth();
  const { openCart, addToCart } = useCart();
  const { openWishlist } = useWishlist();

  // Catalog Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyAssured, setOnlyAssured] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<number>(2000);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Modals & Drawers States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Load initial store data
  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(catRes.categories || []);
      setProducts(prodRes.products || []);
    } catch (err) {
      console.warn('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Collect unique brands for filter
  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean))
  );

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popularity');
    setOnlyInStock(false);
    setOnlyAssured(false);
    setPriceRange(2000);
    setSelectedRating(0);
    setSelectedBrand('');
    setSelectedDiscount(0);
  };

  // Filter products client-side
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category_slug !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchBrand = (product.brand || '').toLowerCase().includes(q);
        const matchDesc = (product.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchDesc) return false;
      }
      // In stock filter
      if (onlyInStock && !product.in_stock) {
        return false;
      }
      // Assured / Studio Certified filter
      if (onlyAssured && !product.is_featured) {
        return false;
      }
      // Price range
      if (Number(product.price) > priceRange) {
        return false;
      }
      // Rating filter
      if (selectedRating > 0 && Number(product.rating) < selectedRating) {
        return false;
      }
      // Brand filter
      if (selectedBrand && product.brand !== selectedBrand) {
        return false;
      }
      // Discount filter
      if (selectedDiscount > 0 && Number(product.discount_percent) < selectedDiscount) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
      if (sortBy === 'discount') return Number(b.discount_percent) - Number(a.discount_percent);
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      return Number(b.review_count) - Number(a.review_count); // Default popularity
    });

  const handleOrderSuccess = (order: Order) => {
    api.getProducts().then((res) => setProducts(res.products || []));
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="relative min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Grid & Ambient Particles */}
      <AmbientBackground mode="grid-particles" />

      {/* 1. Main Precision Header */}
      <div className="relative z-10">
        <Header
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenOrders={() => {
            if (!user) setIsAuthModalOpen(true);
            else setIsOrdersOpen(true);
          }}
          onOpenAdmin={() => {
            if (!user || user.role !== 'admin') setIsAuthModalOpen(true);
            else setIsAdminOpen(true);
          }}
        />
      </div>

      {/* 2. Main Storefront Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* Showcase Banner & Offers (shown on main landing view) */}
        {selectedCategory === 'all' && !searchQuery && (
          <>
            <HeroBanner
              categories={categories}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            <OffersStrip />
          </>
        )}

        {/* Minimal Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4 px-1">
          <button
            onClick={() => handleResetFilters()}
            className="hover:text-blue-600 transition-colors cursor-pointer font-bold uppercase"
          >
            ATELIER
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-bold uppercase">
            {selectedCategory === 'all' ? 'All Hardware' : currentCategoryObj?.name || selectedCategory}
          </span>
          {searchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-blue-600 font-bold">"{searchQuery}"</span>
            </>
          )}
        </div>

        {/* 3. Modern Faceted Layout (Faceted Sidebar + Catalog Grid) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar (Desktop Filters) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              priceRange={priceRange}
              onPriceRangeChange={(val) => setPriceRange(val)}
              selectedRating={selectedRating}
              onRatingChange={(val) => setSelectedRating(val)}
              selectedBrand={selectedBrand}
              onBrandChange={(val) => setSelectedBrand(val)}
              selectedDiscount={selectedDiscount}
              onDiscountChange={(val) => setSelectedDiscount(val)}
              onlyInStock={onlyInStock}
              onOnlyInStockChange={(val) => setOnlyInStock(val)}
              onlyAssured={onlyAssured}
              onOnlyAssuredChange={(val) => setOnlyAssured(val)}
              onResetFilters={handleResetFilters}
              totalProductsCount={products.length}
              availableBrands={availableBrands}
            />
          </aside>

          {/* Right Product Grid & Sorting Toolbar */}
          <section className="flex-1 w-full space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Result Count */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    RESULTS:
                  </span>
                  <span className="text-sm font-black text-slate-950 font-mono">
                    {filteredProducts.length} Units
                  </span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {currentCategoryObj?.name || selectedCategory}
                    </span>
                  )}
                </div>

                {/* Center / Right: Sort Tabs (Desktop) */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
                  <span className="font-bold text-slate-400 mr-1 text-[11px] uppercase">SORT:</span>
                  {[
                    { id: 'popularity', label: 'Popular' },
                    { id: 'price-low', label: 'Price: Low' },
                    { id: 'price-high', label: 'Price: High' },
                    { id: 'rating', label: 'Rating' },
                    { id: 'discount', label: 'Discount' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSortBy(tab.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                        sortBy === tab.id
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Mobile Filter Button & View Mode Toggles */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filter trigger button */}
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white font-bold text-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter & Refine</span>
                  </button>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid View"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      aria-label="List View"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Bar */}
              {(selectedCategory !== 'all' ||
                searchQuery ||
                priceRange < 2000 ||
                selectedRating > 0 ||
                selectedBrand ||
                selectedDiscount > 0 ||
                onlyInStock ||
                onlyAssured) && (
                <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">ACTIVE FACETS:</span>

                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      Category: {currentCategoryObj?.name || selectedCategory}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-blue-900"
                        onClick={() => setSelectedCategory('all')}
                      />
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      "{searchQuery}"
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                        onClick={() => setSearchQuery('')}
                      />
                    </span>
                  )}

                  {onlyAssured && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 text-white border border-slate-900 font-mono">
                      Certified Hardware
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-slate-300"
                        onClick={() => setOnlyAssured(false)}
                      />
                    </span>
                  )}

                  {priceRange < 2000 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                      Ceiling ${priceRange}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-amber-950"
                        onClick={() => setPriceRange(2000)}
                      />
                    </span>
                  )}

                  {selectedRating > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                      {selectedRating}★+
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-amber-950"
                        onClick={() => setSelectedRating(0)}
                      />
                    </span>
                  )}

                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                      Brand: {selectedBrand}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-purple-900"
                        onClick={() => setSelectedBrand('')}
                      />
                    </span>
                  )}

                  {onlyInStock && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      In-Stock Only
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                        onClick={() => setOnlyInStock(false)}
                      />
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 underline ml-auto cursor-pointer"
                  >
                    RESET ALL
                  </button>
                </div>
              )}
            </div>

            {/* Product Cards Listing */}
            {loading ? (
              <div className="py-24 text-center bg-white rounded-xl border border-slate-200">
                <div className="w-10 h-10 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Loading Atelier Catalog...
                </h3>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-slate-900">No hardware found matching criteria</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing some filter facets or search for another keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(prod) => setSelectedProduct(prod)}
                    onBuyNow={async (prod) => {
                      await addToCart(prod, 1);
                      setIsCheckoutOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ProductListRow
                    key={product.id}
                    product={product}
                    onQuickView={(prod) => setSelectedProduct(prod)}
                    onBuyNow={async (prod) => {
                      await addToCart(prod, 1);
                      setIsCheckoutOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 4. Elevated Dark Footer */}
      <Footer />

      {/* 5. Slide-Out Sidebar Navigation */}
      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
        onOpenDeals={() => {
          setSelectedCategory('all');
          setSortBy('discount');
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenOrders={() => {
          if (!user) setIsAuthModalOpen(true);
          else setIsOrdersOpen(true);
        }}
        onOpenAdmin={() => {
          if (!user || user.role !== 'admin') setIsAuthModalOpen(true);
          else setIsAdminOpen(true);
        }}
      />

      {/* Mobile Filters Bottom Sheet Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs lg:hidden">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl pb-safe">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setIsMobileFilterOpen(false);
              }}
              priceRange={priceRange}
              onPriceRangeChange={(val) => setPriceRange(val)}
              selectedRating={selectedRating}
              onRatingChange={(val) => setSelectedRating(val)}
              selectedBrand={selectedBrand}
              onBrandChange={(val) => setSelectedBrand(val)}
              selectedDiscount={selectedDiscount}
              onDiscountChange={(val) => setSelectedDiscount(val)}
              onlyInStock={onlyInStock}
              onOnlyInStockChange={(val) => setOnlyInStock(val)}
              onlyAssured={onlyAssured}
              onOnlyAssuredChange={(val) => setOnlyAssured(val)}
              onResetFilters={() => {
                handleResetFilters();
                setIsMobileFilterOpen(false);
              }}
              totalProductsCount={products.length}
              availableBrands={availableBrands}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Application Modals and Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onBuyNow={async (product, quantity) => {
          await addToCart(product, quantity);
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrdersView isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />

      <WishlistView onQuickView={(prod) => setSelectedProduct(prod)} />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        onProductUpdated={loadStoreData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainStoreContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
