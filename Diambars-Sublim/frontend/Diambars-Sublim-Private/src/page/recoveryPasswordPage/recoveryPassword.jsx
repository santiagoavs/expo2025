import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
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
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/login')}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <DiambarsBrand />

      <div className="diambars-form-column">
        <DiambarsTitle text="Recupera tu contraseña" />
        
        <p className="recovery-description">
          Introduce tu correo electrónico institucional
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="diambars-input-group">
            <input
              type="email"
              className={`diambars-input ${errors.email ? 'input-error' : ''}`}
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
              <div className="alert-error">
                <svg className="alert-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>
          
          <div className="recovery-actions">
            <DiambarsButton 
              text={isSubmitting ? "Enviando..." : "Enviar instrucciones"}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            />
          </div>
        </form>
      </div>
    </DiambarsCard>
  );
};

export default RecoveryPasswordPage;