export interface User {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone?: string | null;
  role: 'admin' | 'customer';
  avatar_url?: string | null;
  auth_provider?: string;
  created_at?: string;
}

export interface Category {
  id?: number;
  slug: string;
  name: string;
  icon: string;
  description: string;
  image_url: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  stock_quantity: number;
  category_slug: string;
  brand: string;
  images: string[];
  features: string[];
  in_stock: boolean;
  is_featured: boolean;
  badge?: string;
  created_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id?: number;
  user_id?: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_title: string;
  product_image: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  user_email: string;
  user_name: string;
  user_phone?: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_fee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method: string;
  shipping_address: ShippingAddress;
  coupon_code?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  calculatedDiscount: number;
}

export interface DatabaseStatus {
  isConnected: boolean;
  type: 'postgresql' | 'in-memory';
  host?: string;
  database?: string;
  tablesReady: boolean;
  productCount: number;
  userCount: number;
  orderCount: number;
  message: string;
}
