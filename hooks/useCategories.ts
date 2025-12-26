
import { useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
