import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import './login.css';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit
  } = useLogin();

  return (
    <div className="diambars-login-container">
      <div className="diambars-login-card">
        <div className="diambars-brand-column">
          <div className="diambars-logo-container">
            <img src="/src/img/logo.png" alt="Logo DIAMBARS" className="diambars-logo"/>
          </div>
          <div className="diambars-brand-text">
            <h1>DIAMBARS</h1>
            <p>sublimado</p>
          </div>
        </div>

        <div className="diambars-form-column">
          <h2>Acceso Administrativo</h2>
          
          {errors.root && (
            <div className="form-error-message">
              {errors.root.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="diambars-input-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                className={`diambars-input ${errors.email ? 'input-error' : ''}`}
                {...register('email', { 
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
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
            
            <div className="diambars-input-group">
              <input
                type="password"
                placeholder="Contraseña"
                className={`diambars-input ${errors.password ? 'input-error' : ''}`}
                {...register('password', { 
                  required: 'Este campo es requerido',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                })}
              />
              {errors.password && (
                <div className="alert-error">
                  <svg className="alert-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>
            
            <Link to="/recovery-password" className="diambars-forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
            
            <div className="diambars-divider"></div>
            
            <button 
              type="submit" 
              className="diambars-login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? <div className="spinner"></div> : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;