
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { OrderStatus } from '../types';

const getStatusColor = (status: OrderStatus) => {
    switch(status) {
        case 'Placed': return 'text-gray-300 bg-gray-700/50 border-gray-600/50';
        case 'Confirmed': return 'text-cyan-400 bg-cyan-900/50 border-cyan-600/50';
        case 'Packed': return 'text-indigo-400 bg-indigo-900/50 border-indigo-600/50';
        case 'Shipped': return 'text-blue-400 bg-blue-900/50 border-blue-600/50';
        case 'Out for Delivery': return 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50';
        case 'Delivered': return 'text-green-400 bg-green-900/50 border-green-600/50';
        case 'Cancelled': return 'text-red-400 bg-red-900/50 border-red-600/50';
        default: return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
    }
}

const MyOrdersPage: React.FC = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-background flex items-center shadow-md">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-text-main" />
        </button>
        <h1 className="text-xl font-bold text-text-main">My Orders</h1>
      </div>
      
      <div className="p-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">You have no past orders.</p>
            <button onClick={() => navigate('/products')} className="mt-4 bg-accent text-white font-bold py-2 px-6 rounded-lg">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link to={`/order/${order.id}`} key={order.id}>
                <GlassmorphicCard className="p-4 hover:border-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-text-main">Order #{order.id}</p>
                      <p className="text-xs text-text-muted">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">₹{order.total.toFixed(2)}</p>
                      <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700/50 pt-3 space-y-2">
                      {order.items.slice(0, 2).map(item => (
                          <div key={item.id} className="flex items-center space-x-3 text-sm">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                              <div className="flex-grow">
                                  <p className="text-text-secondary truncate">{item.name}</p>
                                  <p className="text-text-muted">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-text-secondary">₹{item.price.toFixed(2)}</p>
                          </div>
                      ))}
                       {order.items.length > 2 && <p className="text-xs text-text-muted text-center">+ {order.items.length - 2} more items</p>}
                  </div>
                </GlassmorphicCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;