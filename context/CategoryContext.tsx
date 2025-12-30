import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Category } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: { name: string; image_url: string }) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  getCategory: (id: number) => Category | undefined;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (cat: { name: string; image_url: string }) => {
    const payload = {
      name: cat.name,
      image_url: cat.image_url,
      created_at: new Date().toISOString()
    };

    const response = await fetch(`${BASE_API_URL}/categories`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create category`);
    }

    await fetchCategories();
  };

  const updateCategory = async (cat: Category) => {
    const payload = {
      name: cat.name,
      image_url: cat.image_url
    };

    const response = await fetch(`${BASE_API_URL}/categories?id=eq.${cat.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update category`);
    }

    await fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    const response = await fetch(`${BASE_API_URL}/categories?id=eq.${id}`, {
      method: 'DELETE',
      headers: API_HEADERS
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete category`);
    }

    await fetchCategories();
  };

  const getCategory = (id: number) => categories.find(c => c.id === id);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategories must be used within a CategoryProvider');
  return context;
};