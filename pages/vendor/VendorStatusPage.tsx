
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Vendor } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';

interface VendorStatusPageProps {
  vendor: Vendor;
}

const StatusTimeline: React.FC<{ currentStatus: Vendor['status'] }> = ({ currentStatus }) => {
    const steps = ['Submitted', 'Under Review', 'Approved'];
    let activeIndex = 1; // "Under Review" is the default for pending
    if(currentStatus === 'approved') activeIndex = 2;

    return (
        <div className="flex items-center justify-center w-full max-w-sm mx-auto mt-8">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${index <= activeIndex ? 'bg-accent border-accent' : 'bg-surface border-gray-600'}`}>
                           {index < activeIndex ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           ) : (
                             <span className={`w-3 h-3 rounded-full ${index === activeIndex ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
                           )}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${index <= activeIndex ? 'text-text-main' : 'text-text-muted'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 transition-all duration-500 mx-2 ${index < activeIndex ? 'bg-accent' : 'bg-gray-600'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

const VendorStatusPage: React.FC<VendorStatusPageProps> = ({ vendor }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusContent = () => {
    switch (vendor.status) {
      case 'pending':
        return {
          title: "Account Under Review",
          message: "Your vendor application has been received and is currently being reviewed by our team. You will be notified via email once the process is complete. Thank you for your patience.",
          showTimeline: true
        };
      case 'rejected':
        return {
          title: "Application Rejected",
          message: "We regret to inform you that your vendor application was not approved at this time. Please see the reason provided by the administrator below.",
          showTimeline: false
        };
      case 'suspended':
        return {
          title: "Account Suspended",
          message: "Your vendor account has been temporarily suspended. Please check your email for details or contact our support team to resolve this issue.",
          showTimeline: false
        };
      default:
        return { title: '', message: '', showTimeline: false };
    }
  };

  const { title, message, showTimeline } = getStatusContent();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
        <img 
            src={vendor.storeLogo} 
            alt={`${vendor.storeName} logo`} 
            className="w-28 h-28 rounded-full border-4 border-surface object-cover mb-4" 
        />
        <h1 className="text-2xl font-bold text-text-main">{vendor.storeName}</h1>
        
        <GlassmorphicCard className="w-full max-w-lg mt-8 p-8">
            <h2 className="text-xl font-bold text-accent mb-4">{title}</h2>
            <p className="text-text-secondary">{message}</p>
            {vendor.status === 'rejected' && vendor.rejectionReason && (
              <div className="mt-6 text-left p-4 bg-surface/50 border border-gray-700/50 rounded-lg">
                <p className="text-sm font-semibold text-text-secondary mb-2">Reason for Rejection:</p>
                <blockquote className="text-sm text-text-main italic border-l-4 border-red-500 pl-4">
                  {vendor.rejectionReason}
                </blockquote>
              </div>
            )}
            {showTimeline && <StatusTimeline currentStatus={vendor.status} />}
        </GlassmorphicCard>
        
        <button 
            onClick={handleLogout} 
            className="mt-8 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 font-bold py-3 px-8 rounded-xl hover:bg-red-500/20"
        >
            Logout
        </button>
    </div>
  );
};

export default VendorStatusPage;