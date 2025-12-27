
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product, Review } from '../types';

interface ProductContextType {
  products: Product[];
  getProduct: (id: number) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  toggleProductStatus: (productId: number) => void;
  approveProduct: (productId: number, approvedBy?: string) => void;
  rejectProduct: (productId: number, reason: string) => void;
  disableProduct: (productId: number) => void;
  addReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

const SEED_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Zenith X Pro Titanium",
    category: "Electronics",
    price: 124999,
    originalPrice: 139999,
    rating: 4.9,
    reviewCount: 1240,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80"],
    description: "The ultimate flagship experience. Featuring an aerospace-grade titanium frame and the all-new A17 Pro Bionic chip for unparalleled performance and efficiency.",
    reviews: [],
    highlights: ["Titanium Frame", "A17 Pro Bionic Chip", "48MP Triple Camera", "ProMotion Display"],
    stock: 25,
    specifications: { "Display": "6.7-inch OLED", "Battery": "4422 mAh", "Weight": "221g", "Storage": "256GB / 512GB / 1TB" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 102,
    name: "Nova Buds Gen-3",
    category: "Audio",
    price: 24990,
    originalPrice: 29990,
    rating: 4.7,
    reviewCount: 856,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
    description: "Immerse yourself in pure sound with intelligent active noise cancellation and spatial audio technology that tracks your head movements.",
    reviews: [],
    highlights: ["Active Noise Cancellation", "Spatial Audio", "30H Battery Life", "IPX4 Sweat Resistance"],
    stock: 150,
    specifications: { "Driver": "11mm Dynamic", "Connectivity": "Bluetooth 5.3", "Charging": "USB-C & Wireless", "Sensors": "Skin-detecting sensors" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 103,
    name: "Vortex G-Series 16",
    category: "Computing",
    price: 184500,
    originalPrice: 210000,
    rating: 4.8,
    reviewCount: 320,
    images: ["https://images.unsplash.com/photo-1517336712461-481bf488d086?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"],
    description: "Unleash extreme power with the Vortex G-Series. Equipped with the latest M3 Max processor and a stunning Liquid Retina XDR display for professionals who demand the best.",
    reviews: [],
    highlights: ["M3 Max Processor", "120Hz ProMotion Display", "MagSafe 3 Charging", "Studio-Quality Mics"],
    stock: 12,
    specifications: { "RAM": "32GB Unified", "Storage": "1TB SSD", "Graphics": "40-Core GPU", "Ports": "HDMI, SDXC, MagSafe" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 104,
    name: "Alpha Seven IV Mirrorless",
    category: "Electronics",
    price: 215000,
    originalPrice: 245000,
    rating: 4.9,
    reviewCount: 540,
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"],
    description: "The Alpha Seven IV redefined the standard for full-frame cameras. Combining high-resolution 33MP imaging with professional-grade 4K 60p video capabilities.",
    reviews: [],
    highlights: ["33MP Full-Frame Sensor", "Real-time Eye AF", "4K 60p 10-bit Video", "5-axis Stabilization"],
    stock: 8,
    specifications: { "Sensor": "Exmor R CMOS", "ISO": "100-51200", "LCD": "Tiltable Touchscreen", "Mount": "Sony E-mount" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 105,
    name: "Sonic Master 5 Wireless",
    category: "Audio",
    price: 29900,
    originalPrice: 34990,
    rating: 4.8,
    reviewCount: 2100,
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"],
    description: "Industry-leading noise cancellation. The Sonic Master 5 offers exceptional sound quality and a comfortable lightweight design for all-day listening.",
    reviews: [],
    highlights: ["Auto NC Optimizer", "Speak-to-Chat Technology", "30-Hour Battery", "Multipoint Connection"],
    stock: 45,
    specifications: { "Drivers": "30mm Dynamic", "Weight": "250g", "Charging": "USB-C Quick Charge", "Bluetooth": "LDAC Supported" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 106,
    name: "Nexus Five Pro Console",
    category: "Gaming",
    price: 54990,
    originalPrice: 59990,
    rating: 4.9,
    reviewCount: 4500,
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80"],
    description: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
    reviews: [],
    highlights: ["8K Output Support", "Haptic Feedback", "Ultra-High Speed SSD", "Ray Tracing Support"],
    stock: 0,
    specifications: { "CPU": "AMD Ryzen Zen 2", "GPU": "10.3 TFLOPS", "RAM": "16GB GDDR6", "Storage": "825GB NVMe SSD" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 107,
    name: "Chronos Ultra Smartwatch",
    category: "Accessories",
    price: 89900,
    originalPrice: 94500,
    rating: 4.8,
    reviewCount: 670,
    images: ["https://images.unsplash.com/photo-1544117518-30dd5f2f309d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1434493907317-a46b537794b9?auto=format&fit=crop&w=800&q=80"],
    description: "The most rugged and capable smartwatch ever. Featuring a titanium case, precision dual-frequency GPS, and up to 36 hours of battery life for elite athletes.",
    reviews: [],
    highlights: ["Grade 5 Titanium", "Siren Alarm (86dB)", "Blood Oxygen Monitoring", "ECG Capability"],
    stock: 22,
    specifications: { "Case Size": "49mm", "Water Resistance": "100m", "Display": "Always-On Retina", "Weight": "61.4g" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 108,
    name: "Tactile Q1 Mechanical",
    category: "Computing",
    price: 15990,
    originalPrice: 18990,
    rating: 4.7,
    reviewCount: 410,
    images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1618384881928-bbcd386e927f?auto=format&fit=crop&w=800&q=80"],
    description: "A fully customizable 75% layout mechanical keyboard with a premium CNC aluminum body and hot-swappable switches for the ultimate typing experience.",
    reviews: [],
    highlights: ["CNC Aluminum Body", "Hot-Swappable Switches", "Gasket Mount Design", "South-facing RGB"],
    stock: 30,
    specifications: { "Connectivity": "USB-C / BT 5.1", "Keycaps": "Double-shot PBT", "Weight": "1.8kg", "Layout": "75% ANSI" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 109,
    name: "Urban Nomad Pack",
    category: "Accessories",
    price: 12500,
    originalPrice: 14900,
    rating: 4.6,
    reviewCount: 230,
    images: ["https://images.unsplash.com/photo-1553062407-98eebec4c2a5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"],
    description: "Designed for the daily commute and weekend getaways. The Urban Nomad features a weather-resistant shell and dedicated tech organization for your laptop and gear.",
    reviews: [],
    highlights: ["Weatherproof Shell", "Laptop Sleeve (16\")", "Ergonomic Straps", "Hidden Passport Pocket"],
    stock: 60,
    specifications: { "Capacity": "22 Liters", "Material": "Recycled Nylon", "Warranty": "Lifetime", "Zippers": "YKK AquaGuard" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 110,
    name: "Apex 4K Designer Monitor",
    category: "Computing",
    price: 52900,
    originalPrice: 65000,
    rating: 4.7,
    reviewCount: 150,
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80"],
    description: "Color precision for creative professionals. This 27-inch 4K IPS monitor covers 99% of the sRGB color space and features a minimalist borderless design.",
    reviews: [],
    highlights: ["99% sRGB Accuracy", "USB-C Power Delivery", "HDR10 Support", "Height Adjustable Stand"],
    stock: 15,
    specifications: { "Resolution": "3840 x 2160", "Brightness": "400 nits", "Refresh Rate": "60Hz", "Panel": "IPS" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 111,
    name: "Rockbox II Bluetooth",
    category: "Audio",
    price: 14999,
    originalPrice: 17999,
    rating: 4.8,
    reviewCount: 3400,
    images: ["https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-158912715104d-0428d0590831?auto=format&fit=crop&w=800&q=80"],
    description: "Big sound in a compact frame. The Rockbox II delivers balanced audio with deep bass and is IPX7 waterproof for outdoor adventures.",
    reviews: [],
    highlights: ["360-degree Sound", "IPX7 Waterproof", "20H Playtime", "Wireless Daisy Chain"],
    stock: 85,
    specifications: { "Drivers": "Dual 45mm", "Connectivity": "BT 5.0 / AUX", "Weight": "540g", "Charging": "USB-C" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 112,
    name: "Swift Pro Click Mouse",
    category: "Gaming",
    price: 12900,
    originalPrice: 14500,
    rating: 4.9,
    reviewCount: 1200,
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1527814732934-241ae202720d?auto=format&fit=crop&w=800&q=80"],
    description: "Engineered for speed and precision. Weighing only 63g, the Swift Pro Click features a Hero 2K sensor for lag-free performance during intense gameplay.",
    reviews: [],
    highlights: ["Ultra-lightweight (63g)", "Zero-additive PTFE Feet", "LIGHTSPEED Wireless", "25K DPI Sensor"],
    stock: 110,
    specifications: { "Battery Life": "70 Hours", "Acceleration": "40G", "Report Rate": "1000Hz", "Micro-switches": "Mechanical" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 113,
    name: "Lumina S24 Ultra",
    category: "Electronics",
    price: 129999,
    originalPrice: 144999,
    rating: 4.8,
    reviewCount: 1100,
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"],
    description: "The peak of mobile technology. AI-powered features, a massive 200MP camera, and a built-in stylus make the Lumina S24 Ultra the most versatile phone yet.",
    reviews: [],
    highlights: ["200MP Main Camera", "Built-in AI Stylus", "Galaxy-level Display", "Titanium Exterior"],
    stock: 20,
    specifications: { "Chipset": "Snapdragon 8 Gen 3", "Display": "6.8\" AMOLED 2X", "Battery": "5000 mAh", "Memory": "12GB RAM" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 114,
    name: "Hybrid Switch OLED",
    category: "Gaming",
    price: 32990,
    originalPrice: 38900,
    rating: 4.7,
    reviewCount: 5200,
    images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1627443369408-2045c71a3964?auto=format&fit=crop&w=800&q=80"],
    description: "Play at home on the TV or on-the-go with a vibrant 7-inch OLED screen. The Hybrid Switch offers the best of both worlds for gamers of all ages.",
    reviews: [],
    highlights: ["7-inch OLED Screen", "Wide Adjustable Stand", "Wired LAN Port", "64GB Internal Storage"],
    stock: 50,
    specifications: { "Display": "OLED 720p", "Output": "1080p via HDMI", "Battery": "Up to 9 Hours", "Media": "Physical Cartridges" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 115,
    name: "Nomad Leather Wallet",
    category: "Accessories",
    price: 3500,
    originalPrice: 4900,
    rating: 4.5,
    reviewCount: 380,
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1552590635-27c2c2128b05?auto=format&fit=crop&w=800&q=80"],
    description: "Handcrafted from premium vegetable-tanned leather. This minimalist wallet features RFID protection and holds up to 12 cards with ease.",
    reviews: [],
    highlights: ["Vegetable-Tanned Leather", "RFID Protection", "Quick-access Card Slot", "Patina Finish over time"],
    stock: 120,
    specifications: { "Capacity": "12 Cards + Cash", "Lining": "Microfiber", "Material": "Italian Leather", "Warranty": "3 Years" },
    vendorId: "vexokart_internal",
    status: "approved"
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-products');
      let parsedData = localData ? JSON.parse(localData) : SEED_PRODUCTS;
      
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        parsedData = parsedData.map((p: any) => {
          if (p.features && !p.highlights) p.highlights = p.features;
          if (!p.vendorId) p.vendorId = 'vexokart_internal';
          if (!p.reviews) p.reviews = [];
          if (!p.status) p.status = 'approved';
          return p;
        });
      } else {
          return SEED_PRODUCTS;
      }
      return parsedData;
    } catch (error) {
      return SEED_PRODUCTS;
    }
  });

  const saveProducts = (updatedProducts: Product[]) => {
    localStorage.setItem('vexokart-products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const getProduct = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }

  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { 
      ...productData, 
      id: newId,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      status: 'approved',
      stock: productData.stock || 0,
      highlights: productData.highlights || [],
      specifications: productData.specifications || {},
      sellerInfo: productData.sellerInfo || 'VexoKart Direct',
      returnPolicy: productData.returnPolicy || '30-Day Returns',
      warranty: productData.warranty || '1 Year Manufacturer Warranty',
      videoUrl: productData.videoUrl || '',
    };
    saveProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(updated);
  };

  const deleteProduct = (productId: number) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
  };

  const toggleProductStatus = (productId: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, status: p.status === 'approved' ? 'disabled' as const : 'approved' as const };
      }
      return p;
    });
    saveProducts(updated);
  };

  const approveProduct = (productId: number, approvedBy?: string) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'approved' as const, approved_by: approvedBy, approved_at: new Date().toISOString(), rejectionReason: undefined } 
        : p
    );
    saveProducts(updated);
  };

  const rejectProduct = (productId: number, reason: string) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'rejected' as const, rejectionReason: reason } 
        : p
    );
    saveProducts(updated);
  };

  const disableProduct = (productId: number) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'disabled' as const } 
        : p
    );
    saveProducts(updated);
  };

  const addReview = (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newReview: Review = {
          ...reviewData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString()
        };
        const updatedReviews = [newReview, ...p.reviews];
        const newReviewCount = updatedReviews.length;
        const newRating = ((p.rating * p.reviewCount) + reviewData.rating) / newReviewCount;
        return {
          ...p,
          reviews: updatedReviews,
          reviewCount: newReviewCount,
          rating: Number(newRating.toFixed(1))
        };
      }
      return p;
    });
    saveProducts(updated);
  };

  return (
    <ProductContext.Provider value={{ 
      products, getProduct, addProduct, updateProduct, deleteProduct, toggleProductStatus,
      approveProduct, rejectProduct, disableProduct, addReview
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
