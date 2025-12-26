
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
  // Replaced 'features' with 'highlights' for better clarity
  highlights?: string[];
  // NEW - Advanced Product Details
  stock?: number;
  specifications?: { [key: string]: string };
  sellerInfo?: string;
  returnPolicy?: string;
  warranty?: string;
  videoUrl?: string;
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
  role: 'USER' | 'ADMIN';
  addresses: Address[];
  wishlist: number[];
  // NEW - Recently Viewed Items
  recentlyViewed: number[];
}
