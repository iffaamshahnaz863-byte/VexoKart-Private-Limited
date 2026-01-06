import React from 'react';
import { useOrders } from '../context/OrderContext';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';

const ShippingLabelPreviewModal: React.FC = () => {
    const { activeOrderForLabel, closeLabelPreview } = useOrders();

    if (!activeOrderForLabel) return null;

    const order = activeOrderForLabel;
    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    
    // Vendor details extraction - prioritizing items metadata or store profile
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
    const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-001';

    // Financial calculations (Back-calculating 18% GST from the inclusive total)
    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = Number((totalAmount / 1.18).toFixed(2));
    const gstAmount = Number((totalAmount - subtotal).toFixed(2));

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 no-print">
            <div className="bg-white w-full max-w-2xl h-full max-h-[98vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative border border-gray-200 print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
                
                {/* Control Header (Web Only) */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-20 no-print">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-main italic">Logistics Manifest Generator</h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">Secure Fulfillment Node • VexoKart ecosystem</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handlePrint}
                            className="px-6 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-accent-secondary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Label
                        </button>
                        <button 
                            onClick={closeLabelPreview}
                            className="px-6 py-2 bg-text-main text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-black"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Print Layout (Optimized for A4) */}
                <div className="flex-grow overflow-y-auto bg-gray-200 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible">
                    <div className="bg-white mx-auto border-[2px] border-black p-6 flex flex-col text-black font-sans min-h-[842px] w-full max-w-[100%] print:border-[2px] print:m-0 print:p-8">
                        
                        {/* 1. Header Section */}
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
                                <p className="text-[9px] font-bold text-gray-500 uppercase">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* 2. Address Grid: SHIP FROM / DELIVER TO */}
                        <div className="grid grid-cols-2 gap-0 mb-6 border-2 border-black">
                            {/* SHIP FROM (SELLER) */}
                            <div className="border-r-2 border-black p-4 bg-gray-50/30">
                                <p className="text-[11px] font-black uppercase mb-3 tracking-widest border-b border-black/10 pb-1">Ship From</p>
                                <p className="font-black text-[13px] leading-tight uppercase italic">{vendorName}</p>
                                <p className="text-[11px] mt-2 font-bold text-gray-700 leading-snug uppercase">
                                    Warehouse Node-A1<br/>
                                    VexoKart Logistics Park, Phase II<br/>
                                    Industrial Estate, India
                                </p>
                                <p className="mt-4 font-black text-black uppercase tracking-widest text-[10px]">Contact: 1800-VEXO-KART</p>
                                <p className="text-[9px] font-bold text-gray-400">Node ID: {vendorId}</p>
                            </div>

                            {/* DELIVER TO (CUSTOMER) */}
                            <div className="p-4">
                                <p className="text-[11px] font-black uppercase mb-3 tracking-widest border-b border-black/10 pb-1">Deliver To</p>
                                <p className="font-black text-[15px] leading-tight uppercase italic mb-1">{address?.fullName}</p>
                                <p className="text-[11px] font-bold text-gray-700 leading-relaxed uppercase">
                                    {address?.street}<br/>
                                    {address?.city}, {address?.state}<br/>
                                </p>
                                
                                <div className="mt-3 inline-block border-4 border-black px-4 py-1 bg-white">
                                    <p className="font-black text-2xl tracking-[0.2em]">{address?.zip}</p>
                                </div>
                                
                                <p className="mt-4 font-black text-black uppercase tracking-widest text-[11px]">Ph: {address?.phone}</p>
                            </div>
                        </div>

                        {/* 3. Identification: QR & Barcode */}
                        <div className="flex justify-between items-center gap-6 py-6 border-b-2 border-black mb-6">
                            <div className="p-3 border-2 border-black bg-white shrink-0">
                                <QRCode 
                                    size={100}
                                    value={`ORD:${order.id}|PH:${address?.phone}|ZIP:${address?.zip}`}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="flex-grow flex flex-col items-center">
                                <div className="max-w-full overflow-hidden mb-1">
                                    <Barcode 
                                        value={order.id.toString()} 
                                        width={2} 
                                        height={70} 
                                        fontSize={14}
                                        font="monospace"
                                        background="transparent"
                                        displayValue={false}
                                    />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.5em]">{order.id}</p>
                            </div>
                        </div>

                        {/* 4. Item Table */}
                        <div className="flex-grow">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black">
                                        <th className="pb-3 pr-4">Description of Goods</th>
                                        <th className="pb-3 text-center w-24">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] font-bold uppercase divide-y divide-gray-100">
                                    {order.items.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-4 pr-4 border-b border-gray-200">
                                                <p className="font-black text-xs">{item.name.substring(0, 70)}{item.name.length > 70 ? '...' : ''}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">SKU: {item.id}-{i+1}</p>
                                            </td>
                                            <td className="py-4 text-center border-b border-gray-200 text-base font-black italic">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Financial & Tax Section */}
                        <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-start">
                            <div className="opacity-40">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] italic mb-1">Electronic Fulfillment Note</p>
                                <p className="text-[8px] font-bold uppercase leading-tight">Verified by VexoKart Platform Service<br/>Compliance Code: VX-LOG-P5-IN</p>
                                <p className="text-[8px] mt-4 font-black uppercase tracking-widest text-gray-500">This is a computer generated document</p>
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
                        
                        {/* Footer Branding */}
                        <div className="mt-12 pt-4 border-t border-dashed border-gray-400 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">
                                VexoKart Fulfillment System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secure Protocol Modal Footer (Web Only) */}
                <div className="p-4 bg-gray-50/80 text-center border-t flex flex-col items-center gap-1 shrink-0 no-print">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                        OFFICIAL CONSIGNMENT NOTE V5.0
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Digital Audit Log Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabelPreviewModal;