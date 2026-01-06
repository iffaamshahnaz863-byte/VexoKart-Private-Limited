
export interface Review {
  id: string;
  author: string;
  userId: string;
  orderId: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  vendorReply?: string;
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
  payment_modes: string[]; // ["online", "cod"]
  variants: ProductVariant[];
  stock: number;
  highlights?: string[];
  specifications?: { [key: string]: string };
  rating: number;
  review_count: number;
  reviews: Review[];
  created_at: string;
  return_policy?: string;
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
    user_id: number;
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

export interface AppNotification {
  id: number;
  user_id?: number | string;
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
  id: number;
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
}

export interface NotificationLog {
  id: string;
  createdAt: string;
  userId: string;
  orderId: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'in-app';
  status: 'sent' | 'failed';
  is_read: boolean;
  response?: string;
  type?: string;
  retryCount?: number;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  testMode: boolean;
  smtpHost: string;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  smsApiKey: string;
  smsSenderId: string;
  smsTemplateId: string;
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
