import React, { useEffect, useState } from 'react';
 
const SplashScreen = ({ onComplete }) => {
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
 
    // Completar splash después de la animación
    const navigationTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 4000);
 
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(navigationTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);
 
  return (
    <>
      {/* CSS integrado */}
      <style>{`
        :root {
          --gradient-start: #F0D8AB;
          --gradient-end: #FFF6E2;
          --accent-gold: #D4AF37;
          --text-primary: #2C2C2C;
          --text-secondary: #666666;
          --shadow-light: rgba(240, 216, 171, 0.3);
          --shadow-medium: rgba(0, 0, 0, 0.1);
          --transition-smooth: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-bounce: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
 
        .diambars-welcome-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          background: radial-gradient(
            ellipse 80% 50% at 50% 40%,
            var(--gradient-start) 0%,
            var(--gradient-end) 100%
          );
          animation: welcomeEntrance 1s ease-out;
          z-index: 9999;
        }
 
        @keyframes welcomeEntrance {
          from {
            opacity: 0;
            transform: scale(1.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
 
        .background-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
 
        .particle {
          position: absolute;
          background: linear-gradient(45deg, var(--accent-gold), var(--gradient-start));
          border-radius: 50%;
          opacity: 0.6;
          animation: floatParticle 6s ease-in-out infinite;
        }
 
        .particle-1 { width: 4px; height: 4px; top: 20%; left: 10%; animation-delay: 0s; }
        .particle-2 { width: 6px; height: 6px; top: 60%; left: 85%; animation-delay: 1s; }
        .particle-3 { width: 3px; height: 3px; top: 80%; left: 20%; animation-delay: 2s; }
        .particle-4 { width: 5px; height: 5px; top: 30%; left: 70%; animation-delay: 3s; }
        .particle-5 { width: 4px; height: 4px; top: 15%; left: 60%; animation-delay: 4s; }
        .particle-6 { width: 7px; height: 7px; top: 70%; left: 15%; animation-delay: 5s; }
        .particle-7 { width: 3px; height: 3px; top: 40%; left: 90%; animation-delay: 0.5s; }
        .particle-8 { width: 5px; height: 5px; top: 85%; left: 50%; animation-delay: 1.5s; }
        .particle-9 { width: 4px; height: 4px; top: 25%; left: 30%; animation-delay: 2.5s; }
        .particle-10 { width: 6px; height: 6px; top: 55%; left: 5%; animation-delay: 3.5s; }
        .particle-11 { width: 5px; height: 5px; top: 35%; left: 45%; animation-delay: 6s; }
        .particle-12 { width: 4px; height: 4px; top: 65%; left: 25%; animation-delay: 7s; }
        .particle-13 { width: 3px; height: 3px; top: 50%; left: 80%; animation-delay: 8s; }
        .particle-14 { width: 6px; height: 6px; top: 10%; left: 75%; animation-delay: 9s; }
        .particle-15 { width: 4px; height: 4px; top: 90%; left: 60%; animation-delay: 10s; }
        .particle-16 { width: 5px; height: 5px; top: 45%; left: 15%; animation-delay: 11s; }
        .particle-17 { width: 3px; height: 3px; top: 75%; left: 85%; animation-delay: 12s; }
        .particle-18 { width: 4px; height: 4px; top: 30%; left: 95%; animation-delay: 13s; }
        .particle-19 { width: 6px; height: 6px; top: 85%; left: 35%; animation-delay: 14s; }
        .particle-20 { width: 5px; height: 5px; top: 15%; left: 25%; animation-delay: 15s; }
 
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
 
        .diambars-main-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: translateY(30px);
          transition: var(--transition-smooth);
        }
 
        .diambars-main-container.loaded {
          opacity: 1;
          transform: translateY(0);
        }
 
        .diambars-logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
 
        .diambars-logo-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
 
        .logo-glow {
          position: absolute;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, var(--shadow-light) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulseGlow 3s ease-in-out infinite;
          z-index: -1;
        }
 
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
 
        .diambars-logo-img {
          width: 120px;
          height: auto;
          filter: drop-shadow(0 8px 16px var(--shadow-medium));
          transition: var(--transition-smooth);
          animation: logoFloat 4s ease-in-out infinite;
        }
 
        /* Fallback para cuando no se puede cargar la imagen */
        .diambars-logo-placeholder {
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, var(--accent-gold), var(--gradient-start));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          filter: drop-shadow(0 8px 16px var(--shadow-medium));
          transition: var(--transition-smooth);
          animation: logoFloat 4s ease-in-out infinite;
        }
 
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
 
        .diambars-text-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
 
        .diambars-main-logo {
          font-size: 4rem;
          font-weight: 700;
          letter-spacing: 0.2rem;
          margin: 0;
          padding: 0;
          color: var(--text-primary);
          text-shadow: 2px 2px 4px var(--shadow-medium);
          display: flex;
          gap: 0.1rem;
        }
 
        .diambars-main-logo .letter {
          display: inline-block;
          animation: letterDance 0.6s ease-out forwards;
          transform: translateY(20px);
          opacity: 0;
          transition: var(--transition-bounce);
        }
 
        .diambars-main-logo .letter:nth-child(1) { animation-delay: 0.1s; }
        .diambars-main-logo .letter:nth-child(2) { animation-delay: 0.2s; }
        .diambars-main-logo .letter:nth-child(3) { animation-delay: 0.3s; }
        .diambars-main-logo .letter:nth-child(4) { animation-delay: 0.4s; }
        .diambars-main-logo .letter:nth-child(5) { animation-delay: 0.5s; }
        .diambars-main-logo .letter:nth-child(6) { animation-delay: 0.6s; }
        .diambars-main-logo .letter:nth-child(7) { animation-delay: 0.7s; }
        .diambars-main-logo .letter:nth-child(8) { animation-delay: 0.8s; }
 
        @keyframes letterDance {
          0% {
            transform: translateY(20px) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
        }
 
        .diambars-main-logo .letter:hover {
          transform: translateY(-5px) scale(1.1);
          color: var(--accent-gold);
          text-shadow: 0 5px 15px var(--shadow-light);
        }
 
        .diambars-sublogo {
          font-size: 2rem;
          font-weight: 300;
          letter-spacing: 0.8rem;
          margin: 0;
          padding: 0;
          color: var(--text-secondary);
          text-transform: lowercase;
          font-style: italic;
          opacity: 0;
          animation: slideUp 0.8s ease-out 1s forwards;
        }
 
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
 
        .brand-tagline {
          font-size: 1rem;
          font-weight: 400;
          color: var(--accent-gold);
          letter-spacing: 0.1rem;
          margin-top: 0.5rem;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 1.5s forwards;
          text-shadow: 1px 1px 2px var(--shadow-medium);
        }
 
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
 
        .progress-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }
 
        .progress-bar {
          width: 300px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
 
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-gold), var(--gradient-start));
          border-radius: 2px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--accent-gold);
          animation: progressGlow 2s ease-in-out infinite;
        }
 
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 5px var(--accent-gold); }
          50% { box-shadow: 0 0 20px var(--accent-gold), 0 0 30px var(--shadow-light); }
        }
 
        .loading-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 300;
          letter-spacing: 0.05rem;
          animation: textPulse 2s ease-in-out infinite;
        }
 
        @keyframes textPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
 
        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
 
        .floating-shape {
          position: absolute;
          background: linear-gradient(45deg, var(--gradient-start), var(--accent-gold));
          opacity: 0.1;
          animation: floatShape 8s ease-in-out infinite;
        }
 
        .shape-1 {
          width: 100px;
          height: 100px;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
 
        .shape-2 {
          width: 80px;
          height: 80px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          top: 70%;
          right: 15%;
          animation-delay: 2s;
        }
 
        .shape-3 {
          width: 60px;
          height: 60px;
          border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }
 
        @keyframes floatShape {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(20px, -20px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translate(-10px, -40px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translate(-30px, -10px) rotate(270deg) scale(1.05);
          }
        }
 
        .transition-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gradient-end);
          opacity: 0;
          pointer-events: none;
          z-index: 10;
          animation: fadeOutTransition 1s ease-in-out 3.5s forwards;
        }
 
        @keyframes fadeOutTransition {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
 
        @media (max-width: 768px) {
          .diambars-main-logo {
            font-size: 2.8rem;
            letter-spacing: 0.15rem;
          }
 
          .diambars-sublogo {
            font-size: 1.5rem;
            letter-spacing: 0.5rem;
          }
 
          .brand-tagline {
            font-size: 0.9rem;
          }
 
          .diambars-logo-img,
          .diambars-logo-placeholder {
            width: 100px;
          }
 
          .diambars-logo-placeholder {
            height: 100px;
            font-size: 1.5rem;
          }
 
          .logo-glow {
            width: 120px;
            height: 120px;
          }
 
          .progress-bar {
            width: 250px;
          }
 
          .particle {
            display: none;
          }
        }
 
        @media (max-width: 480px) {
          .diambars-main-logo {
            font-size: 2.2rem;
            letter-spacing: 0.1rem;
          }
 
          .diambars-sublogo {
            font-size: 1.2rem;
            letter-spacing: 0.3rem;
          }
 
          .brand-tagline {
            font-size: 0.8rem;
          }
 
          .diambars-logo-img,
          .diambars-logo-placeholder {
            width: 80px;
          }
 
          .diambars-logo-placeholder {
            height: 80px;
            font-size: 1.2rem;
          }
 
          .logo-glow {
            width: 100px;
            height: 100px;
          }
 
          .progress-bar {
            width: 200px;
            height: 3px;
          }
 
          .floating-shape {
            display: none;
          }
        }
 
        .diambars-welcome-screen.exit {
          animation: exitAnimation 1s ease-in-out forwards;
        }
 
        @keyframes exitAnimation {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>
 
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
              {/* Intenta cargar la imagen, si falla muestra el placeholder */}
              <img
                src="/src/img/logo.png"
                alt="Logo Diambars"
                className="diambars-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="diambars-logo-placeholder" style={{ display: 'none' }}>
                D
              </div>
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
    </>
  );
};
 
export default SplashScreen;