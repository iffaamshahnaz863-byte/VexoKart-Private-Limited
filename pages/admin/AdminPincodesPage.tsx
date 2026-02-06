
import React, { useState } from 'react';
import { useServiceAreas } from '../../context/ServiceAreaContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';

const AdminPincodesPage: React.FC = () => {
  const { serviceAreas, addServiceArea, updateServiceArea, deleteServiceArea, refreshServiceAreas } = useServiceAreas();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newPincode, setNewPincode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPincode.length !== 6 || !/^\d+$/.test(newPincode)) {
        alert("Please enter a valid 6-digit pincode.");
        return;
    }
    await addServiceArea({
        pincode: newPincode,
        is_active: true,
        created_by: user?.id,
        // The rest are optional or defaulted in DB
        country: 'India',
        state: '',
        city: '',
        area_name: ''
    });
    setIsAdding(false);
    setNewPincode('');
  };

  const inputClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xl font-black tracking-widest focus:outline-none focus:border-accent";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Daily Needs Pincodes</h1>
          <p className="text-gray-400 font-bold text-sm mt-1">Manage pincodes eligible for 10-minute grocery delivery.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 active:scale-95 transition-all"
        >
          {isAdding ? 'Cancel' : 'Add Pincode'}
        </button>
      </div>

      {isAdding && (
        <GlassmorphicCard className="p-6 bg-white border border-gray-100 animate-in slide-in-from-top-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Add New Serviceable Pincode</h2>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input 
                    placeholder="122001" 
                    value={newPincode} 
                    onChange={e => setNewPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className={inputClasses} 
                    required 
                />
                <button type="submit" className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Save Pincode</button>
            </form>
        </GlassmorphicCard>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {serviceAreas.map(area => (
            <div key={area.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-gray-900 tracking-widest">{area.pincode}</h3>
                    <div className={`w-3 h-3 rounded-full mt-1 ${area.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{area.city || 'N/A'}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                    <button 
                        onClick={() => updateServiceArea(area.id, { is_active: !area.is_active })}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${area.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                        {area.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteServiceArea(area.id)} className="w-10 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPincodesPage;
