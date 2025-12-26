
import React from 'react';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, isSelected = false, onClick }) => {
  const baseClasses = "flex-shrink-0 text-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105";
  const selectedClasses = "bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg";
  const unselectedClasses = "bg-navy-light/70 backdrop-blur-sm border border-gray-700/50";
  
  return (
    <div
      onClick={() => onClick && onClick()}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses} cursor-pointer`}
    >
      <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded-full mx-auto mb-2 border-2 border-teal-500/50" />
      <span className="font-semibold text-sm text-white">{category.name}</span>
    </div>
  );
};

export default CategoryChip;
