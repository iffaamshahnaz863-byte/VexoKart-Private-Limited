
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { Order, OrderStatus } from '../types';

const getStatusTheme = (status: OrderStatus) => {
    switch(status) {
// Fix: Use capitalized status values to match the OrderStatus type
        case 'Delivered': return { text: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', icon: '✓' };
        case 'Cancelled': return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: '✕' };
        case 'Placed': case 'Confirmed': case 'Packed': return { text: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50', icon: '•' };
        default: return { text: 'In Transit', color: 'text-blue-600', bg: 'bg-blue-50', icon: '•' };
    }
}

const MyOrdersPage: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    return orders.filter(o => 
      o.items?.some((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.id.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 font-sans select-none">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-1">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-800 uppercase tracking-tight">My Orders</h1>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search by product name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-accent"
              />
              <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <button className="px-3 border border-gray-200 rounded-lg flex items-center justify-center bg-white active:bg-gray-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-dashed border-gray-200 mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-sm font-bold text-gray-700">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Start shopping to see your history.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const theme = getStatusTheme(order.status);
            const firstItem = order.items?.[0];
            const dateStr = new Date(order.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' });

            if (!firstItem) return null;

            return (
              <Link 
                to={`/order/${order.id}`} 
                key={order.id} 
                className="block bg-white border border-gray-100 rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={firstItem.image} alt="" className="w-full h-full object-contain" />
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                       <h3 className="text-sm font-bold text-gray-700 line-clamp-1 truncate">{firstItem.name}</h3>
                       <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                       <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${theme.bg} ${theme.color}`}>
                         {theme.icon} {theme.text}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400">{dateStr}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                       {firstItem.size && (
                         <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Size: {firstItem.size}</span>
                       )}
                       {firstItem.color && (
                         <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Color: {firstItem.color}</span>
                       )}
                       <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Qty: {firstItem.quantity}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
