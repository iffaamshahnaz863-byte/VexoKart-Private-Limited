
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { useAuth } from '../context/AuthContext';

const ShippingAddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, deleteAddress } = useAuth();

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-navy-charcoal flex items-center shadow-md">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Shipping Addresses</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {user?.addresses && user.addresses.length > 0 ? (
            user.addresses.map(address => (
                <GlassmorphicCard key={address.id} className="p-4">
                    <div className="text-gray-300 text-sm">
                        <p className="font-bold text-white text-base">{address.fullName}</p>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                        <p>Phone: {address.phone}</p>
                    </div>
                    <div className="flex space-x-4 mt-3 pt-3 border-t border-gray-700/50 text-sm font-semibold">
                        <button onClick={() => navigate(`/addresses/edit/${address.id}`)} className="text-purple-400">Edit</button>
                        <button onClick={() => deleteAddress(address.id)} className="text-red-400">Remove</button>
                    </div>
                </GlassmorphicCard>
            ))
        ) : (
            <p className="text-center text-gray-400 pt-8">No addresses saved yet.</p>
        )}
         
         <button 
            onClick={() => navigate('/addresses/new')}
            className="w-full bg-purple-600/20 backdrop-blur-sm border border-purple-500/50 text-purple-400 font-bold py-3 rounded-xl hover:bg-purple-600/40 transition">
          Add New Address
        </button>
      </div>
    </div>
  );
};

export default ShippingAddressesPage;
