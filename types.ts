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

export interface ProductVariantColor {
    name: string;
    image: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  reviews: Review[];
  highlights?: string[];
  stock: number;
  specifications?: { [key: string]: string };
  sellerInfo?: string;
  returnPolicy?: string;
  warranty?: string;
  videoUrl?: string;
  vendorId: string;
  status: ProductStatus;
  rejectionReason?: string;
  approved_at?: string;
  approved_by?: string;
  allow_online: boolean;
  allow_cod: boolean;
  colors?: ProductVariantColor[];
  sizes?: string[];
}

export interface Category {
  id: number;
  name: string;
  image: string;
  status: boolean;
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
    vendorId: string;
    vendor_email?: string;
    color?: string;
    size?: string;
    sku?: string;
    weight?: number; // in grams
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'paid' | 'cod_pending' | 'failed';

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: 'System' | 'User' | 'Vendor' | 'Courier' | 'Admin';
}

export interface CourierScanLog {
    id: string;
    orderId: string;
    statusSet: OrderStatus;
    note?: string;
    scannedAt: string;
    ipAddress?: string;
}

export interface Order {
    id: string;
    date: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: 'Online Payment' | 'Cash on Delivery';
    userId: number;
    userEmail: string;
    shippingAddress: Address;
    paymentId?: string;
    statusHistory: StatusHistory[];
    courierName?: string;
    trackingId?: string;
    label_url?: string;
    qrToken?: string; // Secure token for courier scan page
    totalWeight?: number;
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
  password?: string;
  role: 'user' | 'admin' | 'vendor';
  addresses: Address[];
  wishlist: number[];
  recentlyViewed: number[];
  created_at: string;
  sms_enabled?: boolean;
}

export interface Banner {
  id: number;
  image_url: string;
  title: string;
  status: boolean;
  display_order: number;
  created_at: string;
}

export interface Vendor {
  id: number;
  user_id: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  profile_image: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  rejection_reason?: string;
  store_address?: string;
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
  response: string;
  type: OrderStatus | 'system';
  retryCount: number;
  is_read?: boolean;
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