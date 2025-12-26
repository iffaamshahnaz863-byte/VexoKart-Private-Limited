
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
  const inactiveLinkClass = 'text-gray-400 hover:text-white';
  const profileLink = isAuthenticated ? '/profile' : '/login';

  const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
     <NavLink to={to} className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} transform hover:-translate-y-1`}>
       {children}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-navy-light/80 backdrop-blur-md border-t border-gray-700/50 shadow-t-lg z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavItem to="/">
          <div className="flex flex-col items-center justify-center">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </div>
        </NavItem>
        <NavItem to="/products">
          <div className="flex flex-col items-center justify-center">
            <CategoryIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Shop</span>
          </div>
        </NavItem>
        <NavItem to="/cart">
          <div className="relative flex flex-col items-center justify-center">
            <CartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </div>
        </NavItem>
        <NavItem to={profileLink}>
          <div className="flex flex-col items-center justify-center">
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </NavItem>
      </div>
    </nav>
  );
};

export default BottomNav;