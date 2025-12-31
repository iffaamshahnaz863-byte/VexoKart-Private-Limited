import React from 'react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstAmount = Number((subtotal * 0.18).toFixed(2));
  const finalTotal = Number((subtotal + gstAmount).toFixed(2));

  const isCOD = order.payment_mode === 'Cash on Delivery';
  const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

  // Group items by vendor name for the "Sold By" requirement
  const groupedItems = order.items.reduce((acc, item) => {
    const vName = item.vendorName || 'Unknown Seller';
    if (!acc[vName]) acc[vName] = [];
    acc[vName].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white" onClick={onClose}>
      <div 
        className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10" id="invoice-content">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">TAX INVOICE</h1>
                    <div className="mt-4 space-y-4">
                        {Object.keys(groupedItems).map((vendorName, idx) => (
                            <div key={idx}>
                                <p className="text-[10px] font-black uppercase text-gray-400">Sold By</p>
                                <p className="font-bold text-gray-900">{vendorName}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-tighter">Authorized Partner</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center ml-auto mb-4 print:hidden">
                         <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"><path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Order ID</p>
                    <p className="font-mono font-bold text-gray-900">#{order.id}</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 mt-2">Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="border-t border-gray-100 my-8"></div>

            <div className="grid grid-cols-2 gap-12 text-sm mb-10">
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Billed To</p>
                    <p className="font-black text-gray-900 uppercase italic tracking-tight">{order.shippingAddress?.fullName || 'Valued Customer'}</p>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                        {order.shippingAddress?.street}<br/>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zip}
                    </p>
                    <p className="font-bold text-accent mt-1">{order.shippingAddress?.phone}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Payment Details</p>
                    <div className="space-y-1">
                        <p className="text-gray-900 font-bold">Method: {order.payment_mode}</p>
                        <p className={`font-black uppercase text-[10px] tracking-widest ${isCOD ? 'text-orange-500' : 'text-green-600'}`}>
                            Status: {paymentStatusText}
                        </p>
                        {order.paymentId && <p className="text-[10px] text-gray-400">Ref: {order.paymentId}</p>}
                    </div>
                </div>
            </div>

            <div className="mb-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="py-4 pr-4">Description</th>
                            <th className="py-4 px-4 text-center">Qty</th>
                            <th className="py-4 px-4 text-right">Price</th>
                            <th className="py-4 pl-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {order.items.map((item, idx) => (
                            <tr key={idx} className="text-sm">
                                <td className="py-4 pr-4">
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-[9px] font-black uppercase text-accent mt-0.5 tracking-tighter">Sold by: {item.vendorName || 'Unknown Seller'}</p>
                                    {item.color && <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">Color: {item.color}</span>}
                                    {item.size && <span className="text-[10px] text-gray-400 uppercase font-bold">Size: {item.size}</span>}
                                </td>
                                <td className="py-4 px-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                <td className="py-4 px-4 text-right font-medium">₹{item.price.toLocaleString()}</td>
                                <td className="py-4 pl-4 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <div className="w-full max-w-xs space-y-3">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">GST (18%)</span>
                        <span className="font-bold">₹{gstAmount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-bold text-green-600">FREE</span>
                     </div>
                     <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-gray-900">Total Payable</span>
                        <span className="text-2xl font-black text-gray-900 italic">₹{finalTotal.toLocaleString()}</span>
                     </div>
                </div>
            </div>
            
            <div className="mt-16 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">This is a system generated invoice</p>
                <div className="mt-4 flex justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                </div>
            </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-4 justify-end print:hidden">
            <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-100 transition-all"
            >
                Close
            </button>
            <button 
                onClick={handlePrint}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase shadow-xl hover:bg-black transition-all flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Download PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;