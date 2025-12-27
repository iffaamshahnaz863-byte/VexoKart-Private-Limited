
import React, { useState, useRef } from 'react';
import { Order, Vendor } from '../../types';
import GlassmorphicCard from '../GlassmorphicCard';

interface ShippingLabelModalProps {
  order: Order;
  vendor: Vendor;
  onClose: () => void;
  onGenerated: (url: string) => void;
}

const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ order, vendor, onClose, onGenerated }) => {
  const [pageSize, setPageSize] = useState<'A4' | '4x6'>('A4');
  const [includeInvoice, setIncludeInvoice] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create a printable window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - Order #${order.id}</title>
          ${styles}
          <style>
            @media print {
              body { background: white; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .print-container { width: 100%; }
              .label-page { page-break-after: always; padding: 20px; border: 1px dashed #ccc; }
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
    
    // Simulate generation of a URL for persistence
    onGenerated(`blob:vexokart/labels/${order.id}`);
  };

  const barcodePlaceholder = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${order.id}&scale=2&rotate=N&includetext=true`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">Label Generator</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Order Ref: #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-surface/50 border-b border-border flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
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
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={includeInvoice} 
                  onChange={(e) => setIncludeInvoice(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-[10px] font-black uppercase text-text-muted group-hover:text-text-main transition-colors">Attach Digital Invoice</span>
            </label>
        </div>

        {/* Preview Area */}
        <div className="flex-grow overflow-y-auto p-8 bg-surface/30">
          <div className="flex justify-center">
             <div ref={printRef} className={`bg-white shadow-2xl origin-top transition-all duration-500 overflow-hidden ${pageSize === 'A4' ? 'w-[595px] h-[842px]' : 'w-[400px] h-[600px]'} border border-gray-200`}>
                <div className="p-8 h-full flex flex-col text-black">
                    {/* Brand & Tracking Barcode */}
                    <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Vexo<span className="text-gray-600">Kart</span></h1>
                            <p className="text-[9px] font-black uppercase tracking-widest mt-1">Premium Delivery Network</p>
                        </div>
                        <div className="text-right">
                             <img src={barcodePlaceholder} alt="Order Barcode" className="h-10 mb-1" />
                             <p className="text-[8px] font-bold font-mono">ORDER: #{order.id}</p>
                        </div>
                    </div>

                    {/* From & To Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8 border-b-2 border-black pb-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Shipper / Dispatch From:</p>
                            <p className="font-black text-base leading-tight">{vendor.storeName}</p>
                            <p className="text-sm font-medium leading-relaxed mt-1">{vendor.storeAddress || 'Vendor Warehouse HQ'}</p>
                            <p className="text-sm font-bold mt-2">TEL: {vendor.storePhone || '+91 XXXX XXX XXX'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Recipient / Ship To:</p>
                            <p className="font-black text-xl leading-none">{order.shippingAddress.fullName}</p>
                            <p className="text-base font-bold leading-tight mt-2">{order.shippingAddress.street}</p>
                            <p className="text-base font-bold">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                            <div className="mt-4 p-2 bg-black text-white rounded inline-block">
                                <p className="text-xs font-black">PH: {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="grid grid-cols-3 gap-4 mb-8 border-b-2 border-black pb-8">
                        <div className="border-r border-gray-300 pr-4">
                            <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Carrier</p>
                            <p className="font-black text-sm uppercase">{order.courierName || 'SELF-SHIPPED'}</p>
                        </div>
                        <div className="border-r border-gray-300 px-4">
                             <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Tracking ID</p>
                             <p className="font-black text-sm font-mono">{order.trackingId || 'PENDING'}</p>
                        </div>
                        <div className="pl-4">
                             <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Weight (est)</p>
                             <p className="font-black text-sm">0.85 KG</p>
                        </div>
                    </div>

                    {/* Product Summary */}
                    <div className="flex-grow">
                         <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Package Contents:</p>
                         <table className="w-full text-left">
                            <thead className="border-b border-black">
                                <tr className="text-[9px] font-black uppercase">
                                    <th className="pb-2">Description</th>
                                    <th className="pb-2 text-center">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-2 text-xs font-bold">{item.name}</td>
                                        <td className="py-2 text-xs font-bold text-center">x{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>

                    {/* Footer Payment Info */}
                    <div className="mt-auto pt-6 border-t-4 border-black">
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Service Mode</p>
                                <p className="text-xl font-black italic tracking-tighter uppercase">{order.paymentMethod}</p>
                            </div>
                            {order.paymentMethod === 'Cash on Delivery' && (
                                <div className="text-right p-4 border-2 border-black rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Collect COD Amount</p>
                                    <p className="text-3xl font-black">₹{order.total.toLocaleString()}</p>
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-gray-400">Generated: {new Date().toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-gray-400">Powered by VexoKart Logistic Hub</p>
                            </div>
                         </div>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t border-border flex justify-end gap-4">
             <button 
                onClick={onClose}
                className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface transition-all"
             >
                Cancel
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
