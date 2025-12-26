
import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = false }) => {
  return (
    <header className="sticky top-0 z-10 p-4 bg-surface shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-main tracking-wider">
          {title}
        </h1>
      </div>
      {showSearch && (
         <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search VexoKart..."
            className="w-full bg-background/50 text-text-main placeholder-text-muted border border-gray-700 focus:border-accent focus:ring-accent rounded-full py-2 pl-10 pr-4 transition"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-text-muted" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;