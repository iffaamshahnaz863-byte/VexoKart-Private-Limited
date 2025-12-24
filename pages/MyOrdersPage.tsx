
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const MyOrdersPage: React.FC = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-navy-charcoal flex items-center shadow-md">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">My Orders</h1>
      </div>
      
      <div className="p-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">You have no past orders.</p>
            <button onClick={() => navigate('/products')} className="mt-4 bg-purple-600 text-white font-bold py-2 px-6 rounded-lg">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <GlassmorphicCard key={order.id} className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-bold text-white">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold text-purple-400">₹{order.total.toFixed(2)}</p>
                </div>
                <div className="border-t border-gray-700/50 pt-3 space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center space-x-3 text-sm">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="text-gray-200 truncate">{item.name}</p>
                                <p className="text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-gray-300">₹{item.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
