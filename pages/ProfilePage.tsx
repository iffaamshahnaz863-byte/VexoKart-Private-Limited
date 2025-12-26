
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
    { name: 'My Orders', link: '/orders', icon: 'M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5' },
    { name: 'My Wishlist', link: '/wishlist', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { name: 'Shipping Addresses', link: '/addresses', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M21 10.5c0 7.142-7.5 11.25-9 11.25S3 17.642 3 10.5a9 9 0 1118 0z' },
    { name: 'Payment Methods', link: '#', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3-3m3 3l3 3m-3-3v6m-9-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
    { name: 'Settings', link: '#', icon: 'M10.343 3.94c.09-.542.56-1.025 1.11-1.226l.542-.202c.636-.236 1.353.076 1.583.706l.328 1.002a.86.86 0 001.32.397l.83-.564c.6-.403 1.39.098 1.583.73l.288.948a.86.86 0 001.192.51l.942-.29c.65-.202 1.33.284 1.33.943v.568c0 .659-.68 1.145-1.33.943l-.942-.29a.86.86 0 00-1.192.51l-.288.948c-.193.632-.983 1.133-1.583.73l-.83-.564a.86.86 0 00-1.32.397l-.328 1.002c-.23.63-.947.942-1.583.706l-.542-.202c-.55-.201-1.02-.684-1.11-1.226l-.26-1.53c-.09-.542.23-1.055.77-1.226l1.036-.328c.54-.17.94-.66 1.03-1.202l.26-1.53z' }
  ];

  if (!user) {
    return null; // Or a loading spinner
  }
  
  const ManagementPanelLink = () => {
    if (user.role === 'SUPER_ADMIN') {
        return { link: '/admin', text: 'Super Admin Panel', iconColor: 'text-orange-400' };
    }
    if (user.role === 'VENDOR') {
        return { link: '/vendor', text: 'Vendor Dashboard', iconColor: 'text-accent' };
    }
    return null;
  }
  
  const panelLink = ManagementPanelLink();

  return (
    <div>
      <Header title="My Profile" />
      <div className="p-4 space-y-6">
        <GlassmorphicCard className="p-6 flex items-center space-x-4">
          <img src="https://picsum.photos/seed/avatar/100" alt="User Avatar" className="w-20 h-20 rounded-full border-2 border-accent" />
          <div>
            <h2 className="text-xl font-bold text-text-main">{user.name}</h2>
            <p className="text-text-muted">{user.email}</p>
          </div>
        </GlassmorphicCard>

        {panelLink && (
            <Link to={panelLink.link} className="block">
                <GlassmorphicCard className="p-4 flex items-center hover:bg-surface/70 transition hover:border-accent/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${panelLink.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                    </svg>
                    <span className="ml-4 font-bold text-text-main">{panelLink.text}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </GlassmorphicCard>
            </Link>
        )}

        <GlassmorphicCard>
          {menuItems.map((item, index) => (
             <Link to={item.link} key={item.name} className={`flex items-center p-4 cursor-pointer hover:bg-surface/50 ${index !== menuItems.length - 1 ? 'border-b border-border' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="ml-4 text-text-main">{item.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </GlassmorphicCard>

        <button onClick={handleLogout} className="w-full bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;