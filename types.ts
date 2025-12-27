
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
  name: string;
  email: string;
  role: 'USER' | 'VENDOR' | 'SUPER_ADMIN';
  addresses: Address[];
  wishlist: number[];
  recentlyViewed: number[];
}

export interface KYCDetails {
  pan: string;
  gst: string;
  addressProofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  storeLogo: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  kycDetails: KYCDetails;
  commissionRate?: number;
  createdAt: string;
  rejectionReason?: string;
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

export interface Banner {
  id: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  orderId: string;
  channel: 'email' | 'sms';
  status: 'sent' | 'failed';
  response: string;
  createdAt: string;
  type: OrderStatus;
  retryCount?: number;
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
