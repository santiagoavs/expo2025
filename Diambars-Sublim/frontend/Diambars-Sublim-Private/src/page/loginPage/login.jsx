import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="diambars-login-container" id="diambars-login-container">
      <div className="diambars-login-card" id="diambars-login-card">
        {/* Columna izquierda - Branding */}
        <div className="diambars-brand-column" id="diambars-brand-column">
          <div className="diambars-logo-container" id="diambars-logo-container">
            <img 
              src="/src/img/logo.png" 
              alt="Logo DIAMBARS" 
              className="diambars-logo"
              id="diambars-logo-img"
            />
          </div>
          <div className="diambars-brand-text" id="diambars-brand-text">
            <h1 id="diambars-main-title">DIAMBARS</h1>
            <p id="diambars-subtitle">sublimado</p>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="diambars-form-column" id="diambars-form-column">
          <h2 id="diambars-form-title">Accede con tus credenciales</h2>
          
          <div className="diambars-input-group" id="diambars-email-input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="diambars-input"
              id="diambars-email-input"
            />
          </div>
          
          <div className="diambars-input-group" id="diambars-password-input-group">
            <input
              type="password"
              placeholder="Contraseña"
              className="diambars-input"
              id="diambars-password-input"
            />
          </div>
          
          <div className="diambars-forgot-password" id="diambars-forgot-password">
            <input type="checkbox" id="diambars-remember-checkbox" />
            <label htmlFor="diambars-remember-checkbox" id="diambars-remember-label">
              ¿Olvidaste tu contraseña?
            </label>
          </div>
          
          <div className="diambars-divider" id="diambars-form-divider"></div>
          
          <button className="diambars-login-button" id="diambars-login-btn">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;