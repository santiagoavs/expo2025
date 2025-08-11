import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Envelope, 
  Warning, 
  PaperPlaneTilt,
  CircleNotch 
} from '@phosphor-icons/react';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './RecoveryPasswordPage.css';

const RecoveryPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const {
    isSubmitting,
    error,
    handleRequestCode
  } = usePasswordRecovery();

  const onSubmit = async (data) => {
    // El hook ya maneja la navegación internamente
    await handleRequestCode(data.email);
  };

  return (
    <div className="diambars-recovery-container">
      {/* Partículas de fondo */}
      <div className="diambars-recovery-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`recovery-particle recovery-particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Card principal */}
      <div className="diambars-recovery-card">
        {/* Botón de volver */}
        <button 
          className="recovery-back-button"
          onClick={() => navigate('/login')}
          aria-label="Volver al login"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        {/* Sección de branding */}
        <div className="diambars-recovery-brand">
          <div className="recovery-brand-content">
            <div className="recovery-logo-wrapper">
              <div className="recovery-logo-glow"></div>
              <img 
                src="/logo.png" 
                alt="Logo Diambars" 
                className="recovery-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="recovery-logo-placeholder" style={{ display: 'none' }}>
                D
              </div>
            </div>
            
            <div className="recovery-brand-text">
              <h1 className="recovery-brand-title">DIAMBARS</h1>
              <p className="recovery-brand-subtitle">sublimado</p>
            </div>
          </div>

          {/* Formas decorativas */}
          <div className="recovery-decorative-shapes">
            <div className="recovery-shape recovery-shape-1"></div>
            <div className="recovery-shape recovery-shape-2"></div>
          </div>
        </div>

        {/* Sección del formulario */}
        <div className="diambars-recovery-form-section">
          <div className="recovery-form-container">
            <div className="recovery-form-header">
              <h2 className="recovery-form-title">Recupera tu contraseña</h2>
              <p className="recovery-form-description">
                Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña
              </p>
            </div>
            
            {error && (
              <div className="recovery-form-error">
                <Warning className="recovery-error-icon" weight="fill" />
                {error}
              </div>
            )}
            
            <form className='recovery-form' onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="recovery-form-group">
                <label className="recovery-form-label">Correo electrónico</label>
                <div className="recovery-input-wrapper">
                  <Envelope className="recovery-input-icon" weight="duotone" />
                  <input
                    type="email"
                    placeholder="admin@diambars.com"
                    className={`recovery-form-input ${errors.email ? 'recovery-input-error' : ''}`}
                    {...register('email', {
                      required: 'Este campo es requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email inválido'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <div className="recovery-input-error-message">
                    <Warning className="recovery-error-icon-small" weight="fill" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="recovery-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircleNotch className="recovery-button-spinner" weight="bold" />
                ) : (
                  <>
                    <span>Enviar código</span>
                    <PaperPlaneTilt className="recovery-button-icon" weight="bold" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPasswordPage;