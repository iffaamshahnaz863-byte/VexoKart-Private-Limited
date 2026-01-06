import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext.tsx';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { generateShippingLabelPDF } from '../utils/pdfGenerator.ts';

const ShippingLabelPreviewModal: React.FC = () => {
    const { activeOrderForLabel, closeLabelPreview } = useOrders();
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    if (!activeOrderForLabel) return null;

    const order = activeOrderForLabel;
    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
    const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'VX-001';

    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    const handleDownload = async () => {
        setIsProcessing(true);
        try {
            const doc = await generateShippingLabelPDF(order);
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);

            // Chrome-safe direct download trigger
            const link = document.createElement('a');
            link.href = url;
            link.download = `VexoKart_Label_Order_${order.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setDownloadSuccess(true);
        } catch (err) {
            console.error("PDF download failed:", err);
            alert("Download failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintInNewTab = () => {
        if (pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
        }
    };

    const handleClose = () => {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
        setDownloadSuccess(false);
        closeLabelPreview();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-200">
                
                {/* Status Header */}
                <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-text-main italic leading-none">
                            {downloadSuccess ? 'Download Complete' : 'Logistics Manifest'}
                        </h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2">
                            Secure Fulfillment Node • V.5.0
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow p-8 flex flex-col">
                    {downloadSuccess ? (
                        /* Post-Download View */
                        <div className="flex-grow flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30">
                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-text-main italic uppercase tracking-tighter">Manifest Ready</h3>
                            <p className="text-text-secondary text-sm mt-2 max-w-xs leading-relaxed font-medium">
                                The official shipping label and tax invoice for Order <strong>#{order.id}</strong> has been saved to your device.
                            </p>

                            <div className="mt-10 w-full space-y-3">
                                <button 
                                    onClick={handlePrintInNewTab}
                                    className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Open For Printing
                                </button>
                                <button 
                                    onClick={handleClose}
                                    className="w-full bg-surface text-text-muted py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-border active:scale-95 transition-all"
                                >
                                    Finish Workflow
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Pre-Download Label UI */
                        <div className="flex-grow space-y-6">
                            <div className="p-6 bg-surface rounded-3xl border border-border border-dashed flex flex-col items-center">
                                <div className="mb-4">
                                    <Barcode value={order.id.toString()} height={40} displayValue={false} background="transparent" />
                                    <p className="text-[10px] font-black text-center mt-1 uppercase tracking-[0.4em]">{order.id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full text-[10px] border-t border-border pt-4">
                                    <div>
                                        <p className="font-black text-text-muted mb-1">FROM</p>
                                        <p className="font-bold text-text-main leading-tight">{vendorName}</p>
                                    </div>
                                    <div>
                                        <p className="font-black text-text-muted mb-1">TO</p>
                                        <p className="font-bold text-text-main leading-tight">{address?.fullName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-text-muted uppercase">Bill Total</span>
                                    <span className="text-xl font-black text-text-main italic tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    disabled={isProcessing}
                                    className="w-full bg-text-main text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    )}
                                    {isProcessing ? 'Generating Secured PDF...' : 'Download Shipping Label'}
                                </button>
                                <p className="text-[9px] text-text-muted text-center font-bold uppercase tracking-widest">
                                    Chrome Safe • Industry Compliant • A4 Optimized
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Secure Protocol Footer */}
                <div className="p-4 bg-gray-50/80 text-center border-t flex flex-col items-center gap-1 shrink-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">
                        OFFICIAL CONSIGNMENT MANIFEST V5.0
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Certified Encrypted Protocol</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabelPreviewModal;
