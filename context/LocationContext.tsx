
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface LocationContextType {
  hasPermission: boolean;
  isServiceable: boolean;
  currentPincode: string | null;
  addressArea: string | null;
  checkLocationPermission: () => Promise<boolean>;
  requestLocation: () => Promise<void>;
  setManualLocation: (pincode: string, area: string) => void;
  resetLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Mock Serviceable Pincodes (Simulating Backend Logic)
const SERVICEABLE_PREFIXES = ['11', '12', '40', '56']; // Delhi, Gurgaon, Mumbai, Bangalore prefixes

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isServiceable, setIsServiceable] = useState(false);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);
  const [addressArea, setAddressArea] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('vxk_daily_location');
    if (saved) {
        const { pincode, area, serviceable } = JSON.parse(saved);
        setCurrentPincode(pincode);
        setAddressArea(area);
        setIsServiceable(serviceable);
        setHasPermission(true);
    }
  }, []);

  const validatePincode = (pincode: string) => {
    return SERVICEABLE_PREFIXES.some(prefix => pincode.startsWith(prefix));
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    if (hasPermission && isServiceable) return true;
    return false;
  };

  const requestLocation = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        reject();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In a real app, Reverse Geocode lat/lng here using Google Maps API
          // MOCKING SUCCESS for Demo
          const mockPincode = '122001'; 
          const mockArea = 'DLF Phase 4, Gurgaon';
          
          const serviceable = validatePincode(mockPincode);
          
          setHasPermission(true);
          setCurrentPincode(mockPincode);
          setAddressArea(mockArea);
          setIsServiceable(serviceable);
          
          sessionStorage.setItem('vxk_daily_location', JSON.stringify({
              pincode: mockPincode,
              area: mockArea,
              serviceable
          }));
          
          resolve();
        },
        (error) => {
          console.error("Location Error:", error);
          setHasPermission(false);
          reject(error);
        }
      );
    });
  };

  const setManualLocation = (pincode: string, area: string) => {
      const serviceable = validatePincode(pincode);
      setHasPermission(true);
      setCurrentPincode(pincode);
      setAddressArea(area);
      setIsServiceable(serviceable);
      
      sessionStorage.setItem('vxk_daily_location', JSON.stringify({
          pincode,
          area,
          serviceable
      }));
  };

  const resetLocation = () => {
      setHasPermission(false);
      setIsServiceable(false);
      setCurrentPincode(null);
      setAddressArea(null);
      sessionStorage.removeItem('vxk_daily_location');
  };

  return (
    <LocationContext.Provider value={{ 
      hasPermission, 
      isServiceable, 
      currentPincode, 
      addressArea, 
      checkLocationPermission, 
      requestLocation, 
      setManualLocation,
      resetLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationService = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationService must be used within LocationProvider');
  return context;
};
