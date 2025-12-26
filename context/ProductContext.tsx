
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';

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
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"],
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
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"],
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
    name: "MacBook Pro M3 Max",
    category: "Computing",
    price: 349900,
    originalPrice: 369900,
    rating: 5.0,
    reviewCount: 320,
    images: ["https://images.unsplash.com/photo-1517336712461-481bf488d086?auto=format&fit=crop&w=800&q=80"],
    description: "Mind-blowing. Eye-popping. For those who need peak performance for complex workflows like 3D rendering or professional video editing.",
    reviews: [],
    highlights: ["M3 Max Chip", "128GB Unified Memory", "Liquid Retina XDR Display", "MagSafe Charging"],
    stock: 8,
    specifications: { "CPU": "16-Core", "GPU": "40-Core", "RAM": "128GB", "Display": "16.2-inch" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 104,
    name: "PlayStation 5 Horizon Bundle",
    category: "Gaming",
    price: 54990,
    originalPrice: 59990,
    rating: 4.8,
    reviewCount: 2150,
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80"],
    description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
    reviews: [],
    highlights: ["4K-TV Gaming", "Up to 120fps", "HDR Technology", "825GB SSD Storage"],
    stock: 12,
    specifications: { "Controller": "DualSense Wireless", "Resolution": "Native 4K", "Frame Rate": "120Hz", "Ports": "HDMI 2.1" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 105,
    name: "Aura Smartwatch Elite",
    category: "Accessories",
    price: 45000,
    originalPrice: 49500,
    rating: 4.6,
    reviewCount: 412,
    images: ["https://images.unsplash.com/photo-1544117518-30df57809ca7?auto=format&fit=crop&w=800&q=80"],
    description: "Elegant design meets advanced health tracking. Monitor your heart rate, sleep patterns, and blood oxygen levels with laboratory-grade accuracy.",
    reviews: [],
    highlights: ["Sapphire Crystal Glass", "ECG Monitor", "Always-On Display", "GPS Navigation"],
    stock: 45,
    specifications: { "Case Size": "45mm", "Display": "LTPO OLED", "Water Resistance": "50m", "Material": "Stainless Steel" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 106,
    name: "Alpha DSLR Camera",
    category: "Electronics",
    price: 185000,
    originalPrice: 195000,
    rating: 4.9,
    reviewCount: 154,
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
    description: "Capture the world in stunning detail. The Alpha features a 61MP full-frame sensor and next-generation real-time autofocus for professional results.",
    reviews: [],
    highlights: ["61.0MP Full Frame", "Real-time Eye AF", "4K 60p Video", "Dual Card Slots"],
    stock: 5,
    specifications: { "Sensor": "CMOS", "ISO Range": "100-32000", "Stabilization": "5-axis In-body", "Screen": "Tiltable Touchscreen" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 107,
    name: "Spectra Gaming Monitor",
    category: "Computing",
    price: 68900,
    originalPrice: 75000,
    rating: 4.7,
    reviewCount: 388,
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"],
    description: "The smoothest visuals for competitive gaming. Featuring a 240Hz refresh rate and 1ms response time on a beautiful ultra-wide curved panel.",
    reviews: [],
    highlights: ["240Hz Refresh Rate", "1ms Response", "G-Sync Compatible", "HDR600 Support"],
    stock: 20,
    specifications: { "Resolution": "3440 x 1440", "Panel": "IPS Curved", "Ratio": "21:9", "Brightness": "600 nits" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 108,
    name: "Stealth Mech Keyboard",
    category: "Gaming",
    price: 14500,
    originalPrice: 16900,
    rating: 4.5,
    reviewCount: 622,
    images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80"],
    description: "Tactile, precise, and durable. The Stealth features linear mechanical switches with customizable RGB lighting and a premium aluminum frame.",
    reviews: [],
    highlights: ["Mechanical Red Switches", "RGB Lighting", "USB-C Braided Cable", "Detachable Wrist Rest"],
    stock: 80,
    specifications: { "Switches": "Linear", "Layout": "Tenkeyless", "Response": "0.1ms", "Keycaps": "Double-shot PBT" },
    vendorId: "vexokart_internal",
    status: "approved"
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-products');
      let parsedData = localData ? JSON.parse(localData) : SEED_PRODUCTS;
      
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map((p: any) => {
          if (p.features && !p.highlights) p.highlights = p.features;
          if (!p.vendorId) p.vendorId = 'vexokart_internal';
          
          if (!p.status || p.status === 'pending' || p.status === 'rejected' || p.status === 'live') {
            p.status = 'approved';
          }
          return p;
        });
      }
      return parsedData;

    } catch (error) {
      console.error("Could not parse product data from localStorage", error);
      return SEED_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-products', JSON.stringify(products));
  }, [products]);

  const getProduct = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }

  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => {
    setProducts(prevProducts => {
      const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
      const newProduct: Product = { 
        ...productData, 
        id: newId,
        rating: 4.5,
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
      return [...prevProducts, newProduct];
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const toggleProductStatus = (productId: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, status: p.status === 'approved' ? 'disabled' : 'approved' };
      }
      return p;
    }));
  };

  const approveProduct = (productId: number, approvedBy?: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString(), rejectionReason: undefined } 
        : p
    ));
  };

  const rejectProduct = (productId: number, reason: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'rejected', rejectionReason: reason } 
        : p
    ));
  };

  const disableProduct = (productId: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'disabled' } 
        : p
    ));
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      getProduct, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      toggleProductStatus,
      approveProduct,
      rejectProduct,
      disableProduct
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
