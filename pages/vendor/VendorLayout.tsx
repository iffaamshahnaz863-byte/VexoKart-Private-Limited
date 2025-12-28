
import React, { ReactNode, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import VendorStatusPage from './VendorStatusPage';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getVendorByUserId, vendors, fetchCurrentVendor } = useVendors();
  const navigate = useNavigate();
  
  const currentVendor = user ? getVendorByUserId(user.id.toString()) : null;

  useEffect(() => {
    if (user?.email) {
      fetchCurrentVendor(user.email);
    }
  }, [user]);

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

  const activeLinkClass = 'bg-accent text-white shadow-lg shadow-accent/20';
  const inactiveLinkClass = 'text-text-secondary hover:bg-background hover:text-text-main';

  if (!currentVendor) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[10px]">Loading vendor profile...</p>
        </div>
    );
  }

  if (currentVendor.status !== 'approved') {
    return <VendorStatusPage vendor={currentVendor} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col fixed h-full z-30">
        <div className="flex flex-col items-center text-center px-2 mb-10">
            <div className="relative mb-4 group">
                <img 
                    src={currentVendor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentVendor.store_name)}&background=FF8A00&color=fff`} 
                    alt={currentVendor.store_name} 
                    className="w-20 h-20 rounded-2xl object-cover bg-background border border-border shadow-md" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface rounded-full"></div>
            </div>
            <h1 className="text-base font-black text-text-main tracking-tight uppercase italic">{currentVendor.store_name}</h1>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">Authorized Vendor</p>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex items-center py-2.5 px-4 rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-widest`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
           <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest transition-all">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Logout
           </button>
        </div>
      </aside>
      <main className="flex-grow ml-64 p-8 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
