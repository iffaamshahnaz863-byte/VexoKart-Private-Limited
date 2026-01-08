export interface Review {
  id: number;
  product_id: number;
  user_id: string; // UUID from Supabase Auth
  order_id: number; // Integer ID
  rating: number;
  review_text?: string;
  images: string[]; // text[]
  video_url?: string; // Changed from videos[] to video_url to match DB schema
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
  category?: string; // Virtual field for UI
  status: ProductStatus;
  payment_modes: string[]; // Persistence layer for payment booleans
  product_type: 'simple' | 'variant';
  is_cod_enabled: boolean; // New strict naming
  is_online_enabled: boolean; // New strict naming
  cash_on_delivery?: boolean;
  specifications?: Record<string, string>;
  stock: number;
  highlights?: string[];
  rating: number;
  review_count: number;
  reviews: Review[];
  created_at: string;
  return_policy?: string;
  variants?: ProductVariant[];
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
    sku?: string;
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
    user_id: string; // UUID string
    vendor_id?: string;
    items: OrderItem[];
    total: number; 
    total_amount: number; 
    payment_mode: 'Online Payment' | 'Cash on Delivery';
    payment_status: PaymentStatus;
    shipping_address: Address;
    shippingAddress: Address; 
    status: OrderStatus;
    statusHistory: StatusHistory[];
    status_history: StatusHistory[]; 
    created_at: string;
    
    shipment_id?: string;
    awb_code?: string;
    tracking_id?: string; 
    label_url?: string;
    courier_name?: string;
    tracking_url?: string;
    pickup_scheduled_date?: string;
    
    qr_token?: string;
    qrToken?: string; 
    invoice_url?: string;
    invoice_generated?: boolean;
    seller_name?: string;
}

export interface WalletTransaction {
  id: string;
  vendor_id: string;
  order_id?: string;
  amount: number;
  type: 'credit' | 'debit' | 'withdrawal';
  status: 'pending' | 'settled' | 'withdrawn' | 'failed';
  note?: string;
  created_at: string;
}

export interface Vendor {
  id: number;
  user_id: string;
  store_name: string;
  profile_image: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  email: string;
  phone: string;
  owner_name: string;
  store_address?: string;
  created_at: string;
  rejection_reason?: string;
  wallet_balance?: number;
  pending_balance?: number;
  bank_account?: {
    account_holder: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
  };
  upi_id?: string;
}

export interface AppNotification {
  id: number;
  user_id?: string;
  vendor_id?: number | string;
  role: 'user' | 'vendor' | 'admin';
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
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
  id: string; // Changed to string for UUID
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vendor';
  addresses: Address[];
  wishlist: number[];
  recentlyViewed: number[];
  created_at: string;
  sms_enabled?: boolean;
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
  id: number | string;
  createdAt: string;
  channel: 'email' | 'sms';
  orderId: string;
  status: 'sent' | 'failed';
  response: string;
}