
import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', exact: true },
    { name: 'Products', path: '/admin/products' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Vendors', path: '/admin/vendors' },
    { name: 'Admin Codes', path: '/admin/codes' },
  ];

  const activeLinkClass = 'bg-accent text-white';
  const inactiveLinkClass = 'text-text-secondary hover:bg-background hover:text-text-main';

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-surface p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-text-main mb-8">VexoKart Super Admin</h1>
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

export default AdminLayout;