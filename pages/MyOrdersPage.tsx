import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import InvoiceModal from '../components/InvoiceModal';
import { Order, OrderStatus } from '../types';

const getStatusColor = (status: OrderStatus) => {
    switch(status) {
        case 'Placed': return 'text-gray-400 bg-gray-50 border-gray-100';
        case 'Confirmed': return 'text-cyan-600 bg-cyan-50 border-cyan-100';
        case 'Packed': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Out for Delivery': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'Delivered': return 'text-green-600 bg-green-50 border-green-100';
        case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
        default: return 'text-gray-400 bg-gray-50 border-gray-100';
    }
}

const MyOrdersPage: React.FC = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  return (
    <div className="bg-surface min-h-screen pb-20">
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}

      <div className="sticky top-0 z-20 p-4 bg-white/80 backdrop-blur-md flex items-center border-b border-border shadow-sm">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2 bg-surface rounded-full border border-border">
            <ChevronLeftIcon className="h-5 w-5 text-text-main" />
        </button>
        <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">My Orders</h1>
      </div>
      
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-border p-10">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-text-main font-bold">No orders found</p>
            <p className="text-text-muted text-xs mt-1">Start shopping to see your history here.</p>
            <button onClick={() => navigate('/products')} className="mt-8 bg-accent text-white font-black uppercase text-[10px] tracking-widest py-4 px-8 rounded-2xl shadow-xl shadow-accent/20">
              Discover Products
            </button>
          </div>
        ) : (
          orders.map(order => {
            const isCOD = order.payment_mode === 'Cash on Delivery';
            const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

            return (
                <GlassmorphicCard key={order.id} className="p-0 overflow-hidden border-none shadow-premium bg-white">
                  <div className="p-5 flex justify-between items-start border-b border-gray-50">
                    <div>
                      <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Order Reference</p>
                      <p className="font-mono font-black text-text-main">#{order.id}</p>
                      <p className="text-[9px] text-text-muted font-bold mt-0.5 uppercase tracking-tighter">{new Date(order.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                  </div>

                  <Link to={`/order/${order.id}`} className="p-5 block hover:bg-surface transition-colors">
                      <div className="space-y-4">
                          {order.items.slice(0, 1).map(item => (
                              <div key={item.id} className="flex items-center gap-4">
                                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-border bg-surface" />
                                  <div className="flex-grow min-w-0">
                                      <p className="text-xs font-black text-text-main truncate uppercase italic">{item.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                          <p className="text-[10px] font-bold text-text-secondary uppercase">Qty: {item.quantity}</p>
                                          {order.items.length > 1 && <p className="text-[9px] text-text-muted font-black uppercase">+ {order.items.length - 1} More</p>}
                                      </div>
                                  </div>
                                  <div className="text-right">
                                       <p className="text-sm font-black text-accent italic">₹{order.total.toLocaleString()}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </Link>

                  <div className="p-5 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-text-muted tracking-widest">Payment Mode</p>
                             <p className="text-[10px] font-bold text-text-main uppercase">{order.payment_mode}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-text-muted tracking-widest">Status</p>
                             <p className={`text-[10px] font-black uppercase ${isCOD ? 'text-orange-500' : 'text-green-600'}`}>{paymentStatusText}</p>
                          </div>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedInvoice(order); }}
                        className="bg-white border border-border text-text-main px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:border-accent transition-all flex items-center gap-2"
                      >
                          <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Invoice
                      </button>
                  </div>
                </GlassmorphicCard>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;