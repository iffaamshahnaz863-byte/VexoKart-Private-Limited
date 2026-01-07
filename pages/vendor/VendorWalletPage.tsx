
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '../../context/VendorContext';
import { useOrders } from '../../context/OrderContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const VendorWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentVendor } = useVendors();
    const { orders } = useOrders();
    
    const [withdrawalModal, setWithdrawalModal] = useState(false);

    const vid = currentVendor ? String(currentVendor.id) : '';

    const vendorOrders = useMemo(() => {
        return orders.filter(order => 
            order.items && order.items.some((item: any) => String(item.vendor_id) === vid)
        );
    }, [vid, orders]);

    const stats = useMemo(() => {
        const delivered = vendorOrders.filter(o => o.status === 'Delivered');
        const inTransit = vendorOrders.filter(o => ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status));
        
        const settled = delivered.reduce((sum, o) => {
             const items = o.items.filter((item: any) => String(item.vendor_id) === vid);
             return sum + items.reduce((iSum: number, i: any) => iSum + (i.price * i.quantity), 0);
        }, 0);

        const pending = inTransit.reduce((sum, o) => {
            const items = o.items.filter((item: any) => String(item.vendor_id) === vid);
            return sum + items.reduce((iSum: number, i: any) => iSum + (i.price * i.quantity), 0);
        }, 0);

        return { settled, pending };
    }, [vendorOrders, vid]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24 animate-in fade-in duration-300">
             <div className="p-4 flex items-center gap-3 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-40">
                <button onClick={() => navigate('/vendor')} className="p-2 -ml-2">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Business Wallet</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-2">Withdrawable Capital</p>
                    <h2 className="text-5xl font-black italic tracking-tighter mb-8 leading-none">₹{stats.settled.toLocaleString()}</h2>
                    
                    <div className="flex gap-4">
                         <button 
                            onClick={() => alert("Withdrawal feature coming soon!")}
                            className="bg-white text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-white/10"
                         >
                            Withdraw to Bank
                         </button>
                    </div>
                </div>

                {/* Sub Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Pending Clearance</p>
                        <p className="text-xl font-black text-orange-500 italic tracking-tighter">₹{stats.pending.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Earned</p>
                        <p className="text-xl font-black text-green-500 italic tracking-tighter">₹{(stats.settled + stats.pending).toLocaleString()}</p>
                    </div>
                </div>

                {/* Rules Info */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex gap-4 items-start">
                    <div className="p-2 bg-blue-500 rounded-xl text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-black text-blue-900 uppercase italic">Settlement Protocol</p>
                        <p className="text-[9px] text-blue-700 font-bold uppercase mt-1 leading-relaxed">Earnings are credited to your Available Balance exactly <span className="text-blue-900">48 hours</span> after successful customer delivery confirmation.</p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2 italic">Ledger Activity</h3>
                    {vendorOrders.length > 0 ? (
                        <div className="space-y-3">
                            {vendorOrders.slice(0, 10).map((o: any) => (
                                <div key={o.id} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase italic">Order #{o.id.slice(-6)}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{new Date(o.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 italic">₹{o.vendorSubtotal.toLocaleString()}</p>
                                        <p className={`text-[8px] font-black uppercase ${o.status === 'Delivered' ? 'text-green-500' : 'text-orange-500'}`}>
                                            {o.status === 'Delivered' ? 'Settled' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-300">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Ledger Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorWalletPage;