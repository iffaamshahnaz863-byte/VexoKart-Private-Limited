
import React, { useState, useEffect } from 'react';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { HeartIcon } from './icons/HeartIcon.tsx';
import { CartIcon } from './icons/CartIcon.tsx';
import { useCart } from '../hooks/useCart.ts';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon.tsx';

// Fix: Defined HeaderProps to fix property assignment errors in multiple pages
interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { unreadCount } = useNotifications();
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const defaultAddress = user?.addresses?.[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      {/* Top Row: User/Back, Search, Wishlist, Bell, Cart */}
      <div className="px-3 pt-3 pb-1 flex items-center gap-3">
        {/* Fix: Conditional rendering for Title vs Home Avatar */}
        {title ? (
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-base font-black text-gray-800 uppercase tracking-tight italic truncate max-w-[150px] md:max-w-xs">{title}</h1>
          </div>
        ) : (
          <div 
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            {isAuthenticated ? (
              <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=FF8A00&color=fff`} className="w-full h-full object-cover" alt="User" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </div>
        )}

        {/* Fix: Conditional rendering for Search bar based on title/showSearch props */}
        {(!title || showSearch) && (
          <form onSubmit={handleSearch} className="flex-grow relative group min-w-0">
            <input
              type="text"
              placeholder="Search by keyword or ID"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-[#F8F9FA] text-sm text-text-main placeholder-gray-400 border border-transparent focus:border-accent/30 focus:bg-white rounded-lg py-2 pl-9 pr-14 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 hover:text-accent cursor-pointer hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <svg className="w-4 h-4 text-gray-400 hover:text-accent cursor-pointer hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </form>
        )}

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <Link to="/notifications" className="relative p-1 active:scale-90 transition-transform">
             <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
             </svg>
             {unreadCount > 0 && (
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
             )}
          </Link>
          <Link to="/wishlist" className="relative p-1 active:scale-90 transition-transform">
             <HeartIcon className="w-6 h-6 text-gray-700" />
          </Link>
          <Link to="/cart" className="relative p-1 active:scale-90 transition-transform">
            <CartIcon className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Bottom Row: Location Selector - Hide if title is present for a more focused page header */}
      {!title && (
        <div className="px-3 pb-2 flex items-center justify-between">
          <div 
             onClick={() => navigate('/addresses')}
             className="flex items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity"
          >
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[11px] font-bold text-gray-600 truncate max-w-[200px]">
              {defaultAddress 
                ? `Delivering to ${defaultAddress.city} - ${defaultAddress.zip}` 
                : 'Add delivery address'}
            </span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div 
            onClick={() => navigate('/refer')}
            className="bg-orange-50 px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[9px] font-black text-accent uppercase italic">Refer & Earn</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
