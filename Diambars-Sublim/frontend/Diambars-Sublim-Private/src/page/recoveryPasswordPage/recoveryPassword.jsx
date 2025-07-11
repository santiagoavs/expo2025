import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
import { showSuccess, showError } from '../../utils/sweetAlert';
import './recoveryPassword.css';

const RecoveryPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      await showError(
        'Campo requerido',
        'Por favor, ingresa tu correo electrónico'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await showError(
        'Formato inválido',
        'Por favor, ingresa un correo electrónico válido'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      await showSuccess(
        '¡Correo enviado!',
        'Se han enviado las instrucciones a tu correo'
      );
      navigate('/code-confirmation');
    } catch (error) {
      await showError(
        'Error',
        'No se pudo enviar el correo. Por favor, intenta nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/login')}
        aria-label="Volver"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <DiambarsBrand />

      <div className="diambars-form-column">
        <DiambarsTitle text="Recupera tu contraseña" />
        
        <p className="recovery-description">
          Introduce tu correo electrónico.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="diambars-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="diambars-input"
              placeholder="Correo electrónico"
              required
            />
          </div>
          
          <div className="recovery-actions">
            <DiambarsButton 
              text="Enviar instrucciones"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </DiambarsCard>
  );
};

export default RecoveryPassword;