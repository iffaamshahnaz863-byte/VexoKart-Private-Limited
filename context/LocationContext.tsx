
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useServiceAreas } from './ServiceAreaContext';

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

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activePincodes, isLoading: isAreasLoading } = useServiceAreas();
  const [hasPermission, setHasPermission] = useState(false);
  const [isServiceable, setIsServiceable] = useState(false);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);
  const [addressArea, setAddressArea] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('vxk_daily_location');
    if (saved) {
        const { pincode, area } = JSON.parse(saved);
        if (pincode) {
            setCurrentPincode(pincode);
            setAddressArea(area);
            setHasPermission(true);
        }
    }
  }, []);

  // Re-validate when active pincodes change or user pincode changes
  useEffect(() => {
    if (currentPincode && activePincodes.length > 0) {
        const isValid = validatePincode(currentPincode);
        setIsServiceable(isValid);
        // Update session storage with new valid status
        const saved = sessionStorage.getItem('vxk_daily_location');
        if (saved) {
            const parsed = JSON.parse(saved);
            sessionStorage.setItem('vxk_daily_location', JSON.stringify({ ...parsed, serviceable: isValid }));
        }
    } else if (isAreasLoading) {
        // Assume serviceable while loading if we have a pincode, to prevent flash
        if(currentPincode) setIsServiceable(true); 
    }
  }, [currentPincode, activePincodes, isAreasLoading]);

  const validatePincode = (pincode: string) => {
    if (activePincodes.length === 0) return false; // Fail safe
    return activePincodes.includes(pincode);
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    if (hasPermission && isServiceable) return true;
    return false;
  };

  const requestLocation = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by your browser';
        alert(msg);
        reject(new Error(msg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // MOCKING SUCCESS for Demo - In real app, reverse geocode lat/lng
          // For demo purposes, we will pick the first active pincode if available, or a default
          const mockPincode = activePincodes.length > 0 ? activePincodes[0] : '122001'; 
          const mockArea = 'Detected GPS Location';
          
          setHasPermission(true);
          setCurrentPincode(mockPincode);
          setAddressArea(mockArea);
          // Validation happens in useEffect
          
          sessionStorage.setItem('vxk_daily_location', JSON.stringify({
              pincode: mockPincode,
              area: mockArea,
              serviceable: true // Optimistic
          }));
          
          resolve();
        },
        (error) => {
          let errorMessage = "Location check failed.";
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  errorMessage = "Location permission denied. Please enter manually.";
                  break;
              case error.POSITION_UNAVAILABLE:
                  errorMessage = "Location information is unavailable.";
                  break;
              case error.TIMEOUT:
                  errorMessage = "Location request timed out.";
                  break;
              default:
                  errorMessage = error.message || "Unknown location error";
          }
          setHasPermission(false);
          reject(new Error(errorMessage));
        }
      );
    });
  };

  const setManualLocation = (pincode: string, area: string) => {
      setHasPermission(true);
      setCurrentPincode(pincode);
      setAddressArea(area);
      // Validation happens in useEffect
      
      sessionStorage.setItem('vxk_daily_location', JSON.stringify({
          pincode,
          area,
          serviceable: false // Wait for effect
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
