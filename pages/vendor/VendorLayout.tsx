
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useVendors } from '../../context/VendorContext.tsx';
import VendorStatusPage from './VendorStatusPage.tsx';
import Toast from '../../components/Toast.tsx';

const VendorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentVendor, isVendorLoading, vendorError, fetchCurrentVendor } = useVendors();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  
  const prevStatusRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (user?.id) {
      fetchCurrentVendor(user.id.toString(), true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentVendor) {
        if (prevStatusRef.current === 'pending' && currentVendor.status === 'approved') {
            setShowToast(true);
        }
        prevStatusRef.current = currentVendor.status;
    }
  }, [currentVendor]);

  const handleLogout = () => {
    sessionStorage.removeItem('dch_vendor_cache');
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home', path: '/vendor', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Products', path: '/vendor/products', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { name: 'Orders', path: '/vendor/orders', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { name: 'Wallet', path: '/vendor/wallet', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
    { name: 'Profile', path: '/vendor/profile', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  if (isVendorLoading && !currentVendor) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[9px]">Initializing Secure Workspace...</p>
        </div>
    );
  }

  if (vendorError && !currentVendor) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-black text-text-main uppercase italic mb-2">Vendor Error</h2>
            <p className="text-text-secondary mb-8 max-w-xs mx-auto text-sm">{vendorError}</p>
            <button onClick={handleLogout} className="px-8 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Secure Logout</button>
        </div>
    );
  }

  if (!currentVendor) return null;

  if (currentVendor.status !== 'approved') {
    return (
        <>
            <VendorStatusPage vendor={currentVendor} />
            <Toast isVisible={showToast} message="Your account has been approved 🎉" onClose={() => setShowToast(false)} />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-0 animate-in fade-in duration-300">
      <Toast isVisible={showToast} message="Your account has been approved 🎉" onClose={() => setShowToast(false)} />
      
      <aside className="hidden lg:flex w-64 bg-white border-r border-border p-6 flex-col fixed h-full z-30">
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
            <p className="text-[8px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Authorized Merchant</p>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor'}
              className={({ isActive }) => `${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-[#F8F9FA] hover:text-text-main'} flex items-center py-3 px-4 rounded-xl transition-all duration-200 font-bold text-[10px] uppercase tracking-widest`}
            >
              <span className="mr-3">
                 {item.icon(location.pathname === item.path || (item.path === '/vendor' && location.pathname === '/vendor'))}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
           <button onClick={handleLogout} className="w-full flex items-center gap-2 py-3 px-4 rounded-xl text-red-500 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest transition-all">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Logout
           </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 lg:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
            <Outlet />
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[100] px-2 flex justify-around items-center">
         {menuItems.map(item => {
           const isActive = location.pathname === item.path || (item.path === '/vendor' && location.pathname === '/vendor');
           return (
             <NavLink 
               key={item.name}
               to={item.path}
               end={item.path === '/vendor'}
               className="flex flex-col items-center justify-center p-2 min-w-[64px]"
             >
               {item.icon(isActive)}
               <span className={`text-[9px] font-bold mt-1 tracking-tighter uppercase ${isActive ? 'text-accent' : 'text-gray-400'}`}>
                 {item.name}
               </span>
             </NavLink>
           );
         })}
      </nav>
    </div>
  );
};

export default VendorLayout;
