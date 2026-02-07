
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationService } from '../context/LocationContext';
import LocationModal from '../components/LocationModal';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission, isServiceable } = useLocationService();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleDailyNeedsClick = () => {
    if (hasPermission && isServiceable) {
        navigate('/daily');
    } else {
        setShowLocationModal(true);
    }
  };

  const handleLocationSuccess = () => {
      setShowLocationModal(false);
      navigate('/daily');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showLocationModal && (
          <LocationModal 
            onClose={() => setShowLocationModal(false)} 
            onSuccess={handleLocationSuccess} 
          />
      )}

      <div className="p-6 pt-12">
        <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter">
          DAR CYCLE<span className="text-[#FF8A00]">HUB</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Choose your shopping experience</p>
      </div>

      <div className="flex-1 px-6 pb-6 space-y-4 flex flex-col justify-center">
        {/* Ecommerce Option */}
        <div 
          onClick={() => navigate('/home')}
          className="relative overflow-hidden rounded-[2.5rem] h-64 bg-[#FFF5E6] border border-[#FFE0B2] cursor-pointer active:scale-95 transition-all shadow-sm group"
        >
          <div className="absolute top-6 left-6 z-10">
            <h2 className="text-2xl font-black text-gray-900 uppercase italic">Shop<br/>Products</h2>
            <p className="text-xs font-bold text-[#FF8A00] mt-2 uppercase tracking-widest">Fashion • Electronics • Home</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
            className="absolute right-0 bottom-0 w-40 h-full object-cover mask-image-gradient group-hover:scale-110 transition-transform duration-700" 
            style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)' }}
          />
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
             <span className="text-[10px] font-black uppercase text-gray-900">Enter Store →</span>
          </div>
        </div>

        {/* Daily Needs Option */}
        <div 
          onClick={handleDailyNeedsClick}
          className="relative overflow-hidden rounded-[2.5rem] h-64 bg-[#E7F7F0] border border-[#C2EAD5] cursor-pointer active:scale-95 transition-all shadow-sm group"
        >
          <div className="absolute top-6 left-6 z-10">
            <h2 className="text-2xl font-black text-gray-900 uppercase italic">Daily<br/>Needs</h2>
            <p className="text-xs font-bold text-[#00B259] mt-2 uppercase tracking-widest">Groceries • Vegetables • 10min</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
            className="absolute right-0 bottom-0 w-40 h-full object-cover group-hover:scale-110 transition-transform duration-700"
             style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)' }}
          />
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
             <span className="text-[10px] font-black uppercase text-gray-900">Order Now →</span>
          </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pb-8">DAR CYCLE HUB Multi-Vertical Platform</p>
    </div>
  );
};

export default LandingPage;
