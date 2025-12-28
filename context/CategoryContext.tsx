
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Category } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  getCategory: (id: number) => Category | undefined;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        /**
         * SCHEMA ALIGNMENT:
         * Since 'image' and 'image_url' columns are missing in the Supabase table,
         * we generate a premium branded placeholder using the category name.
         */
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.name || 'Category',
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'C')}&background=FF8A00&color=fff&size=128&bold=true`
        }));
        setCategories(mappedData);
      } else {
        console.error("Categories fetch failed: API response is not an array", data);
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

  const addCategory = async (cat: any) => {
    /**
     * CORE FIX FOR PGRST204:
     * We only send 'name' and 'created_at'.
     * We EXCLUDE 'image' or 'image_url' because the database schema cache
     * explicitly states these columns do not exist.
     */
    const payload = {
      name: cat.name,
      created_at: new Date().toISOString()
    };

    const response = await fetch(`${BASE_API_URL}/categories`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create category (${response.status})`);
    }

    await fetchCategories();
  };

  const updateCategory = async (cat: Category) => {
    /**
     * SAFE PATCH:
     * Only updating the 'name' field to avoid column-not-found errors.
     */
    const payload = {
      name: cat.name
    };

    const response = await fetch(`${BASE_API_URL}/categories?id=eq.${cat.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update category (${response.status})`);
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
        throw new Error(errorData.message || `Failed to delete category (${response.status})`);
    }

    await fetchCategories();
  };

  const getCategory = (id: number) => categories.find(c => c.id === id);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
