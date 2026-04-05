import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabase';

/* ================= TYPES ================= */
interface Banner {
  id: number;
  image_url: string;
  title: string;
  status: boolean;
  display_order: number;
}

/* ================= CONTEXT ================= */
interface BannerContextType {
  banners: Banner[];
  isLoading: boolean;
}

const BannerContext = createContext<BannerContextType | null>(null);

/* ================= PROVIDER ================= */
const BannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching banners...");

      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error("Error:", error);
        return;
      }

      console.log("RAW DATA:", data);

      // ✅ Safe filter
      const filtered = (data || []).filter(
        (b) => b.status === true && b.image_url
      );

      console.log("FILTERED:", filtered);

      setBanners(filtered);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <BannerContext.Provider value={{ banners, isLoading }}>
      {children}
    </BannerContext.Provider>
  );
};

/* ================= HOOK ================= */
const useBanners = () => {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error("useBanners must be used inside BannerProvider");
  return ctx;
};

/* ================= UI COMPONENT ================= */
const BannerSlider = () => {
  const { banners, isLoading } = useBanners();

  if (isLoading) return <p>Loading banners...</p>;
  if (!banners.length) return <p>No banners available</p>;

  return (
    <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '10px' }}>
      {banners.map((banner) => (
        <img
          key={banner.id}
          src={banner.image_url}
          alt={banner.title}
          style={{
            width: '300px',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '10px'
          }}
        />
      ))}
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const Home = () => {
  return (
    <div>
      <h2>Banner Section</h2>
      <BannerSlider />
    </div>
  );
};

/* ================= APP ================= */
export default function App() {
  return (
    <BannerProvider>
      <Home />
    </BannerProvider>
  );
}