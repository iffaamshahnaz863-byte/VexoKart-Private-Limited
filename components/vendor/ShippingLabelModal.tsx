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

  // Requirement Part 2.3: Generate QR code encoding { order_id, vendor_email }
  const qrData = JSON.stringify({ order_id: order.id, vendor_email: vendor.email });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
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
              body { background: white; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
              .no-print { display: none !important; }
              .print-container { width: 100%; }
              @page { size: ${pageSize === 'A4' ? 'A4' : '101.6mm 152.4mm'}; margin: 0; }
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
    onGenerated(order.label_url || '');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">Shipping Documentation</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Ready for Courier Pickup</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-surface/50 border-b border-border flex gap-4 items-center">
            <span className="text-[10px] font-black uppercase text-text-muted">Label Dimensions</span>
            <div className="flex bg-white p-1 rounded-xl border border-border shadow-sm">
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
            {order.label_url && (
                <span className="ml-auto text-[9px] font-black uppercase text-green-500 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   Stored in Cloud
                </span>
            )}
        </div>

        {/* Preview Area */}
        <div className="flex-grow overflow-y-auto p-8 bg-surface/30 flex justify-center">
             <div ref={printRef} className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden ${pageSize === 'A4' ? 'w-[595px] h-[842px]' : 'w-[400px] h-[600px]'} border border-gray-200`}>
                <div className="p-8 h-full flex flex-col text-black">
                    {/* Part 2.2: Logo, Order ID, Date */}
                    <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Vexo<span className="text-gray-500">Kart</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1">Shipping Fulfillment Network</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-gray-500">Dispatch Date</p>
                             <p className="font-bold text-sm">{new Date().toLocaleDateString()}</p>
                             <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Order Ref: #{order.id}</p>
                        </div>
                    </div>

                    {/* Part 2.2: Ship From (Vendor) & Ship To (Buyer) */}
                    <div className="grid grid-cols-2 gap-8 mb-8 border-b-2 border-black pb-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Shipper (From):</p>
                            <p className="font-black text-base leading-tight uppercase italic">{vendor.store_name}</p>
                            <p className="text-xs font-medium leading-relaxed mt-1">{vendor.store_address || 'VexoKart Authorized Warehouse Hub'}</p>
                            <p className="text-xs font-bold mt-2">Business Email: {vendor.email}</p>
                            <p className="text-xs font-bold">Contact: {vendor.phone || '+91 XXX XXX XXXX'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Recipient (To):</p>
                            <p className="font-black text-xl leading-none uppercase">{order.shippingAddress.fullName}</p>
                            <p className="text-base font-bold leading-tight mt-2">{order.shippingAddress.street}</p>
                            <p className="text-base font-bold">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                            <div className="mt-4 p-2 bg-black text-white rounded inline-block">
                                <p className="text-xs font-black tracking-widest">TEL: {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Part 2.2: Items Summary & QR */}
                    <div className="flex gap-10 items-start mb-8">
                        <div className="flex-grow">
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 underline decoration-2 underline-offset-4">Package Contents:</p>
                             <table className="w-full text-left">
                                <thead className="border-b border-black">
                                    <tr className="text-[10px] font-black uppercase">
                                        <th className="pb-2">Description</th>
                                        <th className="pb-2 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items.map(item => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-xs font-bold uppercase">{item.name}</td>
                                            <td className="py-2 text-xs font-black text-center">x{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                        {/* Part 2.3: QR Code Section */}
                        <div className="text-center p-3 border-2 border-black rounded-2xl bg-white shadow-sm">
                            <img src={qrUrl} alt="Fulfillment QR" className="w-24 h-24 mb-2" />
                            <p className="text-[8px] font-black uppercase tracking-tighter">SECURE SHIPMENT SCAN</p>
                        </div>
                    </div>

                    {/* Part 2.2: Payment & Final Total */}
                    <div className="mt-auto pt-6 border-t-4 border-black">
                         <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payment Mode</p>
                                <p className="text-2xl font-black italic tracking-tighter uppercase">{order.payment_method}</p>
                                <div className="mt-4">
                                    <img src={barcodeUrl} alt="Order Barcode" className="h-10" />
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="p-4 border-2 border-black rounded-2xl bg-gray-50 inline-block">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-500 text-center">Collectible Total</p>
                                    <p className="text-3xl font-black tracking-tighter italic">₹{order.total.toLocaleString()}</p>
                                </div>
                                <p className="text-[8px] font-bold text-gray-400 mt-4 uppercase">Powered by VexoKart Logistic Hub v2.0</p>
                            </div>
                         </div>
                    </div>
                </div>
             </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-white border-t border-border flex justify-end gap-4">
             <button 
                onClick={onClose}
                className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all"
             >
                Close Preview
             </button>
             <button 
                onClick={handlePrint}
                className="bg-accent text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/30 flex items-center gap-3 hover:-translate-y-1 active:translate-y-0 transition-all"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Shipping Label
             </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;