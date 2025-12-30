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
  const { currentVendor, isVendorLoading, vendorError, fetchCurrentVendor } = useVendors();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.id) {
      // Background sync or fetch if missing
      fetchCurrentVendor(user.id.toString());
    }
  }, [user?.id]);

  const handleLogout = () => {
    sessionStorage.removeItem('vxk_vendor_cache');
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/vendor', exact: true },
    { name: 'Products', path: '/vendor/products' },
    { name: 'Orders', path: '/vendor/orders' },
    { name: 'Store Profile', path: '/vendor/profile' },
  ];

  // ONLY block with loading screen if we have NO data AND we are currently loading
  if (isVendorLoading && !currentVendor) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[9px]">Initializing Workspace...</p>
        </div>
    );
  }

  if (vendorError && !currentVendor) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-black text-text-main uppercase italic mb-2">Sync Error</h2>
            <p className="text-text-secondary mb-8 max-w-xs mx-auto text-sm">{vendorError}</p>
            <button onClick={handleLogout} className="px-8 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Logout & Retry</button>
        </div>
    );
  }

  if (!currentVendor) return null;

  if (currentVendor.status !== 'approved') {
    return <VendorStatusPage vendor={currentVendor} />;
  }

  return (
    <div className="flex min-h-screen bg-background animate-in fade-in duration-300">
      <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col fixed h-full z-30">
        <div className="flex flex-col items-center text-center px-2 mb-10">
            <div className="relative mb-4">
                <img 
                    src={currentVendor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentVendor.store_name)}&background=FF8A00&color=fff`} 
                    alt={currentVendor.store_name} 
                    className="w-16 h-16 rounded-2xl object-cover bg-background border border-border shadow-sm" 
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></div>
            </div>
            <h1 className="text-sm font-black text-text-main tracking-tight uppercase italic">{currentVendor.store_name}</h1>
            <p className="text-[8px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Certified Merchant</p>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-background hover:text-text-main'} flex items-center py-2.5 px-4 rounded-xl transition-all duration-200 font-bold text-[10px] uppercase tracking-widest`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
           <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-red-400 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-widest transition-all">
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