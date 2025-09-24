import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';
import unauthorizedImage from '../src/assets/401-Error-Unauthorized-1.png';

function Unauthorized() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/'); // Replace with your login route
  };

  return (
    <div className="unauthorized-container">
      <img src={unauthorizedImage} alt="401 Unauthorized" className="unauthorized-image" />
      <button onClick={handleBackToLogin} className="back-to-login-button">
        Back to Login
      </button>
    </div>
  );
}

export default Unauthorized;
