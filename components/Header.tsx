
import React from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = false }) => {
  return (
    <header className="sticky top-0 z-40 p-4 bg-surface/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0d0d14] to-[#1a1a2e] border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
             <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <h1 className="text-xl font-black text-text-main tracking-tight italic">
            Vexo<span className="text-accent">Kart</span>
          </h1>
        </Link>
      </div>
      {showSearch && (
         <div className="mt-4 relative group">
          <input
            type="text"
            placeholder="Search premium products..."
            className="w-full bg-background/50 text-text-main placeholder-text-muted border border-white/5 group-hover:border-accent/30 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-2xl py-2.5 pl-11 pr-4 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
