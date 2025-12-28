
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

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  reviews: Review[];
  highlights?: string[];
  stock?: number;
  specifications?: { [key: string]: string };
  sellerInfo?: string;
  returnPolicy?: string;
  warranty?: string;
  videoUrl?: string;
  vendorId: string;
  status: ProductStatus;
  rejectionReason?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
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
    userEmail: string;
    shippingAddress: Address;
    paymentMethod: string;
    paymentId?: string;
    statusHistory: StatusHistory[];
    courierName?: string;
    trackingId?: string;
    shippingLabelUrl?: string;
    labelGeneratedAt?: string;
    qrToken?: string;
    qrExpiresAt?: string;
    qrUsedAt?: string;
    scanLogs?: CourierScanLog[];
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
}

export interface AdminCode {
  id: string;
  code: string;
  status: 'unused' | 'used' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  maxUsage: number;
  usageCount: number;
  usedBy: string | null;
  note: string;
}

// Added NotificationSettings interface to resolve import error
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

// Added NotificationLog interface to resolve import error
export interface NotificationLog {
  id: string;
  createdAt: string;
  userId: string;
  orderId: string;
  channel: 'email' | 'sms';
  status: 'sent' | 'failed';
  response: string;
  type: OrderStatus;
  retryCount: number;
}
