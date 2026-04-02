
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Category } from '../types';
import { supabase } from '../supabase';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  addCategory: (category: { name: string; image_url: string }) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string | number) => Promise<void>;
  getCategory: (id: string | number) => Category | undefined;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching categories from Supabase...");
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("[CategoryContext] Supabase error:", error);
        throw error;
      }
      console.log("Categories fetched successfully:", data?.length || 0);
      setCategories(data || []);
    } catch (error: any) {
      console.error("[CategoryContext] Error fetching categories:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (cat: { name: string; image_url: string }) => {
    try {
        const { error } = await supabase
          .from('categories')
          .insert([{ 
            ...cat, 
            slug: cat.name.toLowerCase().replace(/\s+/g, '-'), 
            created_at: new Date().toISOString() 
          }]);
        
        if (error) throw error;
        await fetchCategories();
    } catch (e) {
        console.error("[CategoryContext] Error adding category:", e);
        throw e;
    }
  };

  const updateCategory = async (cat: Category) => {
    try {
        const { error } = await supabase
          .from('categories')
          .update({ name: cat.name, image_url: cat.image_url })
          .eq('id', cat.id);
        if (error) throw error;
        await fetchCategories();
    } catch (e) {
        console.error("[CategoryContext] Error updating category:", e);
    }
  };

  const deleteCategory = async (id: string | number) => {
    try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setCategories(prev => prev.filter(c => c.id !== String(id)));
    } catch (e) {
        console.error("[CategoryContext] Error deleting category:", e);
    }
  };

  const getCategory = (id: string | number) => categories.find(c => c.id === String(id));

  return (
    <CategoryContext.Provider value={{ categories, isLoading, addCategory, updateCategory, deleteCategory, getCategory, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategories missing provider');
  return context;
};

