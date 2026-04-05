
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useVendors } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

const VendorProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentVendor, fetchCurrentVendor } = useVendors();
  const { products, isLoading, deleteProduct, refreshProducts } = useProducts();
  const [init, setInit] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
        if (user?.id && !currentVendor) {
            await fetchCurrentVendor(user.id.toString());
        }
        setInit(true);
    };
    loadStore();
  }, [user, currentVendor]);

  useEffect(() => {
    if (currentVendor?.id) {
        refreshProducts(Number(currentVendor.id));
    }
  }, [currentVendor?.id]);

  const vid = currentVendor ? String(currentVendor.id) : '';

  const vendorProducts = useMemo(() => {
    return products.filter(p => String(p.vendor_id) === vid);
  }, [vid, products]);

  if ((isLoading || !init) && vendorProducts.length === 0) {
    return (
        <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/vendor')} className="p-2 -ml-2">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">My Listings</h1>
        </div>
        <button 
          onClick={() => navigate('/vendor/products/new')} 
          className="bg-accent text-white w-10 h-10 rounded-full shadow-lg shadow-accent/20 flex items-center justify-center active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendorProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4 transition-all">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                <img src={product.images[0]} className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex-grow min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{product.category}</span>
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            product.status ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                            {product.status ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1 italic uppercase tracking-tight mt-1">{product.name}</h3>
                    <div className="mt-1 flex items-center gap-3">
                         <p className="text-sm font-black text-gray-900 italic">₹{product.price.toLocaleString()}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Stock: {product.stock}</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                      className="flex-1 bg-surface py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 transition-colors"
                    >Edit</button>
                    <button 
                      onClick={() => { if(window.confirm('Archive this item?')) deleteProduct(product.id); }}
                      className="flex-1 bg-red-50 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >Archive</button>
                </div>
            </div>
          </div>
        ))}

        {vendorProducts.length === 0 && !isLoading && (
            <div className="col-span-full py-32 text-center space-y-6 opacity-40 grayscale">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <div>
                   <p className="text-sm font-black text-gray-900 uppercase italic tracking-widest">Inventory Empty</p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-tighter">Your cloud storage for listings is currently empty.</p>
                </div>
                <button onClick={() => navigate('/vendor/products/new')} className="text-accent font-black uppercase tracking-widest text-[10px] border-b-2 border-accent pb-1">Create Your First Listing</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;