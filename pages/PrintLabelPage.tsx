
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../context/OrderContext.tsx';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { generateShippingLabelPDF } from '../utils/pdfGenerator.ts';

const PrintLabelPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { getOrderById } = useOrders();
    const order = orderId ? getOrderById(orderId) : null;

    useEffect(() => {
        if (order) {
            const timer = setTimeout(() => {
                window.print();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-black font-mono">
                <p className="animate-pulse">Fetching Encrypted Fulfillment Data...</p>
            </div>
        );
    }

    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'DAR CYCLE HUB';
    const vendorId = order.vendor_id || order.items[0]?.vendor_id || 'DCH-INT-001';

    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    const handleDownloadPDF = async () => {
        const doc = await generateShippingLabelPDF(order);
        doc.save(`DCH_Label_Order_${order.id}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center py-10 print:py-0 print:bg-white print:block">
            
            <div className="fixed top-4 right-4 flex flex-col gap-2 no-print z-50">
                <button 
                    onClick={() => window.print()}
                    className="bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Label
                </button>
                <button 
                    onClick={handleDownloadPDF}
                    className="bg-white text-black border-2 border-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                </button>
                <button 
                    onClick={() => window.close()}
                    className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                >
                    Close Portal
                </button>
            </div>

            <div 
                id="shipping-label" 
                className="w-[210mm] min-h-[297mm] bg-white border-[3px] border-black p-8 flex flex-col text-black font-sans print:border-none print:m-0"
            >
                <div className="flex justify-between items-start border-b-[3px] border-black pb-4 mb-4">
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter leading-none">DAR CYCLE HUB</h1>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-2">Logistics Hub • Secure Fulfillment</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-black text-white px-8 py-2 font-black text-2xl uppercase italic inline-block mb-2">
                            {isCOD ? 'C O D' : 'PREPAID'}
                        </div>
                        <p className="text-sm font-black uppercase block">Order ID: #{order.id}</p>
                        <p className="text-[10px] font-bold text-gray-700 uppercase mt-1">
                            Order Date: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center py-6 border-b-[3px] border-black mb-6">
                    <div className="max-w-full overflow-hidden">
                        <Barcode 
                            value={order.id.toString()} 
                            width={3.2} 
                            height={90} 
                            displayValue={false}
                            margin={0}
                        />
                    </div>
                    <p className="text-lg font-black tracking-[0.8em] mt-2">ID: {order.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-0 border-[3px] border-black overflow-hidden mb-6">
                    <div className="border-r-[3px] border-black p-6 bg-gray-50/50 flex flex-col justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase mb-4 tracking-widest text-gray-500 border-b border-black/10 pb-1">SHIP FROM (SELLER)</p>
                            <p className="font-black text-xl leading-tight uppercase italic">{vendorName}</p>
                            <p className="text-xs mt-3 font-bold text-gray-800 leading-relaxed uppercase">
                                Warehouse Node-A1<br/>
                                Industrial Logistics Estate<br/>
                                Phone: 1800-DCH-HELP
                            </p>
                        </div>
                        <div className="mt-8">
                            <p className="text-[9px] font-black text-gray-400 uppercase">Seller Reg ID</p>
                            <p className="text-sm font-bold font-mono">{vendorId}</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col">
                        <p className="text-[11px] font-black uppercase mb-4 tracking-widest text-gray-500 border-b border-black/10 pb-1">DELIVER TO (CONSIGNEE)</p>
                        <p className="font-black text-2xl leading-tight uppercase italic mb-3">{address?.fullName}</p>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed uppercase">
                            {address?.street}<br/>
                            {address?.city}, {address?.state}
                        </p>
                        <p className="mt-4 font-black text-xl uppercase tracking-tighter">PH: {address?.phone}</p>
                        
                        <div className="mt-auto pt-6 flex justify-center">
                            <div className="border-[5px] border-black px-12 py-3 inline-block">
                                <p className="font-black text-5xl tracking-[0.2em]">{address?.zip}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 mb-6">
                    <div className="flex-grow border-[3px] border-black p-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase border-b-2 border-black">
                                    <th className="pb-2">ITEM DESCRIPTION</th>
                                    <th className="pb-2 text-right w-20">QTY</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold uppercase">
                                {order.items.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-3">
                                            <p className="font-black text-sm">{item.name}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5 tracking-tight">SKU: DCH-{item.id}</p>
                                        </td>
                                        <td className="py-3 text-right text-lg font-black">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="shrink-0 border-[3px] border-black p-4 flex flex-col items-center justify-center bg-white">
                        <QRCode 
                            size={100}
                            value={JSON.stringify({
                                oid: order.id,
                                mode: order.payment_mode,
                                amt: totalAmount,
                                ph: address?.phone
                            })}
                            viewBox={`0 0 256 256`}
                        />
                        <p className="text-[8px] font-black uppercase mt-2 tracking-widest">Digital Auth</p>
                    </div>
                </div>

                <div className="mt-auto flex justify-between items-end border-t-[3px] border-black pt-6">
                    <div className="max-w-sm opacity-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">Electronic Fulfillment Manifest</p>
                        <p className="text-[8px] font-bold uppercase leading-tight text-gray-700">
                            Subject to DAR CYCLE HUB Logistics Jurisdiction.<br/>
                            {isCOD ? 'PAYMENT STATUS: PENDING (COLLECT AT DOORSTEP)' : 'PAYMENT STATUS: SECURELY PAID ONLINE'}
                        </p>
                    </div>

                    <div className="w-80">
                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 uppercase">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 uppercase">
                                <span>GST (18%)</span>
                                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="border-t-[3px] border-black pt-4 text-right">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Total Payable (Inclusive of GST)</p>
                            <p className="text-6xl font-black italic tracking-tighter leading-none mt-2">
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 pt-4 border-t border-dashed border-gray-400 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">
                        DCH Fulfillment System • V1.0 Verified Manifest
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrintLabelPage;
