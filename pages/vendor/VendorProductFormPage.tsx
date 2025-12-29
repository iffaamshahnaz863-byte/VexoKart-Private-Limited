import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product, ProductVariantColor } from '../../types';
import { useVendors } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import ImageCropperModal from '../../components/ImageCropperModal';

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { currentVendor, fetchCurrentVendor } = useVendors();
  const { user } = useAuth();

  const isEditing = id !== undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });
  
  const [formData, setFormData] = useState<any>({
    name: '',
    category: '', 
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    specifications: {},
    sellerInfo: '',
    allow_online: true,
    allow_cod: true,
    colors: [] as ProductVariantColor[],
    sizes: [] as string[]
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorImage, setNewColorImage] = useState('');

  // Cropper States
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);
  const [targetVariantIdx, setTargetVariantIdx] = useState<number | null>(null);
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-border rounded-xl p-3 transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:opacity-50";

  useEffect(() => {
    if (user?.email && !currentVendor) fetchCurrentVendor(user.email);
  }, [user, currentVendor]);

  useEffect(() => {
    if (isEditing) {
      const p = getProduct(parseInt(id));
      if (p) {
        const cat = categories.find(c => c.name === p.category);
        setFormData({ 
            ...p, 
            category: cat ? cat.id.toString() : p.category,
            allow_online: p.allow_online ?? true,
            allow_cod: p.allow_cod ?? true,
            colors: p.colors || [],
            sizes: p.sizes || []
        });
        setHighlightsText((p.highlights || []).join('\n'));
      }
    } else if (categories.length > 0) {
      setFormData(prev => ({...prev, category: categories[0].id.toString()}));
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: ['price', 'originalPrice', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls = files.map(file => URL.createObjectURL(file));
      setTargetVariantIdx(null); // Default gallery
      setTotalInQueue(urls.length);
      setCurrentCropIndex(0);
      setCropQueue(urls);
      e.target.value = '';
    }
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          setTargetVariantIdx(-1); // Special code for new variant
          setCropQueue([url]);
          setTotalInQueue(1);
          setCurrentCropIndex(0);
          e.target.value = '';
      }
  }

  const handleCropComplete = (croppedBase64: string) => {
    if (targetVariantIdx === -1) {
        setNewColorImage(croppedBase64);
    } else if (targetVariantIdx !== null) {
        // Update existing variant image if needed (not implemented for simplicity)
    } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, croppedBase64] }));
    }
    
    if (currentCropIndex < cropQueue.length - 1) {
        setCurrentCropIndex(prev => prev + 1);
    } else {
        setCropQueue([]);
        setTargetVariantIdx(null);
    }
  };

  const addColorVariant = () => {
      if (!newColorName || !newColorImage) return;
      setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: newColorName, image: newColorImage }] }));
      setNewColorName('');
      setNewColorImage('');
  };

  const removeColorVariant = (idx: number) => {
      setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  };

  const toggleSize = (size: string) => {
      setFormData(prev => {
          const current = prev.sizes || [];
          return { ...prev, sizes: current.includes(size) ? current.filter(s => s !== size) : [...current, size] };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) { alert("Please provide at least one product image."); return; }
    if (!formData.allow_online && !formData.allow_cod) { alert("Select a supported payment mode."); return; }

    setIsSubmitting(true);
    try {
        const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
        const finalData = { 
            ...formData, 
            vendor_id: currentVendor?.id,
            highlights: finalHighlights,
            status: 'approved' // Auto-approve
        };

        if (isEditing) {
          await updateProduct({ ...finalData, id: parseInt(id) });
        } else {
          await addProduct(finalData);
        }
        setToast({ show: true, message: 'Published to Marketplace!', type: 'success' });
        setTimeout(() => navigate('/vendor/products'), 1500);
    } catch (err: any) {
        alert(`Failed to save: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      {cropQueue.length > 0 && (
          <ImageCropperModal 
            image={cropQueue[currentCropIndex]} 
            queueCount={currentCropIndex + 1}
            totalInQueue={totalInQueue}
            title="Refine Asset"
            onCropComplete={handleCropComplete}
            onCancel={() => setCropQueue([])}
          />
      )}

      <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/vendor/products')} className="p-3 bg-white rounded-2xl hover:bg-surface transition-all shadow-sm border border-border">
              <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">
            {isEditing ? 'Modify Listing' : 'Marketplace Entry'}
          </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <GlassmorphicCard className="p-8 border-none bg-white">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Core Attributes</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Product Title</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} placeholder="e.g., Slim Fit Essential Shirt" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} disabled={isSubmitting} className={inputClasses}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Stock Position</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-accent mb-1 ml-1">Selling Price (₹)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Original MRP (₹)</label>
                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} disabled={isSubmitting} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-8 border-none bg-white">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Visual Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden border border-border relative group bg-surface">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            {i === 0 && <span className="absolute bottom-2 left-2 bg-accent text-[8px] font-black text-white px-2 py-0.5 rounded uppercase">Primary</span>}
                        </div>
                    ))}
                    <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-all">
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        <svg className="w-6 h-6 text-text-muted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[9px] font-black uppercase text-text-muted">Add Asset</span>
                    </label>
                </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-8 border-none bg-white">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Variants (Color & Size)</h2>
                <div className="space-y-8">
                    {/* Size Variants */}
                    <div>
                        <p className="text-[10px] font-black uppercase text-text-muted mb-3 ml-1">Available Sizes</p>
                        <div className="flex flex-wrap gap-2">
                            {SIZE_OPTIONS.map(size => (
                                <button 
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all border-2 ${formData.sizes.includes(size) ? 'border-accent bg-accent text-white' : 'border-border bg-white text-text-muted hover:border-accent'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Variants */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Color Shades</p>
                        <div className="flex flex-wrap gap-4">
                            {formData.colors.map((c: ProductVariantColor, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-surface rounded-2xl border border-border">
                                    <img src={c.image} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="text-[10px] font-black uppercase text-text-main pr-2">{c.name}</span>
                                    <button type="button" onClick={() => removeColorVariant(i)} className="text-red-500 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface/50 rounded-2xl border-2 border-dashed border-border">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-text-muted mb-1">Color Name</label>
                                <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className={inputClasses} placeholder="e.g., Midnight Blue" />
                            </div>
                            <div className="flex gap-3 items-end">
                                <div className="flex-grow">
                                    <label className="block text-[9px] font-black uppercase text-text-muted mb-1">Swatch Image</label>
                                    <label className="w-full bg-white border border-border rounded-xl p-3 flex items-center gap-2 cursor-pointer text-xs font-bold">
                                        <input type="file" accept="image/*" onChange={handleVariantImageChange} className="hidden" />
                                        {newColorImage ? 'Image Ready' : 'Select Swatch'}
                                        {newColorImage && <img src={newColorImage} className="w-4 h-4 rounded-full ml-auto" />}
                                    </label>
                                </div>
                                <button type="button" onClick={addColorVariant} className="bg-text-main text-white px-4 py-3.5 rounded-xl text-[10px] font-black uppercase">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassmorphicCard>
        </div>

        <div className="space-y-6">
            <GlassmorphicCard className="p-8 border-none bg-white">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Listing Controls</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Description Highlights</label>
                        <textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={5} className={inputClasses} placeholder="One feature per line..."></textarea>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                        <p className="text-[10px] font-black uppercase text-text-muted mb-1 ml-1">Payment Strategy</p>
                        <label className="flex items-center gap-3 p-4 bg-surface rounded-2xl cursor-pointer border border-border hover:border-accent transition-all">
                            <input type="checkbox" name="allow_online" checked={formData.allow_online} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent" />
                            <span className="text-xs font-black uppercase tracking-tighter">Digital Payment Only</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-surface rounded-2xl cursor-pointer border border-border hover:border-accent transition-all">
                            <input type="checkbox" name="allow_cod" checked={formData.allow_cod} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent" />
                            <span className="text-xs font-black uppercase tracking-tighter">Cash on Delivery</span>
                        </label>
                    </div>
                </div>
                
                <div className="mt-8">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50">
                        {isSubmitting ? 'Syncing Catalog...' : (isEditing ? 'Update Listing' : 'Publish to Store')}
                    </button>
                </div>
            </GlassmorphicCard>
        </div>
      </form>
    </div>
  );
};

export default VendorProductFormPage;