
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const CANCELLATION_REASONS = [
    "Ordered by mistake",
    "Need to change delivery address",
    "Found a cheaper price elsewhere",
    "Expected delivery time is too long",
    "Want to change payment method",
    "Bought another product instead",
    "Other reason"
];

const CancelOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getOrderById, updateOrderStatus } = useOrders();
    const [selectedReason, setSelectedReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const order = useMemo(() => id ? getOrderById(id) : null, [id, getOrderById]);
    const firstItem = useMemo(() => order?.items?.[0], [order]);

    if (!order || !firstItem) {
        return (
            <div className="min-h-screen bg-surface p-4 text-center">
                <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 -mx-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)}><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
                    <h1 className="text-base font-black text-gray-900 uppercase italic tracking-tight">Order Error</h1>
                </div>
                <div className="mt-20">
                    <h2 className="text-lg font-bold text-red-500">Invalid Order</h2>
                    <p className="text-sm text-text-muted mt-2">This order cannot be cancelled as it contains no items.</p>
                    <button onClick={() => navigate('/orders')} className="mt-6 bg-primary text-white font-bold px-6 py-2 rounded-lg">
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const handleCancel = async () => {
        if (!selectedReason || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await updateOrderStatus(order.id, 'Cancelled', { note: `User Cancellation: ${selectedReason}` });
            navigate(`/order/${order.id}`, { replace: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface pb-32">
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)}><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
                <h1 className="text-base font-black text-gray-900 uppercase italic tracking-tight">Cancel Commitment</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Item Summary */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                    <img src={firstItem.image} className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100" />
                    <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase italic leading-tight">{firstItem.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">Settlement: ₹{order.total.toLocaleString()} ({order.payment_method})</p>
                    </div>
                </div>

                {/* Reason Selector */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest italic mb-4 border-b border-gray-50 pb-2">Mandatory: Reason for Cancellation</h3>
                    <div className="space-y-4">
                        {CANCELLATION_REASONS.map(reason => (
                            <label key={reason} className="flex items-center gap-4 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="reason" 
                                    value={reason} 
                                    checked={selectedReason === reason} 
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-5 h-5 accent-accent"
                                />
                                <span className={`text-xs font-bold transition-colors ${selectedReason === reason ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{reason}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Warnings */}
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                    <p className="text-xs font-bold text-orange-900 leading-relaxed italic">
                        "Wait! By cancelling, you will lose the current promotional pricing and any applied discount of ₹{order.discount_amount?.toLocaleString() || '0'}. This action is irreversible."
                    </p>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
                <button 
                    onClick={handleCancel}
                    disabled={!selectedReason || isSubmitting}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:shadow-none"
                >
                    {isSubmitting ? 'Processing Revocation...' : 'Confirm Cancellation'}
                </button>
            </div>
        </div>
    );
};

export default CancelOrderPage;
