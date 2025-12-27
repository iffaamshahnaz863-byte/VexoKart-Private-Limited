
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Category } from '../types';
import { useProducts } from '../hooks/useProducts';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: number) => void;
  getCategory: (id: number) => Category | undefined;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Computing', image: 'https://images.unsplash.com/photo-1517336712461-481bf488d086?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' },
  { id: 5, name: 'Gaming', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80' },
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { products } = useProducts();
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-categories');
      return localData ? JSON.parse(localData) : INITIAL_CATEGORIES;
    } catch (error) {
      return INITIAL_CATEGORIES;
    }
  });

  const saveCategories = (updatedCategories: Category[]) => {
    localStorage.setItem('vexokart-categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    saveCategories([...categories, { ...categoryData, id: newId }]);
  };

  const updateCategory = (updatedCategory: Category) => {
    const updated = categories.map(c => (c.id === updatedCategory.id ? updatedCategory : c));
    saveCategories(updated);
  };

  const deleteCategory = (categoryId: number) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;
    const isCategoryInUse = products.some(p => p.category === categoryToDelete.name);
    if (isCategoryInUse) {
      alert('This category is in use by one or more products and cannot be deleted.');
      return;
    }
    if(window.confirm(`Are you sure you want to delete the category "${categoryToDelete.name}"?`)){
        saveCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  const getCategory = (id: number) => categories.find(c => c.id === id);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
