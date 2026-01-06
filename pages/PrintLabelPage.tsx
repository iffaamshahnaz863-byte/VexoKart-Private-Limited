import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../context/OrderContext.tsx';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';

const PrintLabelPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { getOrderById } = useOrders();
    const order = orderId ? getOrderById(orderId) : null;

    useEffect(() => {
        if (order) {
            // Wait for barcodes and QR to render before triggering browser print
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-black font-mono">
                <p className="animate-pulse">Accessing Secure Fulfillment Data...</p>
            </div>
        );
    }

    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    return (
        <div className="min-h-screen bg-white flex justify-center print:bg-white">
            {/* id="shipping-label" is targeted by print CSS */}
            <div 
                id="shipping-label" 
                className="w-[210mm] min-h-[297mm] bg-white border-[3px] border-black p-8 flex flex-col text-black font-sans print:border-[2px]"
            >
                
                {/* 1. TOP HEADER */}
                <div className="flex justify-between items-start border-b-[3px] border-black pb-4 mb-6">
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter leading-none">VexoKart</h1>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] mt-2">Logistics Manifest Hub</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-black text-white px-8 py-3 font-black text-2xl uppercase italic mb-2">
                            {isCOD ? 'COD' : 'PAID'}
                        </div>
                        <p className="text-sm font-black uppercase">Order Ref: #{order.id}</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">
                            Generated: {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* 2. ADDRESSES */}
                <div className="grid grid-cols-2 gap-0 border-[3px] border-black overflow-hidden mb-8">
                    <div className="border-r-[3px] border-black p-6 bg-gray-50/50">
                        <p className="text-[11px] font-black uppercase mb-4 tracking-widest text-gray-500 border-b border-black/10 pb-1">SHIP FROM</p>
                        <p className="font-black text-lg leading-tight uppercase italic">{vendorName}</p>
                        <p className="text-xs mt-3 font-bold text-gray-800 leading-relaxed uppercase">
                            VexoKart Fulfillment Node-A1<br/>
                            Authorized Logistics Center<br/>
                            India Node VX-LOGS
                        </p>
                        <p className="mt-6 font-black text-black uppercase tracking-widest text-[10px]">Merchant Support: 1800-VEXO-KART</p>
                    </div>

                    <div className="p-6">
                        <p className="text-[11px] font-black uppercase mb-4 tracking-widest text-gray-500 border-b border-black/10 pb-1">DELIVER TO</p>
                        <p className="font-black text-2xl leading-tight uppercase italic mb-2">{address?.fullName}</p>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed uppercase">
                            {address?.street}<br/>
                            {address?.city}, {address?.state}<br/>
                        </p>
                        
                        <div className="mt-5 inline-block border-[4px] border-black px-6 py-2 bg-white">
                            <p className="font-black text-4xl tracking-[0.3em]">{address?.zip}</p>
                        </div>
                        
                        <p className="mt-6 font-black text-black uppercase tracking-widest text-sm">RECIPIENT PH: {address?.phone}</p>
                    </div>
                </div>

                {/* 3. COURIER SCAN AREA */}
                <div className="flex justify-between items-center gap-10 py-6 border-b-[3px] border-black mb-8">
                    <div className="p-3 border-[3px] border-black bg-white shrink-0">
                        <QRCode 
                            size={120}
                            value={`ORD:${order.id}|PH:${address?.phone}|ZIP:${address?.zip}`}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <div className="flex-grow flex flex-col items-center">
                        <div className="max-w-full overflow-hidden mb-2">
                            <Barcode 
                                value={order.id.toString()} 
                                width={3} 
                                height={80} 
                                displayValue={false}
                                background="transparent"
                            />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.6em]">{order.id}</p>
                    </div>
                </div>

                {/* 4. CONTENT DESCRIPTION */}
                <div className="flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] font-black uppercase tracking-widest border-b-[3px] border-black">
                                <th className="pb-4 pr-4">Consignment Description</th>
                                <th className="pb-4 text-right w-24">Qty</th>
                                <th className="pb-4 text-right w-32">Value</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-bold uppercase divide-y divide-gray-100">
                            {order.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-5 pr-4 border-b border-gray-200">
                                        <p className="font-black text-sm">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">SKU: VXK-{item.id}-{i+1} • AUTHENTICATED</p>
                                    </td>
                                    <td className="py-5 text-right border-b border-gray-200 text-xl font-black italic">{item.quantity}</td>
                                    <td className="py-5 text-right border-b border-gray-200 font-black">₹{item.price.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. SETTLEMENT & TAXES */}
                <div className="mt-10 pt-8 border-t-[3px] border-black flex justify-between items-start">
                    <div className="max-w-sm opacity-60">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">Electronic Fulfillment Note</p>
                        <p className="text-[9px] font-bold uppercase leading-tight text-gray-600">
                            Verified by Platform Audit Node.<br/>
                            This document serves as the official shipping manifest and tax invoice.
                        </p>
                    </div>
                    <div className="text-right w-80">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm font-bold text-gray-600 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-600 uppercase tracking-widest">
                                <span>GST (18%)</span>
                                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="border-t-[3px] border-black pt-5">
                            <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Total Settled Value</p>
                            <p className="text-6xl font-black italic tracking-tighter leading-none mt-2">
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* 6. SYSTEM FOOTER */}
                <div className="mt-16 pt-6 border-t border-dashed border-gray-400 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.6em] text-gray-500 italic">
                        VexoKart Fulfillment System • V5.0 Secure
                    </p>
                </div>
            </div>

            {/* ACTION FLOATER (Hidden during print) */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 no-print">
                <button 
                    onClick={() => window.print()}
                    className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    Reprint Manifest
                </button>
                <button 
                    onClick={() => window.close()}
                    className="bg-white text-gray-500 border border-gray-200 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:text-red-500 transition-all"
                >
                    Return to Portal
                </button>
            </div>
        </div>
    );
};

export default PrintLabelPage;