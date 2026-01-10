
import React, { useState } from 'react';
import { useLocationService } from '../context/LocationContext';
import GlassmorphicCard from './GlassmorphicCard';

interface LocationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ onClose, onSuccess }) => {
  const { requestLocation, setManualLocation } = useLocationService();
  const [view, setView] = useState<'prompt' | 'manual'>('prompt');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGPS = async () => {
    setIsLoading(true);
    try {
        await requestLocation();
        onSuccess();
    } catch (e) {
        setError('Could not fetch location. Please try manually.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
        setError("Please enter a valid 6-digit Pincode");
        return;
    }
    // Mocking Area name for manual entry
    setManualLocation(pincode, `Area ${pincode}`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <GlassmorphicCard className="w-full max-w-sm bg-white border-none shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            
            <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight mb-2">Location Required</h2>
            <p className="text-gray-500 text-xs font-medium mb-6 leading-relaxed max-w-[250px]">
                To ensure 10-minute delivery, we need to check if "Daily Needs" is available in your area.
            </p>

            {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 px-3 py-1 rounded-lg">{error}</p>}

            {view === 'prompt' ? (
                <div className="w-full space-y-3">
                    <button 
                        onClick={handleGPS}
                        disabled={isLoading}
                        className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>Getting Coordinates...</>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Enable Device Location
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => setView('manual')}
                        className="w-full bg-gray-50 text-gray-800 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        Enter Location Manually
                    </button>
                </div>
            ) : (
                <form onSubmit={handleManual} className="w-full space-y-4">
                    <div>
                        <input 
                            type="tel" 
                            maxLength={6}
                            placeholder="Enter 6-digit Pincode" 
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center font-bold text-lg focus:outline-none focus:border-accent"
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                    >
                        Check Availability
                    </button>
                    <button 
                        type="button"
                        onClick={() => setView('prompt')}
                        className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-600"
                    >
                        Back
                    </button>
                </form>
            )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default LocationModal;
