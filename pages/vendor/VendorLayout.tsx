
import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getVendorByUserId } = useVendors();
  const navigate = useNavigate();
  
  const vendor = user ? getVendorByUserId(user.email) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/vendor', exact: true },
    { name: 'Products', path: '/vendor/products' },
    { name: 'Orders', path: '/vendor/orders' },
    { name: 'Store Profile', path: '/vendor/profile' },
  ];

  const activeLinkClass = 'bg-gradient-to-r from-accent to-accent-secondary text-white';
  const inactiveLinkClass = 'text-text-secondary hover:bg-background hover:text-text-main';

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-surface p-4 flex flex-col space-y-6">
        <div className="flex flex-col items-center text-center">
            <img 
                src={vendor?.storeLogo || 'https://picsum.photos/seed/default/200'} 
                alt={`${vendor?.storeName} logo`} 
                className="w-24 h-24 rounded-full border-2 border-accent object-cover mb-2 bg-background" 
            />
            <h1 className="text-lg font-semibold text-text-main">{vendor?.storeName || 'Vendor Panel'}</h1>
             <div className="mt-2 text-xs text-green-400 bg-green-900/50 border border-green-700/50 p-2 rounded-md w-full">
                Store Status: <span className="font-bold uppercase">APPROVED</span>
            </div>
        </div>

        <nav className="flex-grow">
          <ul>
            {menuItems.map(item => (
              <li key={item.name} className="mb-2">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} block py-2 px-4 rounded-md transition`}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
           <button onClick={handleLogout} className="w-full text-left py-2 px-4 rounded-md text-red-400 hover:bg-red-500/20">Logout</button>
        </div>
      </aside>
      <main className="flex-grow p-8 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default VendorLayout;