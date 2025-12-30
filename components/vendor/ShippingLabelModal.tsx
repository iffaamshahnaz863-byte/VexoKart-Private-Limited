import React, { useState, useRef } from 'react';
import { Order, Vendor } from '../../types';

interface ShippingLabelModalProps {
  order: Order;
  vendor: Vendor;
  onClose: () => void;
  onGenerated: (url: string) => void;
}

const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ order, vendor, onClose, onGenerated }) => {
  const [pageSize, setPageSize] = useState<'A4' | '4x6'>('A4');
  const printRef = useRef<HTMLDivElement>(null);

  // Fallback for safety
  const address = order.shippingAddress || {
    fullName: 'Customer Name',
    street: 'Street Details Missing',
    city: 'City',
    state: 'State',
    zip: '000000',
    phone: 'No Phone'
  };

  // Generate QR code encoding only the secure token for scanning
  const scanUrl = `${window.location.origin}/#/scan/${order.qrToken}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(scanUrl)}`;
  
  // Barcode for internal warehouse scanning
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${order.id}&scale=2&rotate=N&includetext=true`;

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - #${order.id}</title>
          ${styles}
          <style>
            @media print {
              body { background: white; margin: 0; padding: 0; font-family: 'Inter', sans-serif; color: black; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
              .print-container { width: 100%; height: auto; }
              @page { 
                size: ${pageSize === 'A4' ? 'A4' : '101.6mm 152.4mm'}; 
                margin: 0; 
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* Fix: Property 'payment_method' does not exist on type 'Order'. Use 'payment_mode' instead. */
  const isCOD = order.payment_mode === 'Cash on Delivery';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">Fulfillment Station</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Meesho-Compatible Shipping Format</p>
          </div>
          <div className="flex gap-3">
             <div className="flex bg-surface p-1 rounded-xl border border-border">
                {(['A4', '4x6'] as const).map(size => (
                    <button
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pageSize === size ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-grow overflow-y-auto p-12 bg-gray-500/10 flex justify-center no-scrollbar">
             <div ref={printRef} className={`bg-white transition-all duration-500 overflow-hidden ${pageSize === 'A4' ? 'w-[595px] h-auto min-h-[842px]' : 'w-[400px] h-auto min-h-[600px]'} border border-gray-200 shadow-2xl`}>
                <div className="p-10 h-full flex flex-col text-black font-sans bg-white">
                    {/* Top Header Section */}
                    <div className="flex justify-between items-start border-b-[6px] border-black pb-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2.5" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Vexo<span className="text-gray-400">Kart</span></h1>
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Logistics Operations Hub</p>
                        </div>
                        <div className="text-right">
                             <div className={`inline-block px-6 py-2 rounded-lg border-4 border-black font-black uppercase text-xl mb-3 ${isCOD ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                {isCOD ? 'COD' : 'PREPAID'}
                             </div>
                             <div className="space-y-1">
                                <p className="text-[12px] font-black uppercase text-gray-400">Order Ref: <span className="text-black ml-1">#{order.id}</span></p>
                                <p className="text-[12px] font-black uppercase text-gray-400">Date: <span className="text-black ml-1">{new Date(order.date).toLocaleDateString()}</span></p>
                             </div>
                        </div>
                    </div>

                    {/* Barcode & Logistics QR Section */}
                    <div className="grid grid-cols-5 gap-0 border-4 border-black rounded-2xl mb-8 overflow-hidden">
                        <div className="col-span-2 p-6 bg-gray-50 border-r-4 border-black text-center flex flex-col items-center justify-center">
                            <img src={qrUrl} alt="Logistics Scan" className="w-40 h-40 border-2 border-black p-2 bg-white rounded-lg shadow-sm mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-black">Scan to Update Status</p>
                        </div>
                        <div className="col-span-3 p-8 flex flex-col items-center justify-center bg-white">
                             <img src={barcodeUrl} alt="Shipment Barcode" className="h-24 w-full object-contain" />
                             <p className="text-[12px] font-bold tracking-[0.6em] mt-4 font-mono text-black uppercase">{order.id}</p>
                             <div className="mt-4 pt-4 border-t border-black/10 w-full text-center">
                                <p className="text-[11px] font-black uppercase text-gray-500">Shipment ID: <span className="text-black">VXK-{order.id.slice(-6).toUpperCase()}</span></p>
                             </div>
                        </div>
                    </div>

                    {/* Addressing Infrastructure */}
                    <div className="grid grid-cols-2 gap-0 border-4 border-black mb-10 divide-x-4 divide-black">
                        {/* SHIP FROM (Vendor) */}
                        <div className="p-8 bg-gray-50">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b-2 border-black/5 pb-2 flex items-center gap-2">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>
                                Ship From (Seller):
                            </p>
                            <h3 className="font-black text-xl uppercase leading-tight italic mb-3 text-black">{vendor.store_name}</h3>
                            <div className="text-sm font-bold leading-relaxed text-gray-800 space-y-1">
                                <p className="line-clamp-3">{vendor.store_address || 'VexoKart Fulfillment Hub, Sector 4'}</p>
                                <div className="pt-4 space-y-0.5">
                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-tight">Vendor ID: <span className="text-black">VXK-{vendor.id}</span></p>
                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-tight">Contact: <span className="text-black">{vendor.phone}</span></p>
                                </div>
                            </div>
                        </div>
                        
                        {/* DELIVER TO (Customer) */}
                        <div className="p-8 bg-white">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b-2 border-black/5 pb-2 flex items-center gap-2">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                Deliver To (Consignee):
                            </p>
                            <h3 className="font-black text-2xl uppercase leading-none mb-4 text-black">{address.fullName}</h3>
                            <div className="text-base font-bold leading-snug text-gray-900 space-y-1">
                                <p className="text-lg leading-tight mb-2">{address.street}</p>
                                <p className="text-xl uppercase font-black tracking-tight">{address.city}, {address.state}</p>
                                <div className="mt-6 flex items-end gap-2 bg-black/5 p-4 rounded-xl border border-black/10">
                                    <span className="text-4xl font-black tracking-[0.3em] leading-none">{address.zip}</span>
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Pincode</p>
                                </div>
                                <div className="mt-8 pt-6 border-t-2 border-black/5">
                                    <p className="text-xs font-black uppercase tracking-[0.1em] bg-black text-white inline-block px-4 py-2 rounded-lg">Customer Phone: {address.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Contents / Manifest */}
                    <div className="border-4 border-black mb-auto overflow-hidden rounded-xl">
                        <table className="w-full text-left">
                            <thead className="bg-black text-white text-[11px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">SKU / Item Details</th>
                                    <th className="p-4 text-center">Variant</th>
                                    <th className="p-4 text-center">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-black">
                                {order.items.map(item => (
                                    <tr key={item.id} className="bg-white">
                                        <td className="p-4">
                                            <p className="text-[13px] font-black uppercase leading-tight mb-1">{item.name}</p>
                                            <p className="text-[10px] font-bold text-gray-500 font-mono tracking-tighter">SKU: {item.id.toString().toUpperCase()}</p>
                                        </td>
                                        <td className="p-4 text-[11px] font-black text-center uppercase">
                                            {item.color || '-'} {item.size ? `| ${item.size}` : ''}
                                        </td>
                                        <td className="p-4 text-xl font-black text-center">x{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Billing & Settlement Section */}
                    <div className="mt-12 grid grid-cols-2 border-t-[6px] border-black pt-8 items-end">
                         <div>
                            <p className="text-[12px] font-black uppercase text-gray-400 mb-1">Settlement Status</p>
                            <p className="text-2xl font-black italic uppercase tracking-tighter text-black">
                                {order.payment_status === 'paid' ? 'Prepaid Transaction' : 'Collect Cash (COD)'}
                            </p>
                            {/* Fix: Property 'payment_method' does not exist on type 'Order'. Use 'payment_mode' instead. */}
                            <p className="text-[11px] font-bold text-gray-500 mt-2 uppercase">Method: {order.payment_mode}</p>
                         </div>
                         <div className="text-right">
                             <div className="inline-block border-[6px] border-black p-6 bg-gray-50 rounded-xl shadow-sm">
                                <p className="text-[12px] font-black uppercase tracking-[0.2em] mb-2 text-center text-gray-400">Total Collectible Value</p>
                                <p className="text-6xl font-black italic tracking-tighter text-black leading-none">₹{order.total.toLocaleString('en-IN')}</p>
                             </div>
                         </div>
                    </div>

                    <div className="mt-12 flex justify-between items-end border-t-2 border-black/10 pt-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-gray-400 italic leading-none">Digital Verification Code: {order.qrToken?.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 leading-none">VexoKart Logistics Chain v3.4 • Verified Authenticity</p>
                        </div>
                        <p className="text-[12px] font-black tracking-tighter uppercase italic text-black bg-gray-100 px-3 py-1 rounded">Platform Support ID: 1800-VXK-LOGS</p>
                    </div>
                </div>
             </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-white border-t border-border flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-text-muted bg-surface px-3 py-1.5 rounded-lg border border-border">Preview Only</span>
             </div>
             <div className="flex gap-4">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all"
                >
                    Close
                </button>
                <button 
                    onClick={handlePrint}
                    className="bg-accent text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/30 flex items-center gap-3 hover:-translate-y-1 active:translate-y-0 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Fulfillment Label
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;