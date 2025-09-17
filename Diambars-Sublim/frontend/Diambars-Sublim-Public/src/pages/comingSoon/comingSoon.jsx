// src/pages/ComingSoon/ComingSoon.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './comingSoon.css';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Próximamente | Diambars";
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <main className="coming-soon-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          🚧
        </div>
        
        <h1>¡Estamos trabajando en algo increíble!</h1>
        
        <p className="coming-soon-description">
          El panel de diseños estará disponible muy pronto. Estamos perfeccionando cada detalle 
          para ofrecerte la mejor experiencia de diseño personalizado.
        </p>
        
        <p className="coming-soon-suggestion">
          Mientras tanto, puedes explorar nuestro catálogo de productos disponibles 
          o conocer más sobre nosotros.
        </p>

        <div className="coming-soon-actions">
          <button
            className="home-button primary"
            onClick={handleGoHome}
          >
            Ir al inicio
          </button>
          <button
            className="back-button secondary"
            onClick={handleGoBack}
          >
            Volver atrás
          </button>
        </div>
      </div>
    </main>
  );
}
