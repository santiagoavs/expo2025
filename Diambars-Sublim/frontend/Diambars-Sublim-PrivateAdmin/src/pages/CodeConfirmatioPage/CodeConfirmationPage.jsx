import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Warning, 
  CheckCircle,
  CircleNotch,
  PaperPlaneTilt
} from '@phosphor-icons/react';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './CodeConfirmationPage.css';

const CodeConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener el email del estado de navegación
  const stateEmail = location.state?.email;
  const fromRecovery = location.state?.fromRecovery;

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
    handleInputChange,
    handleKeyDown
  } = usePasswordRecovery();

  // Verificar que venimos del flujo correcto
  useEffect(() => {
    if (!stateEmail && !email) {
      console.warn('No hay email disponible, redirigiendo a recovery');
      navigate('/recovery-password', {
        state: { 
          error: 'Debes ingresar tu email primero' 
        }
      });
      return;
    }

    if (stateEmail && stateEmail !== email) {
      setEmail(stateEmail);
    }
  }, [stateEmail, email, setEmail, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que el código esté completo
    if (code.length !== 6 || code.some(digit => !digit)) {
      return;
    }

    // El hook ya maneja la navegación internamente
    await handleVerifyCode();
  };

  const handleBack = () => {
    // Decidir a dónde volver según de dónde venimos
    if (fromRecovery) {
      navigate('/recovery-password');
    } else {
      navigate('/recovery-password');
    }
  };

  const handleResend = async () => {
    // El hook ya maneja toda la lógica del reenvío
    await handleResendCode();
  };

  return (
    <div className="diambars-code-container">
      {/* Partículas de fondo */}
      <div className="diambars-code-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`code-particle code-particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Card principal */}
      <div className="diambars-code-card">
        {/* Botón de volver */}
        <button 
          className="code-back-button"
          onClick={handleBack}
          aria-label="Volver"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        {/* Sección de branding */}
        <div className="diambars-code-brand">
          <div className="code-brand-content">
            <div className="code-logo-wrapper">
              <div className="code-logo-glow"></div>
              <img 
                src="/logo.png" 
                alt="Logo Diambars" 
                className="code-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="code-logo-placeholder" style={{ display: 'none' }}>
                D
              </div>
            </div>
            
            <div className="code-brand-text">
              <h1 className="code-brand-title">DIAMBARS</h1>
              <p className="code-brand-subtitle">sublimado</p>
            </div>
          </div>

          {/* Formas decorativas */}
          <div className="code-decorative-shapes">
            <div className="code-shape code-shape-1"></div>
            <div className="code-shape code-shape-2"></div>
          </div>
        </div>

        {/* Sección del formulario */}
        <div className="diambars-code-form-section">
          <div className="code-form-container">
            <div className="code-form-header">
              <h2 className="code-form-title">Verifica tu código</h2>
              <p className="code-form-description">
                Ingresa el código de 6 dígitos enviado a tu correo
              </p>
              
              {email && (
                <div className="code-email-display">
                  <span className="code-email-text">{email}</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="code-form-error">
                <Warning className="code-error-icon" weight="fill" />
                {error}
              </div>
            )}
            
            <form className='code-form' onSubmit={onSubmit} noValidate>
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
                    autoComplete="off"
                  />
                ))}
              </div>
              
              <button
                type="submit"
                className="code-submit-button"
                disabled={isSubmitting || code.length !== 6 || code.some(digit => !digit)}
              >
                {isSubmitting ? (
                  <CircleNotch className="code-button-spinner" weight="bold" />
                ) : (
                  <>
                    <span>Verificar código</span>
                    <CheckCircle className="code-button-icon" weight="bold" />
                  </>
                )}
              </button>
            </form>

            <div className="code-form-footer">
              <div className="code-divider">
                <span className="code-divider-text">¿No recibiste el código?</span>
              </div>
              <button 
                className={`code-resend-button ${!canResend ? 'disabled' : ''}`}
                onClick={handleResend}
                disabled={!canResend || isSubmitting}
              >
                {isSubmitting ? (
                  <CircleNotch size={16} weight="bold" />
                ) : (
                  <PaperPlaneTilt size={16} weight="bold" />
                )}
                <span>
                  {canResend ? 'Reenviar código' : `Reenviar en ${timer}s`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeConfirmationPage;