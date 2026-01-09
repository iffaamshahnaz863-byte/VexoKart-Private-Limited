
import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator.ts';

interface InvoiceModalProps {
  order: Order & { seller_name?: string };
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.discount_amount || 0;
  
  // Logic: 
  // Base Price -> (Items Total - Discount) = Taxable Value -> Taxable * 18% = GST -> Total
  // To keep it simple and match the total stored:
  // We assume the itemsTotal includes GST in the display price, but let's reverse calculate for the invoice format.
  // The 'finalPayable' stored in DB is inclusive of GST.
  
  const finalTotal = order.total_amount;
  const taxableValue = finalTotal / 1.18;
  const gstAmount = finalTotal - taxableValue;

  const isCOD = order.payment_mode === 'Cash on Delivery';
  const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

  const primarySeller = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    } else {
        onClose();
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);
    try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const doc = await generateInvoicePDF(order);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        if (isMobile) {
            // Mobile: Show in-app preview
            setPdfUrl(url);
        } else {
            // Desktop: Standard Download
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice_order_${order.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        console.error("Invoice generation failed:", err);
        alert("Failed to generate invoice PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col z-[300] animate-in fade-in duration-200"
        onClick={handleCloseClick}
    >
      <div 
        className="bg-white w-full h-full md:max-w-3xl md:h-[90vh] md:m-auto flex flex-col md:rounded-3xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-[310] shrink-0 no-print">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-base font-black uppercase tracking-tight italic">
                    {pdfUrl ? 'Tax Invoice Preview' : 'Digital Tax Invoice'}
                </h2>
            </div>
            <button 
                onClick={handleCloseClick}
                className="p-2.5 bg-gray-100 rounded-full text-gray-800 active:scale-90 transition-transform"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-10 bg-white relative" id="invoice-render-layer">
            {pdfUrl ? (
                <div className="w-full h-full animate-in fade-in duration-500">
                    <iframe 
                        src={pdfUrl} 
                        className="w-full h-full rounded-2xl border-none shadow-inner"
                        title="Invoice PDF Viewer"
                    />
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">TAX INVOICE</h1>
                            <div className="mt-4 border-l-4 border-accent pl-4">
                                <p className="text-[10px] font-black uppercase text-gray-400">Sold By</p>
                                <p className="font-bold text-gray-900 leading-tight">{primarySeller}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Authorized Marketplace Node</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-black uppercase text-gray-400">Reference ID</p>
                            <p className="font-mono font-bold text-gray-900">#{order.id}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 mt-2">Date of Issue</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Billed To</p>
                            <p className="font-black text-gray-900 uppercase italic tracking-tight">{order.shippingAddress?.fullName || 'Valued Customer'}</p>
                            <p className="text-gray-600 mt-1 leading-relaxed text-xs">
                                {order.shippingAddress?.street}<br/>
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zip}
                            </p>
                            <p className="font-bold text-accent mt-1 text-xs">{order.shippingAddress?.phone}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Settlement</p>
                            <div className="space-y-1">
                                <p className="text-gray-900 font-bold text-xs">Method: {order.payment_mode}</p>
                                <p className={`font-black uppercase text-[10px] tracking-widest ${isCOD ? 'text-orange-500' : 'text-green-600'}`}>
                                    Status: {paymentStatusText}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-900 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    <th className="py-4 pr-2">Items</th>
                                    <th className="py-4 px-2 text-center">Qty</th>
                                    <th className="py-4 px-2 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="text-xs">
                                        <td className="py-4 pr-2">
                                            <p className="font-bold text-gray-900 uppercase tracking-tighter">{item.name}</p>
                                            <p className="text-[9px] font-black uppercase text-accent mt-0.5">Verified Stock</p>
                                        </td>
                                        <td className="py-4 px-2 text-center font-bold text-gray-600">{item.quantity}</td>
                                        <td className="py-4 px-2 text-right font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <div className="w-full max-w-xs space-y-3">
                             <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-black uppercase">Subtotal</span>
                                <span className="font-bold">₹{itemsTotal.toLocaleString()}</span>
                             </div>
                             
                             {discount > 0 && (
                                <div className="flex justify-between text-xs text-green-600">
                                    <span className="font-black uppercase">UPI Discount</span>
                                    <span className="font-bold">- ₹{discount.toLocaleString()}</span>
                                </div>
                             )}

                             <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-black uppercase">GST (Included)</span>
                                <span className="font-bold">₹{gstAmount.toLocaleString()}</span>
                             </div>
                             
                             <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase text-gray-900 italic">Settlement Total</span>
                                <span className="text-2xl font-black text-gray-900 italic tracking-tighter">₹{finalTotal.toLocaleString()}</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-16 text-center pb-10">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300">Generated by VexoKart Fulfillment Protocol</p>
                    </div>
                </>
            )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4 shrink-0 no-print">
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-white border border-gray-300 text-gray-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                )}
                Download PDF
            </button>
            <button 
                onClick={handlePrint}
                className="flex-1 bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Manifest
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
