
export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  order_id: number;
  rating: number;
  review_text?: string;
  images: string[];
  video_url?: string;
  is_verified: boolean;
  created_at: string;
  vendor_reply?: string;
  user?: {
    name: string;
  };
}

export type ProductStatus = 'approved' | 'disabled' | 'archived' | 'live' | 'pending' | 'rejected';

export interface ProductVariant {
    type: 'color' | 'size' | 'custom';
    name: string;
    value: string;
    image?: string;
}

export interface Product {
  id: number;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  images: string[];
  category_id: number;
  category?: string;
  status: ProductStatus;
  product_type: 'normal' | 'daily_needs'; 
  is_cod_enabled: boolean; 
  is_online_enabled: boolean; 
  is_returnable: boolean;
  express_delivery_enabled: boolean;
  weight_info?: string;
  stock: number;
  highlights?: string[];
  rating: number;
  review_count: number;
  reviews: Review[];
  created_at: string;
  variants?: ProductVariant[];
  upi_price: number;
  upi_discount: number;
  service_pincodes?: string[];
}

export interface ServiceArea {
  id: number;
  country: string;
  state: string;
  city: string;
  area_name: string;
  pincode: string;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  delivery_type?: 'standard' | 'express';
}

export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    vendor_id: string;
    vendor_name?: string;
    color?: string;
    size?: string;
    delivery_type?: 'standard' | 'express';
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'paid' | 'cod_pending' | 'failed';

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: 'System' | 'User' | 'Vendor' | 'Courier' | 'Admin' | 'Shiprocket';
}

export interface Order {
    id: string;
    user_id: string;
    vendor_id?: string;
    items: OrderItem[];
    total: number; 
    total_amount: number; 
    discount_amount?: number;
    payment_mode: 'Online Payment' | 'Cash on Delivery';
    payment_status: PaymentStatus;
    shippingAddress: Address; 
    shipping_address?: Address;
    status: OrderStatus;
    status_history: StatusHistory[]; 
    created_at: string;
    cancellation_reason?: string;
    qr_token?: string;
    awb_code?: string;
    tracking_id?: string;
    courier_name?: string;
    seller_name?: string;
}

export interface Address {
    id: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

export interface User {
  id: string;
  auth_id?: string; // New: For linking to auth.users if primary ID is different
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'vendor' | 'admin';
  addresses: Address[];
  wishlist: number[];
  recentlyViewed: number[];
  created_at: string;
  sms_enabled?: boolean;
  has_seen_onboarding?: boolean; // New: Track onboarding status
}

export interface Vendor {
  id: number;
  user_id: string;
  store_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  owner_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  created_at?: string;
  rejection_reason?: string;
  wallet_balance?: number;
  store_address?: string;
  pending_balance?: number;
}

export interface AdminCode {
  id: string;
  code: string;
  status: 'unused' | 'used' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  note: string;
  maxUsage: number;
  usageCount: number;
  usedBy?: string;
}

export interface Banner {
  id: number;
  image_url: string;
  title: string;
  status: boolean;
  display_order: number;
  created_at: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  smtpHost: string;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  smsApiKey: string;
  smsSenderId: string;
  smsTemplateId: string;
  testMode: boolean;
}

export interface NotificationLog {
  id: number;
  createdAt: string;
  channel: 'email' | 'sms';
  orderId: string;
  status: 'sent' | 'failed';
  response: string;
}

export interface AppNotification {
  id: number;
  user_id?: string;
  vendor_id?: number;
  role: 'user' | 'vendor' | 'admin';
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
