
import React from 'react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white text-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">VexoKart</h1>
                    <p className="text-gray-500">Shop Online, Shop Smart</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold uppercase text-gray-500">Invoice</h2>
                    <p className="text-sm text-gray-600">#INV-{order.id}</p>
                </div>
            </div>

            <div className="border-t-2 border-gray-200 my-6"></div>

            <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                    <p className="font-semibold text-gray-600 mb-1">Billed To:</p>
                    <p className="font-bold">{order.shippingAddress.fullName}</p>
                    <p>{order.userEmail}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold text-gray-600">Order ID:</span> #{order.id}</p>
                    <p><span className="font-semibold text-gray-600">Invoice Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                    {order.paymentId && <p><span className="font-semibold text-gray-600">Payment ID:</span> {order.paymentId}</p>}
                </div>
            </div>

            <div className="my-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 text-sm text-gray-600 uppercase">
                            <th className="p-3">Product</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id} className="border-b border-gray-100 text-sm">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                                <td className="p-3 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <div className="w-full max-w-xs text-sm">
                     <div className="flex justify-between py-1"><span className="text-gray-600">Subtotal</span><span>₹{order.total.toFixed(2)}</span></div>
                     <div className="flex justify-between py-1"><span className="text-gray-600">Shipping</span><span>₹0.00</span></div>
                     <div className="border-t-2 border-gray-200 my-2"></div>
                     <div className="flex justify-between font-bold text-base"><span className="text-gray-900">Grand Total</span><span className="text-teal-600">₹{order.total.toFixed(2)}</span></div>
                </div>
            </div>
            
            <div className="mt-10 relative">
                <p className="text-center text-xs text-gray-400">Thank you for your business!</p>
                <div className="absolute -top-4 right-0">
                    <div className="border-4 border-green-500 text-green-500 font-bold uppercase text-2xl px-4 py-2 rounded-lg transform -rotate-12">
                        PAID
                    </div>
                </div>
            </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-bold">&times;</button>
      </div>
    </div>
  );
};

export default InvoiceModal;
