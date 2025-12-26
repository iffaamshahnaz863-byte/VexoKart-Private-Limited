
import React from 'react';
import { OrderStatus, StatusHistory } from '../types';

interface OrderTrackerProps {
  status: OrderStatus;
  history: StatusHistory[];
}

const ALL_STATUSES: OrderStatus[] = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTracker: React.FC<OrderTrackerProps> = ({ status, history }) => {

  if (status === 'Cancelled') {
    return (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-center">
            <p className="font-bold text-red-400">Order Cancelled</p>
        </div>
    );
  }

  const getStatusTimestamp = (s: OrderStatus) => {
    const entry = [...history].reverse().find(h => h.status === s);
    return entry ? entry.timestamp : null;
  }

  const currentStatusIndex = ALL_STATUSES.indexOf(status);

  return (
    <div className="p-4 bg-navy-light/50 border border-gray-700/50 rounded-xl overflow-x-auto">
        <div className="flex" style={{ minWidth: '500px' }}>
            {ALL_STATUSES.map((step, index) => {
                const isCompleted = currentStatusIndex > index;
                const isActive = currentStatusIndex === index;
                const timestamp = getStatusTimestamp(step);

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center flex-shrink-0" style={{width: '16.66%'}}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted || isActive ? 'bg-accent border-accent' : 'bg-gray-600 border-gray-500'}`}>
                                {isCompleted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                                )}
                            </div>
                            <div className="text-center mt-2">
                                <p className={`text-xs font-semibold ${isCompleted || isActive ? 'text-white' : 'text-gray-400'}`}>{step}</p>
                                {timestamp && <p className="text-[10px] text-gray-500">{new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>}
                            </div>
                        </div>
                        {index < ALL_STATUSES.length - 1 && (
                            <div className={`flex-1 h-1 self-start mt-[15px] mx-1 transition-all duration-500 ${isCompleted ? 'bg-accent' : 'bg-gray-600'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );
};

export default OrderTracker;
