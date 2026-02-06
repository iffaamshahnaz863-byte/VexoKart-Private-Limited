
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to the main auth page, defaulting to the signup tab
    navigate('/login', { state: { defaultTab: 'signup' }, replace: true });
  }, [navigate]);
  return null;
};

export default VendorSignupPage;
