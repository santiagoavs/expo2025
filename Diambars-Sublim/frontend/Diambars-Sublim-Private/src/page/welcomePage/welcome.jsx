import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
 
const Welcome = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
 
  useEffect(() => {
    // Animación de carga inicial
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
 
    // Simulación de progreso de carga
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
 
    // Navegación después de completar la animación
    const navigationTimer = setTimeout(() => {
      navigate('/login');
    }, 4000);
 
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(navigationTimer);
      clearInterval(progressInterval);
    };
  }, [navigate]);
 
  return (
    <div className="diambars-welcome-screen">
      {/* Partículas de fondo */}
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
 
      {/* Contenedor principal */}
      <div className={`diambars-main-container ${isLoaded ? 'loaded' : ''}`}>
       
        {/* Logo y contenido principal */}
        <div className="diambars-logo-section">
          <div className="diambars-logo-wrapper">
            <div className="logo-glow"></div>
            <img
              src="/src/img/logo.png"
              alt="Logo Diambars"
              className="diambars-logo-img"
            />
          </div>
         
          <div className="diambars-text-content">
            <h1 className="diambars-main-logo">
              <span className="letter">D</span>
              <span className="letter">I</span>
              <span className="letter">A</span>
              <span className="letter">M</span>
              <span className="letter">B</span>
              <span className="letter">A</span>
              <span className="letter">R</span>
              <span className="letter">S</span>
            </h1>
            <p className="diambars-sublogo">sublimado</p>
            <div className="brand-tagline">Calidad que perdura</div>
          </div>
        </div>
 
        {/* Barra de progreso */}
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="loading-text">Cargando experiencia...</div>
        </div>
 
        {/* Elementos decorativos */}
        <div className="decorative-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
 
      {/* Overlay de transición */}
      <div className="transition-overlay"></div>
    </div>
  );
};
 
export default Welcome;