
import React, { useState } from 'react';
import { useBanners } from '../../context/BannerContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import Toast from '../../components/Toast';

const AdminBannersPage: React.FC = () => {
  const { banners, addBanner, deleteBanner, toggleBannerStatus, refreshBanners } = useBanners();
  const [newImage, setNewImage] = useState('');

  React.useEffect(() => {
    refreshBanners({ status: undefined });
  }, []);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBanners();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage || !title) {
        showToast("Image and Title are required");
        return;
    }
    
    setIsSubmitting(true);
    try {
        await addBanner(newImage, title);
        await refreshBanners(); // Force sync
        setNewImage('');
        setTitle('');
        showToast("Banner added successfully!");
    } catch (err: any) {
        showToast(err.message || "Failed to add banner");
    } finally {
        setIsSubmitting(false);
    }
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
      <Toast isVisible={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight">Home Banners</h1>
          <p className="text-text-muted mt-1">Manage promotion images for the home page carousel.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="p-3 bg-surface border border-border text-text-secondary rounded-xl hover:text-accent transition-all disabled:opacity-50"
          title="Force Sync from DB"
        >
          <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M22 3A10.03 10.03 0 0112 20a9.93 9.93 0 01-7-3m7 5a10 10 0 01-10-10 9.93 9.93 0 013-7" />
          </svg>
        </button>
      </div>

      <GlassmorphicCard className="p-8">
        <h2 className="text-lg font-bold text-text-main mb-6 uppercase tracking-widest text-xs">Add New Banner</h2>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Banner Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-surface text-text-main border border-border rounded-lg p-3 focus:border-accent outline-none"
                        placeholder="e.g., Summer Collection 2024"
                    />
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 hover:border-accent/50 transition-all group bg-white/[0.02] h-40">
                    {newImage ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
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
                        <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <p className="text-text-main font-bold text-sm">Upload Image</p>
                    </label>
                    )}
                </div>
             </div>
             {newImage && (
                 <div className="hidden md:block">
                     <p className="text-[10px] font-black uppercase text-text-muted mb-2">Live Preview</p>
                     <div className="w-full aspect-[3/1] bg-surface rounded-xl overflow-hidden border border-border relative">
                        <img src={newImage} className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-6">
                            <h3 className="text-white font-black text-xl italic drop-shadow-lg">{title || 'Your Title Here'}</h3>
                        </div>
                     </div>
                 </div>
             )}
          </div>
          
          <div className="flex justify-end">
            <button 
                type="submit" 
                disabled={!newImage || !title || isSubmitting}
                className="bg-accent text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 disabled:opacity-50 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {isSubmitting ? 'Processing...' : 'Confirm & Publish'}
            </button>
          </div>
        </form>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <GlassmorphicCard key={banner.id} className="group overflow-hidden">
            <div className="aspect-[3/1] relative">
              <img src={banner.image_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                 <button 
                    onClick={() => toggleBannerStatus(banner.id, banner.status)}
                    className={`p-3 rounded-full transition-all hover:scale-110 ${banner.status ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={banner.status ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M5 13l4 4L19 7"} />
                    </svg>
                 </button>
                 <button 
                    onClick={() => deleteBanner(banner.id)}
                    className="p-3 bg-red-500 text-white rounded-full transition-all hover:scale-110"
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-surface/50">
              <div>
                <p className="font-bold text-text-main text-sm truncate max-w-[200px]">{banner.title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] uppercase font-black tracking-widest ${banner.status ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-text-muted'}`}>
                    {banner.status ? 'Active' : 'Hidden'}
                    </span>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight">Pos: {banner.display_order}</p>
                </div>
              </div>
              <p className="text-[9px] text-text-muted font-bold italic">{new Date(banner.created_at).toLocaleDateString()}</p>
            </div>
          </GlassmorphicCard>
        ))}
      </div>
    </div>
  );
};

export default AdminBannersPage;
