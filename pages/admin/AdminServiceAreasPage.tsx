
import React, { useState } from 'react';
import { useServiceAreas } from '../../context/ServiceAreaContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminServiceAreasPage: React.FC = () => {
  const { serviceAreas, addServiceArea, updateServiceArea, deleteServiceArea } = useServiceAreas();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    country: 'India',
    state: '',
    city: '',
    area_name: '',
    pincode: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pincode || !formData.city) return;
    await addServiceArea(formData);
    setIsAdding(false);
    setFormData({ country: 'India', state: '', city: '', area_name: '', pincode: '', is_active: true });
  };

  const inputClasses = "w-full bg-surface border border-gray-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-accent";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Service Areas</h1>
          <p className="text-gray-400 font-bold text-sm mt-1">Manage Daily Needs availability zones.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 active:scale-95 transition-all"
        >
          {isAdding ? 'Cancel' : 'Add New Area'}
        </button>
      </div>

      {isAdding && (
        <GlassmorphicCard className="p-6 animate-in slide-in-from-top-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">New Service Zone</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input placeholder="Pincode (e.g. 122001)" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className={inputClasses} required />
                <input placeholder="City (e.g. Gurgaon)" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClasses} required />
                <input placeholder="State (e.g. Haryana)" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClasses} required />
                <input placeholder="Area Name (e.g. DLF Phase 1)" value={formData.area_name} onChange={e => setFormData({...formData, area_name: e.target.value})} className={inputClasses} required />
                <div className="flex items-center gap-3 px-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                    >
                        {formData.is_active ? 'Active' : 'Inactive'}
                    </button>
                </div>
                <div className="lg:col-span-1 flex justify-end">
                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Save Zone</button>
                </div>
            </form>
        </GlassmorphicCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceAreas.map(area => (
            <div key={area.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${area.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {area.is_active ? 'Live' : 'Disabled'}
                        </span>
                        <button onClick={() => deleteServiceArea(area.id)} className="text-red-400 hover:text-red-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{area.pincode}</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight mt-1">{area.area_name}, {area.city}</p>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">{area.state}, {area.country}</p>

                <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                    <button 
                        onClick={() => updateServiceArea(area.id, { is_active: !area.is_active })}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${area.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                        {area.is_active ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default AdminServiceAreasPage;
