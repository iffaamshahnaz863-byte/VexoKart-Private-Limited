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

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-categories');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse category data from localStorage", error);
      return [];
    }
  });

  const { products } = useProducts();

  useEffect(() => {
    localStorage.setItem('vexokart-categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    setCategories(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
      return [...prev, { ...categoryData, id: newId }];
    });
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c))
    );
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
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const getCategory = (id: number) => {
      return categories.find(c => c.id === id);
  }

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, getCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};