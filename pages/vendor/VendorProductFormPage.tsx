import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';
import { useVendors } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
// Fix: Added missing import for ChevronLeftIcon
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

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
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'vendorId'>>({
    name: '',
    category: '', // This will store category ID
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    specifications: {},
    sellerInfo: '',
    returnPolicy: '30-Day Money Back Guarantee',
    warranty: '1 Year Standard Warranty',
    videoUrl: '',
    allow_online: true,
    allow_cod: true
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const resizeImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
          } else {
            if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
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

  useEffect(() => {
    if (user?.email && !currentVendor) fetchCurrentVendor(user.email);
  }, [user, currentVendor]);

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit) {
        // Find category ID for the existing product name
        const cat = categories.find(c => c.name === productToEdit.category);
        setFormData({ 
            ...productToEdit, 
            category: cat ? cat.id.toString() : '' 
        });
        setHighlightsText((productToEdit.highlights || []).join('\n'));
        setSpecsText(Object.entries(productToEdit.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
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

  // Fixed handleImageChange: cast files to File[] to satisfy type requirements for resizeImage
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Cast FileList conversion to explicit File[] to avoid unknown type errors
      const files = Array.from(e.target.files) as File[];
      const processedImages: string[] = [];
      for (const file of files) {
        const compressed = await resizeImage(file);
        processedImages.push(compressed);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...processedImages].slice(0, 5) }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const setAsCover = (index: number) => {
    setFormData(prev => {
        const newImages = [...prev.images];
        const [cover] = newImages.splice(index, 1);
        return { ...prev, images: [cover, ...newImages] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[VendorForm] Submitting Category ID:", formData.category);
    
    if (!currentVendor) { alert("Vendor profile not loaded."); return; }
    if (formData.images.length === 0) { alert("At least one image is required."); return; }
    if (!formData.allow_online && !formData.allow_cod) { alert("Select a payment method."); return; }

    setIsSubmitting(true);
    try {
        const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
        const finalSpecs: { [key: string]: string } = {};
        specsText.split('\n').forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) finalSpecs[parts[0].trim()] = parts[1].trim();
        });

        const finalData = { 
            ...formData, 
            vendor_id: currentVendor.id,
            highlights: finalHighlights, 
            specifications: finalSpecs 
        };

        if (isEditing) {
          await updateProduct({ ...finalData as any, id: parseInt(id), status: 'approved' });
          showToast("Listing Updated!");
        } else {
          await addProduct({ ...finalData, status: 'approved' });
          showToast("Product Published!");
        }
        setTimeout(() => navigate('/vendor/products'), 1500);
    } catch (err: any) {
        alert(err.message || "Submission failed.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10 max-w-5xl mx-auto">
      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/vendor/products')} className="p-3 bg-surface rounded-2xl hover:bg-white transition-all shadow-sm border border-border">
              <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">
            {isEditing ? 'Edit Listing' : 'New Listing'}
          </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Basic Identity</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Product Title</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="e.g., Signature Suede Loafers" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Product Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Inventory Level</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Selling Price (₹)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">MRP / Old Price (₹)</label>
                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Description & Specs</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Detailed Catalog Content</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={`${inputClasses} resize-none`} placeholder="Elaborate on features, material, and usage..."></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Highlights (One per line)</label>
                            <textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} className={`${inputClasses} resize-none font-medium`} placeholder="• Breathable Mesh&#10;• Anti-slip Sole"></textarea>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-text-muted mb-1">Specifications (Key: Value)</label>
                            <textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={4} className={`${inputClasses} resize-none font-mono text-xs`} placeholder="Material: Leather&#10;Color: Navy Blue"></textarea>
                        </div>
                    </div>
                </div>
            </GlassmorphicCard>
        </div>

        <div className="space-y-6">
            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Gallery (Max 5)</h2>
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-surface/30 group hover:border-accent transition-colors">
                        <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={formData.images.length >= 5} />
                        <label htmlFor="imageUpload" className={`cursor-pointer block ${formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <p className="text-xs font-black uppercase tracking-tighter text-text-main">Add Assets</p>
                            <p className="text-[10px] text-text-muted mt-1">{5 - formData.images.length} slots remaining</p>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative group p-2 bg-surface rounded-xl border border-border flex items-center gap-3">
                                <img src={image} className="w-16 h-16 object-cover rounded-lg border border-border bg-white" alt={`product ${index}`} />
                                <div className="flex-grow">
                                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest">{index === 0 ? 'Cover Image' : `View ${index + 1}`}</p>
                                    <div className="flex gap-2 mt-1">
                                        {index !== 0 && (
                                            <button type="button" onClick={() => setAsCover(index)} className="text-[8px] font-black uppercase text-accent hover:underline">Mark Cover</button>
                                        )}
                                        <button type="button" onClick={() => removeImage(index)} className="text-[8px] font-black uppercase text-red-500 hover:underline">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Policy & Modes</h2>
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-surface rounded-xl border border-border">
                        <input type="checkbox" name="allow_online" checked={formData.allow_online} onChange={handleChange} className="w-5 h-5 rounded border-gray-600 text-accent" />
                        <span className="text-xs font-bold text-text-main group-hover:text-accent transition-colors">Accept Online Pay</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-surface rounded-xl border border-border">
                        <input type="checkbox" name="allow_cod" checked={formData.allow_cod} onChange={handleChange} className="w-5 h-5 rounded border-gray-600 text-accent" />
                        <span className="text-xs font-bold text-text-main group-hover:text-accent transition-colors">Accept Cash (COD)</span>
                    </label>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50">
                        {isSubmitting ? 'Processing...' : (isEditing ? 'Sync Changes' : 'Go Live Now')}
                    </button>
                    <button type="button" onClick={() => navigate('/vendor/products')} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-surface rounded-2xl transition-all">Discard</button>
                </div>
            </GlassmorphicCard>
        </div>
      </form>
    </div>
  );
};

export default VendorProductFormPage;