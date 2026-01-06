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
            // Auto-trigger print once components are settled
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-black font-mono">
                <p className="animate-pulse">Retrieving Secure Manifest Data...</p>
            </div>
        );
    }

    const address = order.shippingAddress || order.shipping_address;
    const isCOD = order.payment_mode === 'Cash on Delivery';
    const vendorName = order.seller_name || order.items[0]?.vendor_name || 'VexoKart Authorized Vendor';
    
    // Financials
    const totalAmount = Number(order.total_amount || order.total || 0);
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;

    const handleDownloadPDF = async () => {
        const doc = await generateShippingLabelPDF(order);
        doc.save(`VexoKart_Label_${order.id}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 print:py-0 print:bg-white">
            
            {/* ACTION PANEL (Hidden during print) */}
            <div className="w-[100mm] mb-4 flex gap-2 no-print">
                <button 
                    onClick={() => window.print()}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-lg active:scale-95 transition-all"
                >
                    Print Label
                </button>
                <button 
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-white text-black border border-black px-4 py-2 rounded-lg font-bold text-xs uppercase active:scale-95 transition-all"
                >
                    Download PDF
                </button>
                <button 
                    onClick={() => window.close()}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs uppercase active:scale-95 transition-all"
                >
                    Close
                </button>
            </div>

            {/* 4x6 THERMAL LABEL CONTAINER */}
            <div 
                id="shipping-label" 
                className="w-[100mm] min-h-[150mm] bg-white border border-black p-2 flex flex-col text-black font-sans text-[11px] leading-tight print:border-none"
            >
                {/* HEADER SECTION */}
                <div className="flex justify-between items-center border-b border-black pb-1 mb-1">
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">VexoKart</h1>
                        <p className="text-[7px] font-bold uppercase tracking-widest">Logistics Hub</p>
                    </div>
                    <div className="text-right">
                        <div className="border border-black px-2 py-0.5 font-black text-[10px] uppercase inline-block mb-1">
                            {isCOD ? 'C O D' : 'P R E P A I D'}
                        </div>
                        <p className="text-[8px] font-black uppercase">ORD: {order.id}</p>
                    </div>
                </div>

                {/* BARCODE SECTION */}
                <div className="flex flex-col items-center border-b border-black pb-1 mb-1">
                    <Barcode 
                        value={order.id.toString()} 
                        width={1.5} 
                        height={40} 
                        fontSize={10} 
                        margin={0}
                        displayValue={true}
                    />
                </div>

                {/* SHIP FROM SECTION */}
                <div className="border-b border-black pb-1 mb-1">
                    <p className="text-[7px] font-black uppercase text-gray-600 mb-0.5">Ship From:</p>
                    <p className="font-black text-[9px] uppercase leading-none">{vendorName}</p>
                    <p className="text-[8px] mt-0.5 font-medium uppercase leading-tight">
                        Authorized VexoKart Node<br/>
                        India Logistics Zone<br/>
                        Node Support: 1800-VEXO-KART
                    </p>
                    <p className="text-[7px] font-black mt-1 italic">Sold by: {vendorName}</p>
                </div>

                {/* SHIP TO SECTION */}
                <div className="border-b border-black pb-1 mb-1 flex justify-between items-start gap-2">
                    <div className="flex-grow">
                        <p className="text-[7px] font-black uppercase text-gray-600 mb-0.5">Ship To:</p>
                        <p className="font-black text-[12px] uppercase mb-0.5">{address?.fullName}</p>
                        <p className="text-[9px] font-medium uppercase leading-relaxed">
                            {address?.street}<br/>
                            {address?.city}, {address?.state}
                        </p>
                        <p className="text-[10px] font-black mt-1">PH: {address?.phone}</p>
                        
                        {/* Boxed Pincode */}
                        <div className="mt-1 border-2 border-black inline-block px-3 py-1">
                            <p className="text-lg font-black tracking-widest">{address?.zip}</p>
                        </div>
                    </div>
                    
                    {/* QR CODE */}
                    <div className="shrink-0 p-1 border border-black bg-white">
                        <QRCode 
                            size={65}
                            value={`ORD:${order.id}|AMT:${totalAmount}|PIN:${address?.zip}`}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>

                {/* ITEMS SECTION */}
                <div className="flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[7px] font-black uppercase border-b border-black">
                                <th className="pb-1 pr-1">Description / SKU</th>
                                <th className="pb-1 text-right w-10">Qty</th>
                            </tr>
                        </thead>
                        <tbody className="text-[8px] font-bold uppercase">
                            {order.items.map((item: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 last:border-b-0">
                                    <td className="py-1 pr-1 truncate">
                                        VXK-{item.id} | {item.name}
                                    </td>
                                    <td className="py-1 text-right">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* BILLING SECTION */}
                <div className="border-t border-black pt-1 mt-1">
                    <div className="flex justify-between items-center text-[8px] font-bold uppercase text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold uppercase text-gray-600">
                        <span>GST (18%)</span>
                        <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-dashed border-black pt-1 mt-1">
                        <div>
                            <p className="text-[7px] font-black uppercase text-gray-400 leading-none">TOTAL PAYABLE</p>
                            <p className="text-[14px] font-black italic tracking-tighter">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <p className="text-[7px] font-black italic mb-0.5">INCLUSIVE OF GST</p>
                    </div>
                </div>

                {/* FOOTER SECTION */}
                <div className="mt-2 pt-1 border-t border-black text-center">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] mb-0.5">VexoKart Fulfillment System</p>
                    <p className="text-[6px] font-bold uppercase text-gray-400">
                        Generated: {new Date().toLocaleString()} • This is a system-generated label
                    </p>
                </div>
            </div>

            <p className="mt-6 text-[10px] text-gray-400 uppercase font-black tracking-widest no-print">
                Optimized for Thermal Printing
            </p>
        </div>
    );
};

export default PrintLabelPage;