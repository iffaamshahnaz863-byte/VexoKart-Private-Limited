import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product } from '../../types';
import ImageCropperModal from '../../components/ImageCropperModal';

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { user } = useAuth();
  
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '', 
    price: 0,
    original_price: 0,
    images: [],
    description: '',
    vendor_id: '',
    status: 'approved',
    highlights: [],
    stock: 10,
    specifications: {},
    allow_online: true,
    allow_cod: true
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  
  // Cropper Queue States
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-50";

  useEffect(() => {
    if (user && !isEditing && !formData.vendor_id) {
      setFormData((prev: any) => ({ ...prev, vendor_id: String(user.id) }));
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (isEditing) {
      const productToEdit = getProduct(parseInt(id));
      if (productToEdit) {
        setFormData({
            ...productToEdit,
            category_id: productToEdit.category_id.toString(),
            allow_online: productToEdit.payment_modes?.includes('online') ?? true,
            allow_cod: productToEdit.payment_modes?.includes('cod') ?? true
        });
        setHighlightsText((productToEdit.highlights || []).join('\n'));
        setSpecsText(Object.entries(productToEdit.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
      }
    } else if (categories.length > 0 && !formData.category_id) {
        setFormData((prev: any) => ({...prev, category_id: categories[0].id.toString()}));
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
        setFormData((prev: any) => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
        setFormData((prev: any) => ({ ...prev, [name]: ['price', 'original_price', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
    }
  };

  const validateImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 400 || img.height < 400) {
                reject(`Image "${file.name}" is too small (${img.width}x${img.height}). Min required: 400x400.`);
            } else {
                resolve(URL.createObjectURL(file));
            }
        };
        img.onerror = () => reject("Corrupted image file.");
        img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls: string[] = [];
      
      for (const file of files) {
          try {
              const url = await validateImage(file);
              urls.push(url);
          } catch (err: any) {
              alert(err);
          }
      }

      if (urls.length > 0) {
        setTotalInQueue(urls.length);
        setCurrentCropIndex(0);
        setCropQueue(urls);
      }
      
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    setFormData((prev: any) => ({ ...prev, images: [...prev.images, croppedBase64] }));
    
    if (currentCropIndex < cropQueue.length - 1) {
        setCurrentCropIndex(prev => prev + 1);
    } else {
        setCropQueue([]);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.images.length === 0) { alert("Please upload at least one image."); return; }
    if (!formData.allow_online && !formData.allow_cod) { alert("Select at least one payment method."); return; }
    if (!formData.vendor_id) { alert("System error: Admin ID missing."); return; }

    setIsSubmitting(true);
    try {
      const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
      const finalSpecs: { [key: string]: string } = {};
      specsText.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) finalSpecs[parts[0].trim()] = parts[1].trim();
      });

      const payment_modes = [];
      if (formData.allow_online) payment_modes.push('online');
      if (formData.allow_cod) payment_modes.push('cod');

      const finalData = { 
        ...formData, 
        highlights: finalHighlights, 
        specifications: finalSpecs,
        payment_modes,
        category_id: Number(formData.category_id)
      };

      if (isEditing) {
        await updateProduct({ ...finalData, id: parseInt(id) } as Product);
      } else {
        await addProduct(finalData);
      }
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {cropQueue.length > 0 && (
          <ImageCropperModal 
            image={cropQueue[currentCropIndex]} 
            queueCount={currentCropIndex + 1}
            totalInQueue={totalInQueue}
            title="Standardize Product Image"
            onCropComplete={handleCropComplete}
            onCancel={() => setCropQueue([])}
          />
      )}

      <h1 className="text-3xl font-black text-text-main uppercase italic mb-6">{isEditing ? 'Edit Catalog Entry' : 'Create New Inventory'}</h1>
      <GlassmorphicCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Product Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} /></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Category</label><select name="category_id" value={formData.category_id} onChange={handleChange} disabled={isSubmitting} className={inputClasses}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} /></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Original (₹)</label><input type="number" name="original_price" value={formData.original_price} onChange={handleChange} disabled={isSubmitting} className={inputClasses} /></div>
                 <div><label className="block text-[10px] font-black uppercase text-text-muted">Stock Level</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} /></div>
            </div>

            <div><label className="block text-[10px] font-black uppercase text-text-muted">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows={4} disabled={isSubmitting} className={inputClasses}></textarea></div>
            
            <div className="p-4 bg-surface rounded-2xl border border-border">
                <label className="block text-[10px] font-black uppercase text-text-muted mb-3">Product Gallery</label>
                <div className="flex flex-wrap gap-4">
                    {formData.images.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                            <img src={image} alt={`preview ${index}`} className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md"/>
                            {!isSubmitting && <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform">&times;</button>}
                        </div>
                    ))}
                    {!isSubmitting && (
                        <div className="relative">
                            <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            <label htmlFor="imageUpload" className="w-24 h-24 cursor-pointer bg-white border-2 border-dashed border-accent/30 rounded-xl flex flex-col items-center justify-center text-accent hover:bg-accent/5 transition-all group">
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-[8px] font-black uppercase mt-1">Add Visuals</span>
                            </label>
                        </div>
                    )}
                </div>
                <p className="text-[9px] text-text-muted mt-3 italic">* Minimum resolution: 400x400px. High quality 1:1 ratio images only.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-4 border-b border-border pb-1">Payment Options</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="allow_online" checked={formData.allow_online} onChange={handleChange} disabled={isSubmitting} className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent bg-surface"/><span className="text-xs font-bold text-text-main">Digital</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="allow_cod" checked={formData.allow_cod} onChange={handleChange} disabled={isSubmitting} className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent bg-surface"/><span className="text-xs font-bold text-text-main">COD</span></label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Highlights (per line)</label><textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} disabled={isSubmitting} className={inputClasses} placeholder="e.g.&#10;Premium Design"></textarea></div>
                <div><label className="block text-[10px] font-black uppercase text-text-muted">Specifications (Key: Value)</label><textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={4} disabled={isSubmitting} className={inputClasses} placeholder="e.g.&#10;Color: Black"></textarea></div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate('/admin/products')} disabled={isSubmitting} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase text-text-secondary hover:bg-surface">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Synchronizing...' : (isEditing ? 'Sync Changes' : 'Go Live')}
                </button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminProductFormPage;