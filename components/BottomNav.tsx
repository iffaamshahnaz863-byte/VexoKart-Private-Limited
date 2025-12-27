
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon';
import { CategoryIcon } from './icons/CategoryIcon';
import { CartIcon } from './icons/CartIcon';
import { UserIcon } from './icons/UserIcon';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';

const BottomNav: React.FC = () => {
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const activeLinkClass = 'text-accent';
  const inactiveLinkClass = 'text-text-muted hover:text-text-main';
  const profileLink = isAuthenticated ? '/profile' : '/login';

  const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
     <NavLink to={to} className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} transition-all duration-300`}>
       {children}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavItem to="/">
          <div className="flex flex-col items-center justify-center">
            <HomeIcon className="h-6 w-6" />
            <span className="text-[10px] font-semibold mt-1">Home</span>
          </div>
        </NavItem>
        <NavItem to="/products">
          <div className="flex flex-col items-center justify-center">
            <CategoryIcon className="h-6 w-6" />
            <span className="text-[10px] font-semibold mt-1">Shop</span>
          </div>
        </NavItem>
        <NavItem to="/cart">
          <div className="relative flex flex-col items-center justify-center">
            <CartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg shadow-accent/20">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-semibold mt-1">Cart</span>
          </div>
        </NavItem>
        <NavItem to={profileLink}>
          <div className="flex flex-col items-center justify-center">
            <UserIcon className="h-6 w-6" />
            <span className="text-[10px] font-semibold mt-1">Profile</span>
          </div>
        </NavItem>
      </div>
    </nav>
  );
};

export default BottomNav;
