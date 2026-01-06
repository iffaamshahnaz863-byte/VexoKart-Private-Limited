import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { generateShippingLabelPDF } from '../utils/pdfGenerator';

const ShippingLabelPreviewModal: React.FC = () => {
    const { activeOrderForLabel, closeLabelPreview } = useOrders();
    const [isDownloading, setIsDownloading] = useState(false);

    if (!activeOrderForLabel) return null;

    const order = activeOrderForLabel;
    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    
    // Vendor details extraction
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
    const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-001';

    // Financial calculations
    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await generateShippingLabelPDF(order);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Please try the Print option.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 no-print">
            <div className="bg-white w-full max-w-2xl h-full max-h-[98vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative border border-gray-200 print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
                
                {/* Control Header (Web/App Controls Only) */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-20 no-print">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-main italic">Logistics Manifest Hub</h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">VexoKart Fulfillment Service Node</p>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="px-4 py-2 bg-text-main text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            )}
                            Download PDF
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-accent-secondary flex items-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Label
                        </button>
                        <button 
                            onClick={closeLabelPreview}
                            className="px-4 py-2 bg-surface text-text-muted rounded-xl text-[9px] font-black uppercase tracking-widest border border-border shadow-sm active:scale-95 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* --- THE ACTUAL LABEL (A4 Optimized) --- */}
                <div className="flex-grow overflow-y-auto bg-gray-200 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible">
                    <div className="bg-white mx-auto border-[2px] border-black p-6 flex flex-col text-black font-sans min-h-[842px] w-full max-w-[100%] print:border-[2px] print:m-0 print:p-10">
                        
                        {/* 1. Brand Header */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter leading-none">VexoKart</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-1">Logistics Hub</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-black text-white px-6 py-2 font-black text-xl uppercase italic mb-1">
                                    {isCOD ? 'COD' : 'PAID'}
                                </div>
                                <p className="text-[11px] font-black uppercase">Order #{order.id}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase">Fulfillment Date: {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* 2. Addresses */}
                        <div className="grid grid-cols-2 gap-0 mb-6 border-2 border-black overflow-hidden rounded-sm">
                            <div className="border-r-2 border-black p-4 bg-gray-50/20">
                                <p className="text-[10px] font-black uppercase mb-3 tracking-widest border-b border-black/10 pb-1 text-gray-500">Ship From</p>
                                <p className="font-black text-[13px] leading-tight uppercase italic">{vendorName}</p>
                                <p className="text-[10px] mt-2 font-bold text-gray-700 leading-relaxed uppercase">
                                    VexoKart Warehouse Node-A1<br/>
                                    Fulfillment Park, Industrial Zone<br/>
                                    Node ID: {vendorId}
                                </p>
                                <p className="mt-4 font-black text-black uppercase tracking-widest text-[9px]">Contact: 1800-VEXO-KART</p>
                            </div>

                            <div className="p-4">
                                <p className="text-[10px] font-black uppercase mb-3 tracking-widest border-b border-black/10 pb-1 text-gray-500">Deliver To</p>
                                <p className="font-black text-[15px] leading-tight uppercase italic mb-1">{address?.fullName}</p>
                                <p className="text-[11px] font-bold text-gray-700 leading-relaxed uppercase">
                                    {address?.street}<br/>
                                    {address?.city}, {address?.state}<br/>
                                </p>
                                
                                <div className="mt-3 inline-block border-[3px] border-black px-4 py-1 bg-white">
                                    <p className="font-black text-2xl tracking-[0.2em]">{address?.zip}</p>
                                </div>
                                
                                <p className="mt-4 font-black text-black uppercase tracking-widest text-[11px]">PH: {address?.phone}</p>
                            </div>
                        </div>

                        {/* 3. Identification: QR & Barcode */}
                        <div className="flex justify-between items-center gap-6 py-4 border-b-2 border-black mb-6">
                            <div className="p-2 border-2 border-black bg-white shrink-0">
                                <QRCode 
                                    size={80}
                                    value={`ORD:${order.id}|PH:${address?.phone}|ZIP:${address?.zip}`}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="flex-grow flex flex-col items-center">
                                <div className="max-w-full overflow-hidden mb-1">
                                    <Barcode 
                                        value={order.id.toString()} 
                                        width={2} 
                                        height={60} 
                                        displayValue={false}
                                        background="transparent"
                                    />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.5em]">{order.id}</p>
                            </div>
                        </div>

                        {/* 4. Table */}
                        <div className="flex-grow">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black">
                                        <th className="pb-3 pr-4">Description of Goods</th>
                                        <th className="pb-3 text-right w-24">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] font-bold uppercase divide-y divide-gray-100">
                                    {order.items.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-4 pr-4 border-b border-gray-200">
                                                <p className="font-black text-xs">{item.name}</p>
                                                <p className="text-[9px] text-gray-400 mt-0.5">SKU: {item.id}-{i+1}</p>
                                            </td>
                                            <td className="py-4 text-right border-b border-gray-200 text-lg font-black italic">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Financials */}
                        <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-start">
                            <div className="opacity-40">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] italic mb-1">Electronic Fulfillment Note</p>
                                <p className="text-[8px] font-bold uppercase leading-tight text-gray-500">Verified by VexoKart Platform Audit<br/>This is a computer generated document</p>
                            </div>
                            <div className="text-right w-64">
                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="border-t-2 border-black pt-3">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Payable (Incl. GST)</p>
                                    <p className="text-4xl font-black italic tracking-tighter leading-none mt-1">
                                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-12 pt-4 border-t border-dashed border-gray-300 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">
                                VexoKart Fulfillment System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer (Web Only) */}
                <div className="p-4 bg-gray-50/80 text-center border-t flex flex-col items-center gap-1 shrink-0 no-print">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                        OFFICIAL CONSIGNMENT MANIFEST V5.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabelPreviewModal;
