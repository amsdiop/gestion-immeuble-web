import React from 'react';
import { useNavigate } from 'react-router-dom';
import PinLogin from '../components/PinLogin';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/account-selection');
  };

  return <PinLogin onLoginSuccess={handleLoginSuccess} />;
}
