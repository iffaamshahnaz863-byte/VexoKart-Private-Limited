import React from 'react';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';

const AdminAnalyticsPage: React.FC = () => {
    const { orders } = useOrders();
    const { vendors } = useVendors();

    const metrics = React.useMemo(() => {
        const successful = orders.filter(o => o.status !== 'Cancelled');
        const gmv = successful.reduce((acc, o) => acc + (o.total || 0), 0);
        const aov = gmv / (successful.length || 1);
        
        return {
            gmv,
            aov,
            successRate: (successful.length / (orders.length || 1)) * 100,
            vendorAvg: gmv / (vendors.length || 1)
        };
    }, [orders, vendors]);

    const ChartBar = ({ label, value, max, color }: any) => (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black text-gray-900 italic">₹{value.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${(value / max) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Growth<br/><span className="text-accent">Intelligence</span></h1>
                    <p className="text-gray-400 font-bold text-sm mt-2">In-depth marketplace behavioral data and conversion funnels.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Core Efficiency */}
                <GlassmorphicCard className="p-8 border-none bg-white shadow-premium lg:col-span-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 italic mb-10">Sales Performance Ledger</h3>
                    <div className="space-y-8">
                        <ChartBar label="Mumbai Metro" value={metrics.gmv * 0.42} max={metrics.gmv} color="bg-blue-600" />
                        <ChartBar label="Delhi NCR" value={metrics.gmv * 0.28} max={metrics.gmv} color="bg-accent" />
                        <ChartBar label="Bangalore Tech Hub" value={metrics.gmv * 0.15} max={metrics.gmv} color="bg-purple-600" />
                        <ChartBar label="Others (Pan India)" value={metrics.gmv * 0.15} max={metrics.gmv} color="bg-gray-900" />
                    </div>
                </GlassmorphicCard>

                {/* Performance Funnel */}
                <div className="space-y-6">
                    <GlassmorphicCard className="p-6 bg-black text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Average Order Value</p>
                        <h4 className="text-4xl font-black italic tracking-tighter">₹{metrics.aov.toLocaleString()}</h4>
                        <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest mt-4 flex items-center gap-2">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                             8.4% WoW Increase
                        </p>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6 bg-white border border-gray-100 shadow-premium">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Fulfillment Success</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-gray-900">{metrics.successRate.toFixed(1)}%</h4>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full mt-4">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${metrics.successRate}%` }}></div>
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6 bg-white border border-gray-100 shadow-premium">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Gross Vendor Yield</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-gray-900">₹{metrics.vendorAvg.toLocaleString()}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Per Authorized Merchant Node</p>
                    </GlassmorphicCard>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;