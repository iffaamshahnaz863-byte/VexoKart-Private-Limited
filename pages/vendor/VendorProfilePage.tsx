
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const VendorProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { getVendorByUserId, updateVendorProfile } = useVendors();
    const navigate = useNavigate();

    const vendor = user ? getVendorByUserId(user.email) : null;

    const [storeName, setStoreName] = useState('');
    const [storeLogo, setStoreLogo] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');

    const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";
    
    useEffect(() => {
        if (vendor) {
            setStoreName(vendor.storeName);
            setStoreLogo(vendor.storeLogo);
            setLogoPreview(vendor.storeLogo);
            setStoreAddress(vendor.storeAddress || '');
            setStorePhone(vendor.storePhone || '');
        }
    }, [vendor]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setStoreLogo(result);
                setLogoPreview(result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (vendor) {
            updateVendorProfile(vendor.id, { 
                storeName, 
                storeLogo,
                storeAddress,
                storePhone
            } as any);
            alert('Store profile updated successfully! Your details will now appear on shipping labels.');
            navigate('/vendor');
        }
    };

    if (!vendor) {
        return <div className="text-center p-8">Loading vendor profile...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Store Profile</h1>
                    <p className="text-text-muted mt-1">Configure your public storefront and dispatch settings.</p>
                </div>
            </div>

            <GlassmorphicCard className="p-8 max-w-3xl mx-auto">
                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center gap-6 pb-8 border-b border-border">
                        <div className="relative group">
                            <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 rounded-3xl object-cover bg-background border-4 border-white shadow-2xl transition-transform group-hover:scale-105" />
                            <input type="file" id="logoUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <label htmlFor="logoUpload" className="absolute -bottom-2 -right-2 p-3 bg-accent text-white rounded-2xl shadow-xl cursor-pointer hover:bg-orange-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </label>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-text-main tracking-tight italic uppercase">{storeName}</p>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Vendor ID: {vendor.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Display Store Name</label>
                            <input 
                                type="text" 
                                value={storeName} 
                                onChange={(e) => setStoreName(e.target.value)} 
                                required 
                                className={inputClasses} 
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Dispatch Phone Contact</label>
                            <input 
                                type="tel" 
                                value={storePhone} 
                                onChange={(e) => setStorePhone(e.target.value)} 
                                required 
                                placeholder="+91 XXXX XXX XXX"
                                className={inputClasses} 
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Warehouse / Pickup Address (Printed on Labels)</label>
                            <textarea 
                                value={storeAddress} 
                                onChange={(e) => setStoreAddress(e.target.value)} 
                                required 
                                rows={3}
                                placeholder="Full pickup address for couriers..."
                                className={`${inputClasses} resize-none`} 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-border">
                        <button type="button" onClick={() => navigate('/vendor')} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all">Cancel</button>
                        <button type="submit" className="bg-accent text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all">Save Profile Settings</button>
                    </div>
                 </form>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorProfilePage;
