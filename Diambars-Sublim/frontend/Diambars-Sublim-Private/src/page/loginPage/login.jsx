import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    
    if (!value) {
      error = 'Este campo es requerido';
    } else if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      error = 'Ingresa un email válido';
    } else if (name === 'password' && value.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación en tiempo real después de escribir
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    
    setErrors(newErrors);
    
    // Verificar si no hay errores (corrección aquí)
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      // Simular envío a API
      setTimeout(() => {
        navigate('/catalog-management');
        setIsSubmitting(false);
      }, 1000);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="diambars-login-container">
      <div className="diambars-login-card">
        {/* Columna izquierda - Branding */}
        <div className="diambars-brand-column">
          <div className="diambars-logo-container">
            <img 
              src="/src/img/logo.png" 
              alt="Logo DIAMBARS" 
              className="diambars-logo"
            />
          </div>
          <div className="diambars-brand-text">
            <h1>DIAMBARS</h1>
            <p>sublimado</p>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="diambars-form-column">
          <h2>Accede con tus credenciales</h2>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="diambars-input-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className={`diambars-input ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && (
                <div className="alert-error">
                  <svg className="alert-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
            
            <div className="diambars-input-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className={`diambars-input ${errors.password ? 'input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && (
                <div className="alert-error">
                  <svg className="alert-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>
            
            <div className="diambars-forgot-password">
              ¿Olvidaste tu contraseña?
            </div>
            
            <div className="diambars-divider"></div>
            
            <button 
              type="submit" 
              className="diambars-login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="spinner"></div>
              ) : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;