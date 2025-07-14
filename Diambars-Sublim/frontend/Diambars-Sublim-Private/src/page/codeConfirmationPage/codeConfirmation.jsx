import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './codeConfirmation.css';

const CodeConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener el email del estado de navegación
  const stateEmail = location.state?.email;

  const {
    email,
    setEmail,
    code,
    isSubmitting,
    error,
    timer,
    canResend,
    handleVerifyCode,
    handleResendCode,
    handleInputChange, // Extraer la función
    handleKeyDown     // Extraer la función
  } = usePasswordRecovery();

  useEffect(() => {
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [stateEmail, setEmail]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleVerifyCode();
  };

  return (
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/recovery-password')}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <DiambarsBrand />
      
      <div className="diambars-form-column">
        <DiambarsTitle text="Verifica tu código" />
        
        <p className="code-description">
          Ingresa el código de 6 dígitos enviado a tu correo
        </p>
        
        {email && (
          <p className="email-display">
            {email}
          </p>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="code-input-group">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                inputMode='numeric'
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
              />
            ))}
          </div>
          
          <div className="code-actions">
            <DiambarsButton 
              text={isSubmitting ? "Verificando..." : "Verificar código"}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            />
            
            <button
              type="button"
              className={`resend-code ${!canResend ? 'disabled' : ''}`}
              onClick={handleResendCode}
              disabled={!canResend || isSubmitting}
            >
              {canResend ? 'Reenviar código' : `Reenviar en ${timer}s`}
            </button>
          </div>
        </form>
      </div>
    </DiambarsCard>
  );
};

export default CodeConfirmationPage;