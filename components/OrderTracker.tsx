import React from 'react';
import { OrderStatus, StatusHistory } from '../types';

interface OrderTrackerProps {
  status: OrderStatus;
  history: StatusHistory[];
}

const ALL_STATUSES: OrderStatus[] = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTracker: React.FC<OrderTrackerProps> = ({ status, history }) => {

  if (status === 'Cancelled') {
    const cancelEntry = history.find(h => h.status === 'Cancelled');
    return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <p className="font-black text-red-600 uppercase tracking-tight italic">Order Cancelled</p>
            {cancelEntry && <p className="text-[10px] text-red-400 mt-1 uppercase font-bold">{cancelEntry.note || 'Cancelled by User/System'}</p>}
        </div>
    );
  }

  const getStatusTimestamp = (s: OrderStatus) => {
    const entry = [...history].reverse().find(h => h.status === s);
    return entry ? entry.timestamp : null;
  }

  const currentStatusIndex = ALL_STATUSES.indexOf(status);

  return (
    <div className="p-6 bg-white border border-border rounded-2xl">
        <div className="space-y-8">
            {ALL_STATUSES.map((step, index) => {
                const isCompleted = currentStatusIndex > index;
                const isActive = currentStatusIndex === index;
                const timestamp = getStatusTimestamp(step);
                const stepEntry = history.find(h => h.status === step);

                return (
                    <div key={step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${isCompleted ? 'bg-accent border-accent' : isActive ? 'bg-white border-accent shadow-lg shadow-accent/20' : 'bg-surface border-border'}`}>
                                {isCompleted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-accent animate-pulse' : 'bg-border'}`}></span>
                                )}
                            </div>
                            {index < ALL_STATUSES.length - 1 && (
                                <div className={`w-0.5 flex-grow my-1 transition-all duration-500 ${isCompleted ? 'bg-accent' : 'bg-border'}`}></div>
                            )}
                        </div>
                        <div className={`flex-grow pb-8 ${index === ALL_STATUSES.length - 1 ? 'pb-0' : ''}`}>
                            <div className="flex justify-between items-start">
                                <p className={`text-xs font-black uppercase tracking-widest ${isCompleted || isActive ? 'text-text-main' : 'text-text-muted'}`}>{step}</p>
                                {timestamp && <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter">{new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                            </div>
                            {stepEntry && (
                                <div className="mt-1">
                                    <span className="text-[8px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">{stepEntry.actor || 'System'} Update</span>
                                    {stepEntry.note && <p className="text-[10px] text-text-muted mt-1 italic font-medium leading-tight">"{stepEntry.note}"</p>}
                                </div>
                            )}
                            {isActive && !timestamp && (
                                <p className="text-[9px] text-accent mt-1 font-bold animate-pulse uppercase tracking-widest">In Progress...</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default OrderTracker;
