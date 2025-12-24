
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
    // { name: 'Orders', path: '/admin/orders' },
    // { name: 'Users', path: '/admin/users' },
  ];

  const activeLinkClass = 'bg-purple-600 text-white';
  const inactiveLinkClass = 'text-gray-300 hover:bg-navy-light hover:text-white';

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-navy-light p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-8">VexoKart Admin</h1>
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
      <main className="flex-grow p-8 bg-navy-charcoal overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
