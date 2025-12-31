import React, { useState, useRef } from 'react';
import { Order, Vendor } from '../../types';

interface ShippingLabelModalProps {
  order: Order;
  vendor: Vendor;
  onClose: () => void;
  onGenerated: (url: string) => void;
}

const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  vendor,
  onClose,
  onGenerated,
}) => {
  const [pageSize, setPageSize] = useState<'A4' | '4x6'>('A4');
  const printRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     🔥 FINAL ADDRESS FIX (ROOT CAUSE SOLVED HERE)
     ========================================================= */
  const rawAddress =
    (order as any).shippingaddress ||
    order.shipping_address ||
    order.shippingAddress ||
    null;

  const getSafeValue = (val: any) => {
    if (val === undefined || val === null) return 'N/A';
    const str = String(val).trim();
    const lower = str.toLowerCase();
    if (
      str === '' ||
      str === '000000' ||
      lower === 'none' ||
      lower === 'n/a' ||
      lower === 'no phone' ||
      lower === 'street details missing'
    ) {
      return 'N/A';
    }
    return str;
  };

  const address = {
    fullName: getSafeValue(rawAddress?.fullName),
    street: getSafeValue(rawAddress?.street),
    city: getSafeValue(rawAddress?.city),
    state: getSafeValue(rawAddress?.state),
    zip: getSafeValue(rawAddress?.zip),
    phone: getSafeValue(rawAddress?.phone),
  };

  /* =========================================================
     QR + BARCODE
     ========================================================= */
  const qrPayload = JSON.stringify({
    orderId: String(order.id),
    paymentMode:
      order.payment_mode === 'Cash on Delivery' ? 'COD' : 'ONLINE',
    amount: Number(order.total || order.total_amount || 0),
    phone: address.phone,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrPayload
  )}`;

  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
    order.id
  )}&scale=2&includetext=true`;

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label #${order.id}</title>
          <style>
            body { margin: 0; font-family: Inter, sans-serif; }
            @page {
              size: ${pageSize === 'A4' ? 'A4' : '101.6mm 152.4mm'};
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isCOD = order.payment_mode === 'Cash on Delivery';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-black uppercase">Fulfillment Label</h2>
          <div className="flex gap-2">
            <button onClick={() => setPageSize('A4')}>A4</button>
            <button onClick={() => setPageSize('4x6')}>4x6</button>
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="p-6 bg-gray-100 flex justify-center">
          <div
            ref={printRef}
            className="bg-white border p-8 w-[600px]"
          >
            <div className="flex justify-between border-b pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-black">VexoKart</h1>
                <p className="text-xs uppercase">Logistics Hub</p>
              </div>
              <div className="text-right">
                <p className="font-black">{isCOD ? 'COD' : 'PREPAID'}</p>
                <p>Order #{order.id}</p>
              </div>
            </div>

            <div className="flex gap-6 border p-4 mb-6">
              <div className="flex-1">
                <h3 className="font-black uppercase mb-2">
                  Ship From
                </h3>
                <p className="font-bold">
                  {vendor.store_name || 'N/A'}
                </p>
                <p>{vendor.store_address || 'N/A'}</p>
                <p>Phone: {vendor.phone || 'N/A'}</p>
              </div>

              <div className="flex-1">
                <h3 className="font-black uppercase mb-2">
                  Deliver To
                </h3>
                <p className="font-bold">{address.fullName}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state}
                </p>
                <p>{address.zip}</p>
                <p>Phone: {address.phone}</p>
              </div>
            </div>

            <div className="flex gap-6 mb-6">
              <img src={qrUrl} className="w-32 h-32" />
              <img src={barcodeUrl} className="h-20" />
            </div>

            <table className="w-full border">
              <thead>
                <tr>
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="border p-2">{i.name}</td>
                    <td className="border p-2 text-center">
                      {i.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 text-right">
              <p className="font-black text-xl">
                ₹{(order.total || order.total_amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex justify-end gap-4 border-t">
          <button onClick={onClose}>Close</button>
          <button
            onClick={handlePrint}
            className="bg-orange-500 text-white px-6 py-2 rounded"
          >
            Print Fulfillment Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;
