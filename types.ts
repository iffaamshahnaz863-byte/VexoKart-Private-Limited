
export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
}

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
  // NEW - Multi-vendor fields
  vendorId: string; // ID of the vendor who owns the product
  status: 'pending_approval' | 'live' | 'rejected' | 'archived';
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

// NEW - Vendor-specific types
export interface KYCDetails {
  pan: string;
  gst: string;
  addressProofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Vendor {
  id: string; // Unique vendor ID
  userId: string; // Email of the user account
  storeName: string;
  storeLogo: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  kycDetails: KYCDetails;
  commissionRate?: number;
  createdAt: string;
  rejectionReason?: string;
}

// NEW - Admin Code type
export interface AdminCode {
  id: string;
  code: string;
  status: 'unused' | 'used' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  maxUsage: number;
  usageCount: number;
  usedBy: string | null; // Will store the vendor's user email
  note: string;
}