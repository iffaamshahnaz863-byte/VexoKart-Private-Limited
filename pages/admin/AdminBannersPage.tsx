
import React, { useState } from 'react';
import { useBanners } from '../../context/BannerContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminBannersPage: React.FC = () => {
  const { banners, addBanner, deleteBanner, toggleBannerStatus } = useBanners();
  const [newImage, setNewImage] = useState('');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage) return;
    addBanner(newImage);
    setNewImage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-main italic tracking-tight">Home Banners</h1>
        <p className="text-text-muted mt-1">Manage promotion images for the home page carousel.</p>
      </div>

      <GlassmorphicCard className="p-8">
        <h2 className="text-lg font-bold text-text-main mb-6 uppercase tracking-widest text-xs">Add New Banner</h2>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 hover:border-accent/50 transition-all group bg-white/[0.02]">
            {newImage ? (
              <div className="relative w-full max-w-lg aspect-[3/1] rounded-xl overflow-hidden shadow-2xl">
                <img src={newImage} className="w-full h-full object-cover" />
                <button 
                    type="button" 
                    onClick={() => setNewImage('')}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer text-center">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-text-main font-bold">Upload Image</p>
                <p className="text-text-muted text-xs mt-1">Recommended size: 1200x400px</p>
              </label>
            )}
          </div>
          <div className="flex justify-end">
            <button 
                type="submit" 
                disabled={!newImage}
                className="bg-accent text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 disabled:opacity-50 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Confirm Upload
            </button>
          </div>
        </form>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <GlassmorphicCard key={banner.id} className="group overflow-hidden">
            <div className="aspect-[3/1] relative">
              <img src={banner.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                 <button 
                    onClick={() => toggleBannerStatus(banner.id)}
                    className={`p-3 rounded-full transition-all hover:scale-110 ${banner.status === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}
                    title={banner.status === 'active' ? 'Disable Banner' : 'Enable Banner'}
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={banner.status === 'active' ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M5 13l4 4L19 7"} />
                    </svg>
                 </button>
                 <button 
                    onClick={() => deleteBanner(banner.id)}
                    className="p-3 bg-red-500 text-white rounded-full transition-all hover:scale-110"
                    title="Delete Banner"
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-surface/50">
              <div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest ${banner.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-text-muted'}`}>
                  {banner.status}
                </span>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-tight">Order: {banner.displayOrder}</p>
              </div>
              <p className="text-[10px] text-text-muted font-bold italic">{new Date(banner.createdAt).toLocaleDateString()}</p>
            </div>
          </GlassmorphicCard>
        ))}
      </div>
    </div>
  );
};

export default AdminBannersPage;
