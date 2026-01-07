import React, { useMemo } from 'react';
import { useVendors } from '../../context/VendorContext';
import { useOrders } from '../../context/OrderContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminPayoutsPage: React.FC = () => {
    const { vendors } = useVendors();
    const { orders } = useOrders();

    const pendingRequests = useMemo(() => {
        // Simulation of withdrawal logic
        return vendors.filter(v => (v.wallet_balance || 0) > 5000).map(v => ({
            id: `WDL-${v.id}-${Date.now().toString().slice(-4)}`,
            vendor: v,
            amount: v.wallet_balance || 0,
            date: new Date().toISOString(),
            status: 'Pending Verification'
        }));
    }, [vendors]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Settlement<br/><span className="text-accent">Ledger</span></h1>
                    <p className="text-gray-400 font-bold text-sm mt-2">Authorization panel for vendor capital withdrawals.</p>
                </div>
                <div className="flex gap-4">
                     <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Liability Queue</p>
                        <p className="text-xl font-black text-gray-900 italic">₹{pendingRequests.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}</p>
                     </div>
                </div>
            </div>

            <GlassmorphicCard className="p-0 border-none bg-white shadow-premium overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                            <th className="p-6">Transaction Node</th>
                            <th className="p-6">Beneficiary</th>
                            <th className="p-6">Requested Amt</th>
                            <th className="p-6">Submission</th>
                            <th className="p-6 text-right">Gatekeeper</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pendingRequests.map(req => (
                            <tr key={req.id} className="hover:bg-accent/[0.01] transition-colors">
                                <td className="p-6">
                                    <p className="font-mono font-black text-gray-900 text-xs">#{req.id}</p>
                                    <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter mt-1 inline-block">Review Required</span>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-gray-900 uppercase italic text-sm">{req.vendor.store_name}</p>
                                    <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase">ID: VND-{req.vendor.id}</p>
                                </td>
                                <td className="p-6">
                                    <p className="text-xl font-black text-gray-900 italic tracking-tighter">₹{req.amount.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Gross Balance</p>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-bold text-gray-700">{new Date(req.date).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </td>
                                <td className="p-6 text-right space-x-3">
                                    <button 
                                        className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
                                        onClick={() => alert("Bank Transfer Initiated")}
                                    >Approve</button>
                                    <button 
                                        className="bg-red-50 text-red-500 border border-red-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        onClick={() => alert("Withdrawal Rejected - Auditor Note Required")}
                                    >Decline</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pendingRequests.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                             <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">No pending settlements found</p>
                    </div>
                )}
            </GlassmorphicCard>
        </div>
    );
};

export default AdminPayoutsPage;