import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import './login.css';

const LoginPage = () => {
  console.log("[LoginPage] Rendering login page");
  
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit
  } = useLogin();

  return (
    <div className="auth-container">
      <div className="auth-card">
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
          <h2 className="auth-form-title">Acceso Administrativo</h2>
          
          {errors.root && (
            <div className="auth-form-error">
              {errors.root.message}
            </div>
          )}
          
          <form className='auth-form' onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                {...register('email', { 
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
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
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Contraseña"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                {...register('password', { 
                  required: 'Este campo es requerido',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                })}
              />
              {errors.password && (
                <div className="input-error-message">
                  <svg className="error-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>
            
            <Link to="/recovery-password" className="auth-link">
              ¿Olvidaste tu contraseña?
            </Link>
            
            <div className="auth-divider"></div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? <div className="auth-spinner"></div> : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;