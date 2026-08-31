import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Printer,
  X,
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OrdersViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
      if (res.orders && res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err) {
      console.warn('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      default: return 2;
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 sm:pb-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Order History & Tracking
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                Track status and review order receipts
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No orders yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you make a purchase, your order tracking details and receipt will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Orders List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Past Orders ({orders.length})
                </h3>
                <div className="space-y-2 max-h-[300px] lg:max-h-[500px] overflow-y-auto pr-1">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-3.5 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedOrder?.id === order.id
                          ? 'bg-blue-50/80 border-blue-600 text-slate-900 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-blue-600 font-mono">{order.order_number}</span>
                        <span className="text-slate-900 font-mono">${Number(order.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Order Details & Tracking */}
              {selectedOrder && (
                <div className="lg:col-span-2 space-y-4 sm:space-y-5 bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200">
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600 block">
                        Order #{selectedOrder.order_number}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={printInvoice}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Shipment Status (Tracking: {selectedOrder.tracking_number})
                    </h4>
                    <div className="overflow-x-auto pb-2">
                      <div className="relative flex items-center justify-between min-w-[320px] px-2 py-1">
                        {/* Line */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-4 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all"
                          style={{ width: `${((getStatusStep(selectedOrder.status) - 1) / 4) * 90}%` }}
                        />

                        {['Ordered', 'Confirmed', 'Processing', 'In Transit', 'Delivered'].map((stepName, i) => {
                          const stepNum = i + 1;
                          const isDone = stepNum <= getStatusStep(selectedOrder.status);
                          const isCurrent = stepNum === getStatusStep(selectedOrder.status);

                          return (
                            <div key={stepName} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-white text-slate-400 border border-slate-300'
                                } ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                              </div>
                              <span className="text-[10px] mt-1 font-semibold text-slate-600 whitespace-nowrap">
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Itemized Products */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Purchased Items ({selectedOrder.items?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                              alt={item.product_title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 truncate max-w-xs">{item.product_title}</p>
                              <span className="text-[11px] text-slate-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900">
                            ${Number(item.total_price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Shipping Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium">
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Shipping Destination</h5>
                      <p className="text-slate-800 font-medium">{selectedOrder.shipping_address?.fullName}</p>
                      <p>{selectedOrder.shipping_address?.street}</p>
                      <p>
                        {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}{' '}
                        {selectedOrder.shipping_address?.zipCode}
                      </p>
                      <p>{selectedOrder.shipping_address?.country}</p>
                    </div>

                    <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-900 font-mono font-semibold">${Number(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      {Number(selectedOrder.discount_amount) > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Coupon Discount</span>
                          <span className="font-mono">-${Number(selectedOrder.discount_amount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="text-slate-900 font-mono font-semibold">${Number(selectedOrder.tax_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-slate-900 font-mono font-semibold">${Number(selectedOrder.shipping_fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>Total Paid</span>
                        <span className="text-blue-600 font-mono font-bold">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

