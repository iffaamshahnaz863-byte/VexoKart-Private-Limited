
import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps { children: ReactNode; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', exact: true },
    { name: 'Inventory', path: '/admin/products' },
    { name: 'Home Banners', path: '/admin/banners' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Vendors', path: '/admin/vendors' },
    { name: 'Admin Codes', path: '/admin/codes' },
  ];

  const activeLinkClass = 'bg-accent text-white shadow-lg shadow-accent/20';
  const inactiveLinkClass = 'text-text-secondary hover:bg-background/50 hover:text-text-main';

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col fixed h-full z-30">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h1 className="text-xl font-black text-text-main italic tracking-tighter leading-none">Vexo<span className="text-accent">Kart</span> Admin</h1>
        </div>
        
        <nav className="flex-grow space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex items-center py-2.5 px-4 rounded-xl transition-all duration-200 font-medium`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
           <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-all">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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

export default AdminLayout;
