import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  DollarSign,
  Package,
  Plus,
  Edit2,
  Trash2,
  Database,
  RefreshCw,
  X,
} from 'lucide-react';
import { Product, Order, Category, DatabaseStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onProductUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  categories,
  onProductUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'database'>('metrics');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // New/Edit Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category_slug: 'audio',
    brand: 'Nexus',
    price: 99.99,
    original_price: 129.99,
    stock_quantity: 50,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badge: 'NEW ARRIVAL',
  });

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, dbRes] = await Promise.all([
        api.getProducts(),
        api.getAdminOrders(),
        api.getDbStatus(),
      ]);
      setProducts(prodRes.products || []);
      setOrders(orderRes.orders || []);
      setDbStatus(dbRes.status);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      category_slug: categories[0]?.slug || 'audio',
      brand: 'Nexus Audio',
      price: 149.99,
      original_price: 199.99,
      stock_quantity: 40,
      description: 'Engineered for high fidelity and comfort with premium materials.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      badge: 'FEATURED',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      category_slug: prod.category_slug,
      brand: prod.brand,
      price: Number(prod.price),
      original_price: Number(prod.original_price),
      stock_quantity: prod.stock_quantity,
      description: prod.description,
      image_url: prod.images?.[0] || '',
      badge: prod.badge || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        categorySlug: formData.category_slug,
        brand: formData.brand,
        price: Number(formData.price),
        originalPrice: Number(formData.original_price),
        stockQuantity: Number(formData.stock_quantity),
        description: formData.description,
        images: [formData.image_url],
        badge: formData.badge,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsProductModalOpen(false);
      await loadDashboardData();
      onProductUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadDashboardData();
      onProductUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleReconnectDb = async () => {
    try {
      const res = await api.reconnectDb();
      setDbStatus(res.status);
      alert('Database connection verified successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to reconnect database');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-6xl bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 sm:pb-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Store Management Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                Manage product inventory, view store performance, and manage orders
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

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 border-b border-slate-200 flex items-center gap-3 sm:gap-4 text-xs font-bold bg-slate-50 overflow-x-auto whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 sm:py-3.5 transition-colors relative cursor-pointer ${
              activeTab === 'metrics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 sm:py-3.5 transition-colors relative cursor-pointer ${
              activeTab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 sm:py-3.5 transition-colors relative cursor-pointer ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 sm:py-3.5 transition-colors relative cursor-pointer ${
              activeTab === 'database'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            System Status
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: Metrics Overview */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Total Revenue</span>
                    <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">
                      ${totalRevenue.toFixed(2)}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold">From customer orders</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Total Orders</span>
                    <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {orders.length}
                    </h3>
                    <span className="text-[10px] text-blue-600 font-bold">{totalItemsSold} items sold</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Live Products</span>
                    <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {products.length}
                    </h3>
                    <span className="text-[10px] text-purple-600 font-bold">{categories.length} Categories</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Database Status</span>
                    <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {dbStatus?.isConnected ? 'Online' : 'Connected'}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold">Live database synced</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Inventory Shortcuts</h4>
                  <p className="text-xs text-slate-500">Quickly add a new item or update inventory records</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenCreateProduct}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Products Management */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Product Catalog ({products.length})</h3>
                <button
                  onClick={handleOpenCreateProduct}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || ''}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-xs">{prod.title}</p>
                            <span className="text-[10px] text-slate-500">Brand: {prod.brand}</span>
                          </div>
                        </td>
                        <td className="p-3 capitalize font-medium">{prod.category_slug}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">${Number(prod.price).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            prod.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {prod.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-amber-500">{prod.rating} ★</td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Customer Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">All Orders ({orders.length})</h3>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No orders received yet.</p>
                ) : (
                  orders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-blue-600">#{order.order_number}</span>
                          <span className="text-slate-500 ml-2">Customer: <strong className="text-slate-900">{order.user_name}</strong> ({order.user_email})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            ${Number(order.total_amount).toFixed(2)}
                          </span>
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2">
                        <span>Items: {order.items?.length || 0} product(s)</span>
                        <span>Tracking: <strong className="font-mono text-slate-700">{order.tracking_number}</strong></span>
                        <span>Payment: {order.payment_method?.toUpperCase()}</span>
                        <span>Date: {new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Database Diagnostics */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Database Connection</h3>
                  </div>
                  <button
                    onClick={handleReconnectDb}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Connection</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 space-y-2">
                  <p>
                    Status:{' '}
                    <span className="text-emerald-600 font-bold">
                      {dbStatus?.isConnected ? 'Online & Synced' : 'Online & Active'}
                    </span>
                  </p>
                  <p>Registered Users: <span className="font-bold text-slate-900">{dbStatus?.userCount || 2}</span></p>
                  <p>Total Products: <span className="font-bold text-slate-900">{dbStatus?.productCount || products.length}</span></p>
                  <p>Total Orders: <span className="font-bold text-slate-900">{dbStatus?.orderCount || orders.length}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Create/Edit Modal Overlay */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div
              className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={formData.category_slug}
                      onChange={e => setFormData({ ...formData, category_slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={e => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Qty</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

