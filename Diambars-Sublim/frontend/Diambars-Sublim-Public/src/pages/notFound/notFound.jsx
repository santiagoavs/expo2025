// src/pages/NotFound/NotFound.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './notFound.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Página no encontrada | Diambars";
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <main className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-icon">
          4<span className="zero">0</span>4
        </div>
        
        <h1>¡Ups! Página no encontrada</h1>
        
        <p className="notfound-description">
          La página que estás buscando no existe o ha sido movida.
        </p>
        
        <p className="notfound-suggestion">
          Puedes volver a la página de inicio o intentar buscar lo que necesitas.
        </p>

        <div className="notfound-actions">
          <button
            className="home-button"
            onClick={handleGoHome}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}