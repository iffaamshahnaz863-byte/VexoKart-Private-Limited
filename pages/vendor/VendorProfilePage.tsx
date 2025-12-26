
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

    const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";
    
    useEffect(() => {
        if (vendor) {
            setStoreName(vendor.storeName);
            setStoreLogo(vendor.storeLogo);
            setLogoPreview(vendor.storeLogo);
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
            updateVendorProfile(vendor.id, { storeName, storeLogo });
            alert('Profile updated successfully!');
            navigate('/vendor');
        }
    };

    if (!vendor) {
        return <div className="text-center p-8">Loading vendor profile...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-main mb-6">Store Profile</h1>
            <GlassmorphicCard className="p-6 max-w-2xl mx-auto">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Store Logo</label>
                        <div className="flex items-center gap-4">
                            <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 rounded-full object-cover bg-background border-2 border-gray-600" />
                            <input type="file" id="logoUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <label htmlFor="logoUpload" className="cursor-pointer bg-surface text-text-main font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-700">
                                Change Logo
                            </label>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary" htmlFor="storeName">Store Name</label>
                        <input 
                            id="storeName" 
                            type="text" 
                            value={storeName} 
                            onChange={(e) => setStoreName(e.target.value)} 
                            required 
                            className={inputClasses} 
                        />
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => navigate('/vendor')} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
                        <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">Save Changes</button>
                    </div>
                 </form>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorProfilePage;