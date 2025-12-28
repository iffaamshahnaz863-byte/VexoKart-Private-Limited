
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
    const res = await fetch(`${BASE_API_URL}/categories?select=*`, { headers: API_HEADERS });
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (cat: any) => {
    await fetch(`${BASE_API_URL}/categories`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(cat)
    });
    await fetchCategories();
  };

  const updateCategory = async (cat: Category) => {
    await fetch(`${BASE_API_URL}/categories?id=eq.${cat.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(cat)
    });
    await fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    await fetch(`${BASE_API_URL}/categories?id=eq.${id}`, {
      method: 'DELETE',
      headers: API_HEADERS
    });
    await fetchCategories();
  };

  const getCategory = (id: number) => categories.find(c => c.id === id);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
