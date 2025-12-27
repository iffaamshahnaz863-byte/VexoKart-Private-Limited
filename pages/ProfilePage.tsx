
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Order History', link: '/orders', icon: 'M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5' },
    { name: 'My Favorites', link: '/wishlist', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { name: 'Shipping Addresses', link: '/addresses', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M21 10.5c0 7.142-7.5 11.25-9 11.25S3 17.642 3 10.5a9 9 0 1118 0z' },
    { name: 'Payment Wallets', link: '#', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3-3m3 3l3 3m-3-3v6m-9-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
    { name: 'Account Settings', link: '#', icon: 'M10.343 3.94c.09-.542.56-1.025 1.11-1.226l.542-.202c.636-.236 1.353.076 1.583.706l.328 1.002a.86.86 0 001.32.397l.83-.564c.6-.403 1.39.098 1.583.73l.288.948a.86.86 0 001.192.51l.942-.29c.65-.202 1.33.284 1.33.943v.568c0 .659-.68 1.145-1.33.943l-.942-.29a.86.86 0 00-1.192.51l-.288.948c-.193.632-.983 1.133-1.583.73l-.83-.564a.86.86 0 00-1.32.397l-.328 1.002c-.23.63-.947.942-1.583.706l-.542-.202c-.55-.201-1.02-.684-1.11-1.226l-.26-1.53c-.09-.542.23-1.055.77-1.226l1.036-.328c.54-.17.94-.66 1.03-1.202l.26-1.53z' }
  ];

  if (!user) return null;
  
  const panelLink = user.role === 'SUPER_ADMIN' ? { link: '/admin', text: 'Admin Hub' } : user.role === 'VENDOR' ? { link: '/vendor', text: 'Vendor Console' } : null;

  return (
    <div className="bg-surface min-h-screen">
      <Header title="My Account" />
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* User Badge */}
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-border flex items-center space-x-5">
          <div className="relative">
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=FF8A00&color=fff`} alt="User Avatar" className="w-20 h-20 rounded-2xl border-2 border-white shadow-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-black text-text-main tracking-tight uppercase italic">{user.name}</h2>
            <p className="text-text-muted text-xs font-semibold">{user.email}</p>
            <div className="flex gap-2 mt-2">
               <span className="text-[8px] font-black uppercase tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">Premier Member</span>
               {user.role !== 'USER' && <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-100">{user.role}</span>}
            </div>
          </div>
        </div>

        {panelLink && (
            <Link to={panelLink.link} className="block group">
                <div className="bg-gradient-to-r from-accent to-orange-600 p-4 rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-between group-hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                      </div>
                      <span className="font-black text-white uppercase tracking-widest text-[10px]">Access {panelLink.text}</span>
                    </div>
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
            </Link>
        )}

        <div className="bg-white rounded-3xl shadow-premium border border-border overflow-hidden">
          {menuItems.map((item, index) => (
             <Link to={item.link} key={item.name} className={`flex items-center p-5 cursor-pointer hover:bg-surface transition-colors ${index !== menuItems.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <span className="ml-4 text-sm font-bold text-text-main uppercase tracking-tight">{item.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-muted ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95">
          Secure Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
