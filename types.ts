

// Fix: Add AdminCode interface
export interface AdminCode {
  id: string;
  code: string;
  status: 'unused' | 'used' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  note?: string;
  maxUsage: number;
  usageCount: number;
  usedBy?: string | null;
}

// Fix: Add Notification types
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
  user_id?: string | number;
  vendor_id?: string | number;
  role: 'user' | 'vendor' | 'admin' | 'customer';
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}


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
  name: string;
  description: string;
  price: number;
  original_price: number;
  images: string[];
  category_id: number;
  category?: string;
  is_active: boolean;
  stock: number;
  highlights?: string[];
  created_at: string;
  
  // Deprecated/Removed Vendor properties
  vendor_id?: string;
  status?: ProductStatus;
  product_type?: 'normal' | 'daily_needs'; 
  is_cod_enabled?: boolean; 
  is_online_enabled?: boolean; 
  is_returnable?: boolean;
  express_delivery_enabled?: boolean;
  weight_info?: string;
  rating?: number;
  review_count?: number;
  reviews?: Review[];
  variants?: ProductVariant[];
  upi_price?: number;
  upi_discount?: number;
  service_pincodes?: string[];
  specifications?: { [key: string]: string };
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
  created_by?: string;
}

export interface Category {
  id: string; // Changed to UUID
  name: string;
  slug: string;
  image_url: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  delivery_type?: 'standard' | 'express';
}

export interface OrderItem {
    id: string; // Changed to UUID
    name: string;
    price: number;
    quantity: number;
    image: string;
    // Fix: Add missing optional properties
    vendor_name?: string;
    vendor_id?: string;
}

// Fix: Change OrderStatus to PascalCase to match usage across the app
export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: string;
    address_snapshot?: any;
}

export interface Order {
    id: string; // Changed to UUID
    user_id: string;
    items: OrderItem[];
    shipping_address: Address;
    full_name: string;
    phone: string;
    email: string;
    subtotal: number;
    shipping: number;
    total: number; 
    payment_method: 'cod';
    payment_status: PaymentStatus;
    status: OrderStatus;
    status_history: StatusHistory[]; 
    created_at: string;
    // Fix: Add missing optional properties from usage in various components
    awb_code?: string;
    tracking_id?: string;
    total_amount?: number;
    seller_name?: string;
    vendor_id?: string;
    cancellation_reason?: string;
    qr_token?: string;
    qrToken?: string;
    payment_mode?: string;
    metadata?: any;
    address?: any;
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
  id: number; // The bigserial primary key from public.users
  auth_uid: string; // The UUID from auth.users
  name: string;
  email: string;
  phone?: string;
  sms_enabled?: boolean;
  // FIX: Added 'vendor' to user roles to fix type errors in NotificationContext and other components.
  role: 'customer' | 'admin' | 'vendor';
  addresses: Address[];
  wishlist: number[];
  recentlyViewed: number[];
  created_at: string;
}

export interface Banner {
  id: number;
  image_url: string;
  title: string;
  status: boolean;
  display_order: number;
  created_at: string;
}
// FIX: Added missing Vendor interface to resolve import errors across multiple files.
export interface Vendor {
  id: number;
  user_id: number;
  store_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  owner_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  created_at: string;
  rejection_reason?: string;
  wallet_balance?: number;
  store_address?: string;
}