import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './RecoveryPassword.css';

const RecoveryPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { 
    isSubmitting, 
    error, 
    handleRequestCode
  } = usePasswordRecovery();

  const onSubmit = (data) => {
    handleRequestCode(data.email);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          className="auth-back-button"
          onClick={() => navigate('/login')}
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="auth-brand-section">
          <div className="auth-logo-wrapper">
            <img src="/src/img/logo.png" alt="App Logo" className="auth-logo"/>
          </div>
          <div className="auth-brand-content">
            <h1 className="auth-brand-title">DIAMBARS</h1>
            <p className="auth-brand-subtitle">sublimado</p>
          </div>
        </div>

        <div className="auth-form-section">
          <h2 className="auth-form-title">Recupera tu contraseña</h2>
          
          <p className="auth-form-description">
            Introduce tu correo electrónico institucional y te enviaremos instrucciones para restablecer tu contraseña
          </p>

          {error && <div className="auth-form-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Correo electrónico"
                {...register('email', {
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.email && (
                <div className="input-error-message">
                  <svg className="error-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
            
            <div className="auth-form-actions">
              <button 
                type="submit" 
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="auth-spinner"></div>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPasswordPage;