import React, { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminLayoutProps { children: ReactNode; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home Console', path: '/admin', exact: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Business Analytics', path: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Vendor Master', path: '/admin/vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Global Orders', path: '/admin/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Payouts & Ledger', path: '/admin/payouts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Marketing Control', path: '/admin/marketing', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.38a1.345 1.345 0 01-1.31-1.058l-.515-2.147a1.345 1.345 0 011.058-1.31h2.147l2.147-6.167a1.76 1.76 0 013.417.592zM17.25 12L21 8.25M17.25 12L21 15.75' },
    { name: 'Product Catalog', path: '/admin/products', icon: 'M4 6h16M4 12h16M4 18h7' },
    { name: 'Categories', path: '/admin/categories', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { name: 'System Security', path: '/admin/audit', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 mb-2">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h1 className="text-xl font-black text-gray-900 italic tracking-tighter">Vexo<span className="text-accent">Kart</span></h1>
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] italic border-b border-gray-50 pb-2">Owner Terminal</p>
        </div>
        
        <nav className="flex-grow px-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path || (item.exact && location.pathname === '/admin');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={`flex items-center gap-3 py-3 px-4 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-accent/5 text-accent shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-accent' : 'text-gray-300 group-hover:text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                </svg>
                <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Logged as Owner</p>
                <p className="text-xs font-bold text-gray-800 truncate">{user?.name}</p>
            </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-red-100">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Terminate Session
           </button>
        </div>
      </aside>

      <main className="flex-grow ml-64 p-8 overflow-auto min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;