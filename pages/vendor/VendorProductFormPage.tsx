
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { Product, ProductVariant } from '../../types';
import { useVendors } from '../../context/VendorContext';
import Toast from '../../components/Toast';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import ImageCropperModal from '../../components/ImageCropperModal';

const VendorProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { currentVendor } = useVendors();

  const isEditing = id !== undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });
  
  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '', 
    price: 0,
    original_price: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    specifications: {},
    payment_modes: ['online', 'cod'],
    variants: [] as ProductVariant[]
  });

  const [highlightsText, setHighlightsText] = useState('');
  const [newVarType, setNewVarType] = useState<'color' | 'size'>('color');
  const [newVarName, setNewVarName] = useState('');
  const [newVarImage, setNewVarImage] = useState('');

  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [isAddingToVariant, setIsAddingToVariant] = useState(false);

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-border rounded-xl p-3 transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:opacity-50";

  useEffect(() => {
    if (isEditing) {
      const p = getProduct(parseInt(id));
      if (p) {
        setFormData({ 
            ...p, 
            category_id: p.category_id.toString(),
            variants: p.variants || [],
            payment_modes: p.payment_modes || ['online', 'cod']
        });
        setHighlightsText((p.highlights || []).join('\n'));
      }
    } else if (categories.length > 0) {
      // Ensure initial category is set from categories ID
      setFormData(prev => ({...prev, category_id: categories[0].id.toString()}));
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
        const modes = [...formData.payment_modes];
        if ((e.target as any).checked) modes.push(value);
        else {
            const idx = modes.indexOf(value);
            if (idx > -1) modes.splice(idx, 1);
        }
        setFormData(prev => ({ ...prev, payment_modes: modes }));
    } else {
        setFormData(prev => ({ ...prev, [name]: ['price', 'original_price', 'stock'].includes(name) ? parseFloat(value) || 0 : value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, forVariant = false) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls = files.map(file => URL.createObjectURL(file));
      setIsAddingToVariant(forVariant);
      setCropQueue(urls);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (isAddingToVariant) {
        setNewVarImage(croppedBase64);
    } else {
        setFormData(prev => ({ 
            ...prev, 
            images: Array.isArray(prev.images) ? [...prev.images, croppedBase64] : [croppedBase64] 
        }));
    }
    
    if (currentCropIndex < cropQueue.length - 1) {
        setCurrentCropIndex(prev => prev + 1);
    } else {
        setCropQueue([]);
        setIsAddingToVariant(false);
    }
  };

  const addVariant = () => {
    if (!newVarName) return;
    const variant: ProductVariant = {
        type: newVarType,
        name: newVarType === 'color' ? newVarName : 'Size',
        value: newVarName,
        image: newVarImage || undefined
    };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), variant] }));
    setNewVarName('');
    setNewVarImage('');
  };

  const removeVariant = (idx: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // MANDATORY VENDOR VALIDATION
    if (!currentVendor) { 
        alert("Vendor identity missing. Please re-login."); 
        return; 
    }
    if (currentVendor.status !== 'approved') {
        alert("Your store must be approved to list products.");
        return;
    }

    if (!formData.images || formData.images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
        const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
        
        // CONSTRUCT SECURE PAYLOAD
        const payload = { 
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            original_price: Number(formData.original_price || formData.price),
            stock: Number(formData.stock),
            // FIXED: Send numeric category_id from the categories table
            category_id: Number(formData.category_id),
            images: formData.images,
            variants: formData.variants || [],
            highlights: finalHighlights,
            payment_modes: formData.payment_modes,
            vendor_id: Number(currentVendor.id), // MANDATORY: Use Numeric Vendor ID
            status: 'approved', // MANDATORY: Default to approved for trusted vendors
        };

        if (isEditing) {
            await updateProduct({ ...payload, id: parseInt(id) } as any);
        } else {
            await addProduct(payload);
        }
        
        setToast({ show: true, message: 'Inventory Updated Successfully', type: 'success' });
        setTimeout(() => navigate('/vendor/products'), 1000);
    } catch (err: any) {
        console.error("[Submission Error]", err);
        alert(`Failed to save: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto p-4">
      {cropQueue.length > 0 && (
          <ImageCropperModal 
            image={cropQueue[currentCropIndex]} 
            onCropComplete={handleCropComplete}
            onCancel={() => { setCropQueue([]); setIsAddingToVariant(false); }}
            title={isAddingToVariant ? "Crop Variant Image" : "Crop Gallery Image"}
          />
      )}

      <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/vendor/products')} className="p-3 bg-white rounded-2xl border border-border shadow-sm"><ChevronLeftIcon className="w-5 h-5" /></button>
          <h1 className="text-3xl font-black text-text-main italic uppercase">List Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Basic Info</h2>
                <div className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Product Title" className={inputClasses} />
                    <div className="grid grid-cols-2 gap-4">
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClasses}>
                            {/* FIXED: Dropdown value is ID, label is name */}
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required placeholder="Stock Count" className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="Price (₹)" className={inputClasses} />
                        <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} placeholder="MRP (₹)" className={inputClasses} />
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Description" className={inputClasses}></textarea>
                </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Images & Variants</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {formData.images && formData.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border relative group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                        </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-surface transition-colors">
                        <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, false)} className="hidden" />
                        <div className="text-center">
                            <svg className="w-6 h-6 text-text-muted mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span className="text-[8px] font-black uppercase mt-1 block">Add Photo</span>
                        </div>
                    </label>
                </div>

                <div className="p-4 bg-surface rounded-2xl border border-border space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {formData.variants && formData.variants.map((v: ProductVariant, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
                                {v.image && <img src={v.image} className="w-5 h-5 rounded-full object-cover" />}
                                <span className="text-[10px] font-bold uppercase">{v.value}</span>
                                <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 font-bold ml-1">&times;</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={newVarType} onChange={(e) => setNewVarType(e.target.value as any)} className="bg-white border border-border rounded-lg text-[10px] font-black uppercase px-2 h-10">
                            <option value="color">Color</option>
                            <option value="size">Size</option>
                        </select>
                        <input type="text" value={newVarName} onChange={(e) => setNewVarName(e.target.value)} placeholder="Variant Name" className="flex-grow bg-white border border-border rounded-lg p-2 text-xs h-10" />
                        <button type="button" onClick={addVariant} className="bg-accent text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase h-10">Add</button>
                    </div>
                </div>
            </GlassmorphicCard>
        </div>

        <div className="space-y-6">
            <GlassmorphicCard className="p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 border-b border-border pb-2">Finalization</h2>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase text-text-muted mb-2">Payment Modes</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" value="online" checked={formData.payment_modes.includes('online')} onChange={handleChange} className="w-5 h-5 rounded text-accent" /><span className="text-xs font-bold uppercase">Online</span></label>
                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" value="cod" checked={formData.payment_modes.includes('cod')} onChange={handleChange} className="w-5 h-5 rounded text-accent" /><span className="text-xs font-bold uppercase">COD</span></label>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50">
                        {isSubmitting ? 'Processing...' : (isEditing ? 'Sync Changes' : 'Confirm & Go Live')}
                    </button>
                </div>
            </GlassmorphicCard>
        </div>
      </form>
    </div>
  );
};

export default VendorProductFormPage;
