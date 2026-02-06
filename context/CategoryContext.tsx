
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Category } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: { name: string; image_url: string }) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string | number) => Promise<void>;
  getCategory: (id: string | number) => Category | undefined;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Fix: Use string for id and add slug, use image_url property to match Category type
const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Fashion', slug: 'fashion', image_url: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Lifestyle', slug: 'lifestyle', image_url: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Footwear', slug: 'footwear', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!res.ok) throw new Error("API unreachable");
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch (error) {
      console.warn("[CategoryContext] Using fallback categories.");
      setCategories(FALLBACK_CATEGORIES);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (cat: { name: string; image_url: string }) => {
    try {
        const response = await fetch(`${BASE_API_URL}/categories`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...cat, slug: cat.name.toLowerCase().replace(/\s+/g, '-'), created_at: new Date().toISOString() })
        });
        
        if (!response.ok) throw new Error("DB Error");
        await fetchCategories();
    } catch (e) {
        // Fix: create object that matches Category type
        const newCat: Category = { ...cat, id: Date.now().toString(), slug: cat.name.toLowerCase().replace(/\s+/g, '-') };
        setCategories(prev => [newCat, ...prev]);
    }
  };

  const updateCategory = async (cat: Category) => {
    try {
        await fetch(`${BASE_API_URL}/categories?id=eq.${cat.id}`, {
            method: 'PATCH',
            headers: API_HEADERS,
            // Fix: Use image_url instead of image
            body: JSON.stringify({ name: cat.name, image_url: cat.image_url })
        });
    } finally {
        setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    }
  };

  const deleteCategory = async (id: string | number) => {
    try {
        await fetch(`${BASE_API_URL}/categories?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    } finally {
        setCategories(prev => prev.filter(c => c.id !== String(id)));
    }
  };

  const getCategory = (id: string | number) => categories.find(c => c.id === String(id));

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategories missing provider');
  return context;
};
