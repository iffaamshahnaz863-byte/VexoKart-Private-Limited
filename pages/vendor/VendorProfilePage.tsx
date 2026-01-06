import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const VendorProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { currentVendor, updateVendorProfile } = useVendors();
    const navigate = useNavigate();

    const [storeName, setStoreName] = useState('');
    const [storeLogo, setStoreLogo] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-50";
    
    useEffect(() => {
        if (currentVendor) {
            setStoreName(currentVendor.store_name || '');
            setStoreLogo(currentVendor.profile_image || '');
            setLogoPreview(currentVendor.profile_image || '');
            setStoreAddress(currentVendor.store_address || '');
            setStorePhone(currentVendor.phone || '');
        }
    }, [currentVendor]);

    /**
     * Resizes the image to prevent massive base64 payloads
     */
    const resizeLogo = (file: File, size = 400): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > size) {
                            height *= size / width;
                            width = size;
                        }
                    } else {
                        if (height > size) {
                            width *= size / height;
                            height = size;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUpdating(true);
            try {
                const compressed = await resizeLogo(file);
                setStoreLogo(compressed);
                setLogoPreview(compressed);
            } catch (err) {
                console.error("Logo processing error:", err);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentVendor) return;

        setIsUpdating(true);
        try {
            // Note: 'store_address' is intentionally excluded from the update profile call 
            // because the column does not exist in the database table.
            await updateVendorProfile(currentVendor.id, { 
                store_name: storeName, 
                profile_image: storeLogo,
                phone: storePhone,
                owner_name: currentVendor.owner_name
            });
            alert('Store profile updated successfully!');
            navigate('/vendor');
        } catch (err: any) {
            console.error('[VendorProfile] Update Error:', err);
            alert(`Failed to update profile: ${err.message || 'Unknown server error'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!currentVendor) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-text-muted font-bold text-xs uppercase tracking-widest">Loading Store Profile...</p>
            </div>
        );
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
                            <img src={logoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName || 'V')}&background=FF8A00&color=fff`} alt="Logo Preview" className="w-32 h-32 rounded-3xl object-cover bg-background border-4 border-white shadow-2xl transition-transform group-hover:scale-105" />
                            <input type="file" id="logoUpload" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUpdating} />
                            <label htmlFor="logoUpload" className="absolute -bottom-2 -right-2 p-3 bg-accent text-white rounded-2xl shadow-xl cursor-pointer hover:bg-orange-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </label>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-text-main tracking-tight italic uppercase">{storeName || 'My Store'}</p>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Vendor ID: {currentVendor.id}</p>
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
                                disabled={isUpdating}
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
                                disabled={isUpdating}
                                placeholder="+91 XXXX XXX XXX"
                                className={inputClasses} 
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Business Email</label>
                            <input 
                                type="email" 
                                value={currentVendor.email} 
                                readOnly
                                className={`${inputClasses} bg-gray-100 cursor-not-allowed`} 
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Warehouse / Pickup Address (Current session only)</label>
                            <textarea 
                                value={storeAddress} 
                                onChange={(e) => setStoreAddress(e.target.value)} 
                                required 
                                disabled={isUpdating}
                                rows={3}
                                placeholder="Full pickup address for couriers..."
                                className={`${inputClasses} resize-none`} 
                            />
                            <p className="text-[8px] text-text-muted italic mt-1">* Note: Pickup address is used for manifest generation and isn't stored in basic profile.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-border">
                        <button type="button" onClick={() => navigate('/vendor')} disabled={isUpdating} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all">Cancel</button>
                        <button type="submit" disabled={isUpdating} className="bg-accent text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50">
                            {isUpdating ? 'Synchronizing...' : 'Save Profile Settings'}
                        </button>
                    </div>
                 </form>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorProfilePage;