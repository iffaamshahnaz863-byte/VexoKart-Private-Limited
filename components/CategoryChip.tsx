
import React from 'react';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, isSelected = false, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick()}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer transform hover:scale-105 ${isSelected ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-surface border-border text-text-secondary hover:border-accent/50'}`}
    >
      <div className={`w-6 h-6 rounded-full overflow-hidden border ${isSelected ? 'border-white/50' : 'border-border'}`}>
        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
      </div>
      <span className="font-bold text-xs uppercase tracking-tight">{category.name}</span>
    </div>
  );
};

export default CategoryChip;
