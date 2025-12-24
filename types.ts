
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
  features?: string[];
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

export interface Order {
    id: string;
    date: string;
    items: OrderItem[];
    total: number;
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
}
