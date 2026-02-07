
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon';
import { CategoryIcon } from './icons/CategoryIcon';
import { useAuth } from '../context/AuthContext';

const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => (
     <NavLink to={to} className={({ isActive }) => `${isActive ? 'text-accent' : 'text-gray-400'} flex flex-col items-center justify-center transition-all duration-300`}>
        {icon}
        <span className="text-[9px] font-bold mt-1 tracking-tighter uppercase">{label}</span>
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 px-2">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavItem to="/home" label="Home" icon={<HomeIcon className="h-5 w-5" />} />
        
        <NavItem to="/menu" label="Menu" icon={<CategoryIcon className="h-5 w-5" />} />
        
        <NavItem to="/products" label="Shop" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        } />
        
        <NavItem to="/products" label="Explore" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        } />
        
        <NavItem to="/orders" label="Orders" icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        } />
      </div>
    </nav>
  );
};

export default BottomNav;
