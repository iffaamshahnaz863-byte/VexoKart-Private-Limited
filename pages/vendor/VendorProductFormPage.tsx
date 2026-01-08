import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
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
  
  const initializationLocked = useRef(false);

  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '', 
    price: 0,
    original_price: 0,
    images: [],
    description: '',
    highlights: [],
    stock: 10,
    product_type: 'simple',
    is_cod_enabled: true,
    is_online_enabled: true,
    variants: [] as ProductVariant[]
  });

  const [enableSize, setEnableSize] = useState(false);
  const [enableColor, setEnableColor] = useState(false);
  const [highlightsText, setHighlightsText] = useState('');
  
  const [newVarName, setNewVarName] = useState('');
  const [newVarImage, setNewVarImage] = useState('');
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [isAddingToVariant, setIsAddingToVariant] = useState(false);

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-border rounded-2xl p-4 transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:opacity-50 text-sm font-medium";

  useEffect(() => {
    if (initializationLocked.current) return;

    if (isEditing) {
      const p = getProduct(parseInt(id));
      if (p) {
        setFormData({ 
            ...p, 
            category_id: p.category_id.toString(),
            variants: Array.isArray(p.variants) ? p.variants : [],
            product_type: p.product_type || 'simple',
            // HYDRATE STRICTLY FROM SOURCE
            is_cod_enabled: p.is_cod_enabled === true,
            is_online_enabled: p.is_online_enabled === true
        });
        setHighlightsText((p.highlights || []).join('\n'));
        setEnableSize(p.variants?.some(v => v.type === 'size') || false);
        setEnableColor(p.variants?.some(v => v.type === 'color') || false);
        initializationLocked.current = true;
      }
    } else if (categories.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        category_id: categories[0].id.toString()
      }));
      initializationLocked.current = true;
    }
  }, [id, isEditing, getProduct, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type !== 'checkbox') {
        setFormData((prev: any) => ({ 
            ...prev, 
            [name]: ['price', 'original_price', 'stock'].includes(name) ? parseFloat(value) || 0 : value 
        }));
    }
  };

  const togglePayment = (name: 'is_cod_enabled' | 'is_online_enabled') => {
    setFormData((prev: any) => ({ ...prev, [name]: !prev[name] }));
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
        setFormData((prev: any) => ({ 
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

  const addVariant = (type: 'size' | 'color') => {
    if (!newVarName) return;
    const variant: ProductVariant = {
        type,
        name: type === 'size' ? 'Size' : 'Color',
        value: newVarName,
        image: type === 'color' ? (newVarImage || undefined) : undefined
    };
    setFormData((prev: any) => ({ ...prev, variants: [...(prev.variants || []), variant] }));
    setNewVarName('');
    setNewVarImage('');
  };

  const removeVariant = (idx: number) => {
    setFormData((prev: any) => ({ ...prev, variants: prev.variants.filter((_: any, i: number) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendor) { alert("Session mismatch. Please relogin."); return; }
    if (formData.images.length === 0) { alert("Add at least one product image."); return; }
    
    // Warning if both disabled, but allow update to proceed as per requirement "dono disabled hain -> block checkout" implies this state is valid DB state
    if (!formData.is_cod_enabled && !formData.is_online_enabled) { 
        if(!confirm("You have disabled BOTH payment methods. Customers will not be able to checkout. Continue?")) return;
    }

    setIsSubmitting(true);
    try {
        const finalHighlights = highlightsText.split('\n').map(s => s.trim()).filter(Boolean);
        
        let finalVariants = [];
        if (formData.product_type === 'variant') {
            finalVariants = formData.variants.filter((v: ProductVariant) => 
                (v.type === 'size' && enableSize) || (v.type === 'color' && enableColor)
            );
        }

        const payload = { 
            ...formData,
            highlights: finalHighlights,
            variants: finalVariants,
            vendor_id: String(currentVendor.id), 
            status: 'approved',
            // PRESERVE EXACT BOOLEANS
            is_cod_enabled: formData.is_cod_enabled === true,
            is_online_enabled: formData.is_online_enabled === true
        };

        if (isEditing) {
            await updateProduct({ ...payload, id: parseInt(id) } as any);
        } else {
            await addProduct(payload);
        }
        
        setToast({ show: true, message: 'Fulfillment manifest updated.', type: 'success' });
        setTimeout(() => navigate('/vendor/products'), 1000);
    } catch (err: any) {
        alert(`Fulfillment Error: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      {cropQueue.length > 0 && (
          <ImageCropperModal 
            image={cropQueue[currentCropIndex]} 
            onCropComplete={handleCropComplete}
            onCancel={() => { setCropQueue([]); setIsAddingToVariant(false); }}
            title={isAddingToVariant ? "Variant Visual" : "Product Vision"}
          />
      )}

      <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-md pb-4 pt-1 mb-6">
          <div className="flex items-center gap-3">
              <button onClick={() => navigate('/vendor/products')} className="p-2 -ml-2">
                  <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
              </button>
              <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">
                {isEditing ? 'Sync Manifest' : 'Initialize SKU'}
              </h1>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-1">
        {/* Core Identity */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Listing Intelligence</h2>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Product Title</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Product Display Name" className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClasses}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Inventory Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputClasses} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-accent ml-2">Selling Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className={`${inputClasses} border-accent/20 bg-accent/5`} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Original MRP</label>
                  <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className={inputClasses} />
                </div>
            </div>
        </div>

        {/* Dynamic Architecting (Variants) */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Product Architecture</h2>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    type="button"
                    onClick={() => setFormData((p:any) => ({...p, product_type: 'simple'}))}
                    className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${formData.product_type === 'simple' ? 'border-accent bg-accent/5 text-accent' : 'border-gray-100 text-gray-400'}`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <span className="text-[10px] font-black uppercase">Standard</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setFormData((p:any) => ({...p, product_type: 'variant'}))}
                    className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${formData.product_type === 'variant' ? 'border-accent bg-accent/5 text-accent' : 'border-gray-100 text-gray-400'}`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span className="text-[10px] font-black uppercase">Multi-Variant</span>
                </button>
            </div>

            {formData.product_type === 'variant' && (
                <div className="pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={enableSize} onChange={(e) => setEnableSize(e.target.checked)} className="w-5 h-5 rounded text-[#F43397] focus:ring-[#F43397] border-gray-200" />
                            <span className="text-[10px] font-black uppercase text-gray-600">Sizes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={enableColor} onChange={(e) => setEnableColor(e.target.checked)} className="w-5 h-5 rounded text-[#F43397] focus:ring-[#F43397] border-gray-200" />
                            <span className="text-[10px] font-black uppercase text-gray-600">Colors</span>
                        </label>
                    </div>

                    {(enableSize || enableColor) && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newVarName} 
                                    onChange={(e) => setNewVarName(e.target.value)}
                                    placeholder={enableSize ? "Size Code" : "Color Label"}
                                    className="flex-grow bg-surface border border-gray-100 rounded-xl p-3 text-xs font-bold uppercase"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => addVariant(enableSize ? 'size' : 'color')}
                                    className="bg-gray-900 text-white px-4 rounded-xl text-[9px] font-black uppercase"
                                >Inject</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.variants.map((v: ProductVariant, idx: number) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <span className="text-[8px] font-black uppercase text-gray-400">{v.type}:</span>
                                        <span className="text-[10px] font-black uppercase text-gray-900">{v.value}</span>
                                        <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Media Control */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Visual Content</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {formData.images.map((img: string, i: number) => (
                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0 relative group">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => setFormData((p: any) => ({ ...p, images: p.images.filter((_: any, idx: number) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-md">&times;</button>
                    </div>
                ))}
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center shrink-0 cursor-pointer bg-gray-50 hover:border-accent/30 transition-all">
                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, false)} className="hidden" />
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Add Image</span>
                </label>
            </div>
        </div>

        {/* Marketing Details */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Description & Highlights</h2>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Full product description..." className={inputClasses}></textarea>
            <textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={3} placeholder="Highlights (One per line)" className={inputClasses}></textarea>
        </div>

        {/* Financial Flow */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Payment Protocol</h2>
            
            <div className="space-y-3">
                <div 
                    onClick={() => togglePayment('is_cod_enabled')}
                    className={`p-4 rounded-3xl border flex items-center justify-between transition-colors cursor-pointer ${formData.is_cod_enabled ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 grayscale opacity-70'}`}
                >
                    <div>
                        <p className="text-xs font-black text-gray-800 uppercase italic">Cash on Delivery</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Authorize doorstep settlement</p>
                    </div>
                    <div className="relative inline-flex items-center">
                        <div className={`w-11 h-6 rounded-full transition-all ${formData.is_cod_enabled ? 'bg-accent' : 'bg-gray-200'}`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all ${formData.is_cod_enabled ? 'translate-x-full border-white' : ''}`}></div>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => togglePayment('is_online_enabled')}
                    className={`p-4 rounded-3xl border flex items-center justify-between transition-colors cursor-pointer ${formData.is_online_enabled ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 grayscale opacity-70'}`}
                >
                    <div>
                        <p className="text-xs font-black text-gray-800 uppercase italic">Digital Settlement</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Enable Cards, UPI & Wallets</p>
                    </div>
                    <div className="relative inline-flex items-center">
                        <div className={`w-11 h-6 rounded-full transition-all ${formData.is_online_enabled ? 'bg-accent' : 'bg-gray-200'}`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all ${formData.is_online_enabled ? 'translate-x-full border-white' : ''}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-[#F43397] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#F43397]/30 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'ESTABLISHING HANDSHAKE...' : (isEditing ? 'SYNC CHANGES' : 'DEPLOY LISTING')}
        </button>
      </form>
    </div>
  );
};

export default VendorProductFormPage;