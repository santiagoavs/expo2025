import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
import { showSuccess, showError } from '../../utils/sweetAlert';
import './newPassword.css';

const NewPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const requirements = [
    { id: 'length', label: 'Al menos 8 caracteres', regex: /.{8,}/ },
    { id: 'lowercase', label: 'Al menos una letra minúscula', regex: /[a-z]/ },
    { id: 'uppercase', label: 'Al menos una letra mayúscula', regex: /[A-Z]/ },
    { id: 'number', label: 'Al menos un número', regex: /[0-9]/ },
    { id: 'special', label: 'Al menos un carácter especial', regex: /[!@#$%^&*]/ }
  ];

  const checkRequirement = (requirement) => {
    return requirement.regex.test(formData.password);
  };

  useEffect(() => {
    // Calcular fortaleza de la contraseña
    const metRequirements = requirements.filter(req => checkRequirement(req)).length;
    setPasswordStrength((metRequirements / requirements.length) * 100);
  }, [formData.password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#ff4444';
    if (passwordStrength <= 50) return '#ffa700';
    if (passwordStrength <= 75) return '#ffcd3c';
    return '#00c851';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los requisitos se cumplan
    const allRequirementsMet = requirements.every(req => checkRequirement(req));
    if (!allRequirementsMet) {
      await showError(
        'Contraseña débil',
        'Por favor, cumple con todos los requisitos de seguridad'
      );
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      await showError(
        'Las contraseñas no coinciden',
        'Por favor, verifica que ambas contraseñas sean iguales'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      await showSuccess(
        '¡Contraseña actualizada!',
        'Tu contraseña ha sido actualizada correctamente'
      );
      navigate('/login');
    } catch (error) {
      await showError(
        'Error',
        'No se pudo actualizar la contraseña. Por favor, intenta nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/code-confirmation')}
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
        <DiambarsTitle text="Crea tu nueva contraseña" />
        
        <p className="password-description">
          Tu nueva contraseña debe ser diferente a las contraseñas anteriores
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="password-input-group">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="diambars-input"
                placeholder="Nueva contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor()
                    }}
                  />
                </div>
                <span className="strength-text" style={{ color: getStrengthColor() }}>
                  {passwordStrength <= 25 ? 'Muy débil' :
                   passwordStrength <= 50 ? 'Débil' :
                   passwordStrength <= 75 ? 'Media' : 'Fuerte'}
                </span>
              </div>
            )}

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="diambars-input"
                placeholder="Confirmar contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="requirements-list">
            {requirements.map((req) => (
              <div 
                key={req.id} 
                className={`requirement ${checkRequirement(req) ? 'met' : ''}`}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {checkRequirement(req) ? (
                    <path d="M20 6L9 17l-5-5"/>
                  ) : (
                    <circle cx="12" cy="12" r="10"/>
                  )}
                </svg>
                <span>{req.label}</span>
              </div>
            ))}
          </div>
          
          <div className="password-actions">
            <DiambarsButton 
              text="Guardar nueva contraseña"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </DiambarsCard>
  );
};

export default NewPassword;