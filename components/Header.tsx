
import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 p-4 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
             <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <h1 className="text-xl font-bold text-text-main tracking-tight">
            Vexo<span className="text-accent">Kart</span>
          </h1>
        </Link>
      </div>
      {showSearch && (
         <form onSubmit={handleSearch} className="mt-3 relative group">
          <input
            type="text"
            placeholder="Search products, brands and more"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-surface text-text-main placeholder-text-muted border border-border focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/5 rounded-2xl py-2.5 pl-11 pr-4 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-accent" />
          </div>
        </form>
      )}
    </header>
  );
};

export default Header;
