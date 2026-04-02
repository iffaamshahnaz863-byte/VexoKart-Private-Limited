
import React, { useEffect, useState } from 'react';
import { useOrders } from '../context/OrderContext.tsx';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { generateShippingLabelPDF } from '../utils/pdfGenerator.ts';

const ShippingLabelPreviewModal: React.FC = () => {
    const { activeOrderForLabel, closeLabelPreview } = useOrders();
    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (activeOrderForLabel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [activeOrderForLabel]);

    if (!activeOrderForLabel) return null;

    const order = activeOrderForLabel;
    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VEXOKART Authorized Vendor';

    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        } else {
            closeLabelPreview();
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDownloading(true);
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const doc = await generateShippingLabelPDF(order);
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);

            if (isMobile) {
                // On Mobile: Show PDF in secure internal viewer to avoid permission errors
                setPdfUrl(url);
            } else {
                // On Desktop: Direct download
                const link = document.createElement('a');
                link.href = url;
                link.download = `manifest_order_${order.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Please try printing instead.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.print();
    };

    return (
        <div 
            className="fixed inset-0 z-[200] flex flex-col bg-white animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header Control Bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-[210]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tight italic">
                            {pdfUrl ? 'PDF Preview' : 'Consignment Manifest'}
                        </h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order #{order.id}</p>
                    </div>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-2 bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-100 flex flex-col items-center relative">
                {pdfUrl ? (
                    <div className="w-full h-full animate-in fade-in duration-500">
                        <iframe 
                            src={pdfUrl} 
                            className="w-full h-full rounded-xl border-none shadow-inner"
                            title="Label PDF Viewer"
                        />
                    </div>
                ) : (
                    /* The Manifest Visual (Paper Style) */
                    <div className="bg-white w-full max-w-[210mm] shadow-2xl p-6 md:p-10 text-black font-sans border border-gray-300">
                        
                        {/* 1. BRAND HEADER */}
                        <div className="flex justify-between items-start border-b-[2px] border-black pb-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter leading-none">VEXOKART</h1>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Logistics Hub • Secure Node</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-black text-white px-4 py-1 font-black text-xs uppercase italic inline-block mb-1">
                                    {isCOD ? 'C O D' : 'PREPAID'}
                                </div>
                                <p className="text-[10px] font-black uppercase block">ID: #{order.id}</p>
                            </div>
                        </div>

                        {/* 2. PRIMARY SCANNABLE */}
                        <div className="flex flex-col items-center py-4 border-b border-gray-200 mb-6">
                            <Barcode 
                                value={order.id.toString()} 
                                width={2.5} 
                                height={60} 
                                displayValue={false}
                                margin={0}
                            />
                            <p className="text-xs font-black tracking-[0.5em] mt-2">*{order.id}*</p>
                        </div>

                        {/* 3. ADDRESS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black mb-6">
                            <div className="border-b-2 md:border-b-0 md:border-r-2 border-black p-4 bg-gray-50/30">
                                <p className="text-[9px] font-black uppercase mb-2 text-gray-400">SHIP FROM (SELLER)</p>
                                <p className="font-black text-sm uppercase italic">{vendorName}</p>
                                <p className="text-[10px] mt-1 font-bold text-gray-700 leading-tight uppercase">
                                    Warehouse Node-A1<br/>
                                    Industrial Estate<br/>
                                    Support: 1800-VXK-HUB
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-[9px] font-black uppercase mb-2 text-gray-400">DELIVER TO (CONSIGNEE)</p>
                                <p className="font-black text-base uppercase italic mb-1">{address?.fullName}</p>
                                <p className="text-[11px] font-bold text-gray-800 uppercase leading-snug">
                                    {address?.street}<br/>
                                    {address?.city}, {address?.state}
                                </p>
                                <p className="mt-2 font-black text-sm">PH: {address?.phone}</p>
                                
                                <div className="mt-4 flex justify-center">
                                    <div className="border-2 border-black px-6 py-1 inline-block">
                                        <p className="font-black text-2xl tracking-[0.1em]">{address?.zip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. ITEMS LIST */}
                        <div className="border-2 border-black p-3 mb-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-black uppercase border-b border-black">
                                        <th className="pb-1">DESCRIPTION</th>
                                        <th className="pb-1 text-right w-12">QTY</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-bold uppercase">
                                    {order.items.map((item: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                            <td className="py-2">
                                                <p className="font-black text-[11px]">{item.name}</p>
                                                <p className="text-[8px] text-gray-400 mt-0.5">SKU: VXK-{item.id}</p>
                                            </td>
                                            <td className="py-2 text-right font-black">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 5. PRICING & QR */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-dashed border-gray-300">
                            <div className="flex flex-col items-center p-2 border border-gray-100 rounded-lg">
                                <QRCode 
                                    size={60}
                                    value={JSON.stringify({ oid: order.id, ph: address?.phone })}
                                    viewBox={`0 0 256 256`}
                                />
                                <p className="text-[7px] font-black uppercase mt-1">Digital Auth</p>
                            </div>

                            <div className="w-full md:w-64">
                                <div className="space-y-1 mb-2">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="border-t border-black pt-2 text-right">
                                    <p className="text-[8px] font-black uppercase text-gray-400">Total Payable</p>
                                    <p className="text-3xl font-black italic tracking-tighter leading-none mt-1">
                                        ₹{totalAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 6. MANIFEST FOOTER */}
                        <div className="mt-8 text-center opacity-30">
                            <p className="text-[7px] font-black uppercase tracking-[0.3em]">
                                VEXOKART Systems • Electronic Manifest v5.0 • Verified Protocol
                            </p>
                        </div>
                    </div>
                )}

                {/* Secure Protocol Tip */}
                <div className="mt-10 p-6 text-center text-gray-400 space-y-2 no-print">
                    <p className="text-[9px] font-black uppercase tracking-widest italic">Self-Contained Secure Node</p>
                    <p className="text-[8px] uppercase font-bold max-w-[250px] mx-auto leading-relaxed">
                        This document is rendered locally for protection against unauthorized redirection.
                    </p>
                </div>
            </div>

            {/* Bottom Safe Area Footer */}
            <div className="p-4 bg-white border-t border-gray-200 pb-safe shadow-inner no-print grid grid-cols-2 gap-4">
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    Download Label
                </button>
                <button 
                    onClick={handlePrint}
                    className="bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Manifest
                </button>
            </div>
        </div>
    );
};

export default ShippingLabelPreviewModal;
