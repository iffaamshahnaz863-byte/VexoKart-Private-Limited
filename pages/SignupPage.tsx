
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { state: { defaultTab: 'signup' }, replace: true });
  }, [navigate]);
  return null;
};

export default SignupPage;
