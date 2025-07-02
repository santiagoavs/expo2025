import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login'); // Redirige a login después de 4 segundos
    }, 4000);

    return () => clearTimeout(timer); // Limpia el timer al desmontar
  }, [navigate]);

  return (
    <div className="diambars-welcome-screen" id="diambars-welcome-screen">
      <div className="diambars-logo-container" id="diambars-logo-container">
        <img src="/src/img/logo.png" alt="Logo Diambars" className="diambars-logo-img" />
        <h1 className="diambars-main-logo">DIAMBARS</h1>
        <p className="diambars-sublogo">sublimado</p>
      </div>
    </div>
  );
};

export default Welcome;