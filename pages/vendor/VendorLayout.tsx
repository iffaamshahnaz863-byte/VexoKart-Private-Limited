
import React, { ReactNode, useEffect, useState } from 'react';
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
  const [timedOut, setTimedOut] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.email) {
        fetchCurrentVendor(user.email);
        
        // Safety timeout: 5 seconds max for loading state
        const timer = setTimeout(() => {
          setTimedOut(true);
        }, 5000);
        
        return () => clearTimeout(timer);
    }
  }, [user?.email]);

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

  // 1. Loading State (With 5s limit)
  if (isVendorLoading && !timedOut) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[10px]">Syncing Vendor Profile...</p>
        </div>
    );
  }

  // 2. Error State (Profile missing, sync failed, or timed out)
  if (vendorError || !currentVendor || timedOut) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-text-main uppercase italic tracking-tight mb-2">
              {timedOut && !vendorError ? 'Sync Timeout' : 'Access Denied'}
            </h1>
            <p className="text-text-secondary max-w-xs mb-8">
              {vendorError || (timedOut ? 'The server took too long to respond. Please check your connection.' : 'Vendor profile not found. Please contact admin.')}
            </p>
            <div className="flex gap-4">
                <button onClick={handleLogout} className="px-6 py-3 border border-border rounded-xl text-xs font-bold">Logout</button>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">Retry Sync</button>
            </div>
        </div>
    );
  }

  // 3. Status Verification (Redirect to status page if not approved)
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
