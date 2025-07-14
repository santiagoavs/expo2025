import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './newPassword.css';

const NewPasswordPage = () => {
  const navigate = useNavigate(); 
  const { 
    handleResetPassword,
    isSubmitting,
    error
  } = usePasswordRecovery();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const requirements = [
    { id: 'length', label: 'Al menos 8 caracteres', regex: /.{8,}/ },
    { id: 'lowercase', label: 'Al menos una minúscula', regex: /[a-z]/ },
    { id: 'uppercase', label: 'Al menos una mayúscula', regex: /[A-Z]/ },
    { id: 'number', label: 'Al menos un número', regex: /[0-9]/ },
    { id: 'special', label: 'Al menos un carácter especial', regex: /[!@#$%^&*]/ }
  ];

  const password = watch("password");
  
  React.useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    const metRequirements = requirements.filter(req => 
      req.regex.test(password)
    ).length;
    
    setPasswordStrength((metRequirements / requirements.length) * 100);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#ff4444';
    if (passwordStrength <= 50) return '#ffa700';
    if (passwordStrength <= 75) return '#ffcd3c';
    return '#00c851';
  };

  const onSubmit = (data) => {
    handleResetPassword(data.password);
  };

  return (
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/code-confirmation')}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <DiambarsBrand />

      <div className="diambars-form-column">
        <DiambarsTitle text="Crea tu nueva contraseña" />
        
        <p className="password-description">
          Tu nueva contraseña debe ser diferente a las anteriores
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="password-input-group">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                {...register('password', {
                  required: 'Este campo es requerido',
                  minLength: {
                    value: 8,
                    message: 'Mínimo 8 caracteres'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                    message: 'Debe incluir mayúscula, minúscula, número y carácter especial'
                  }
                })}
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
            {errors.password && (
              <div className="alert-error">
                <svg className="alert-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{errors.password.message}</span>
              </div>
            )}

            {password && (
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
                placeholder="Confirmar contraseña"
                {...register('confirmPassword', {
                  required: 'Este campo es requerido',
                  validate: value => 
                    value === password || 'Las contraseñas no coinciden'
                })}
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
            {errors.confirmPassword && (
              <div className="alert-error">
                <svg className="alert-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <div className="requirements-list">
            {requirements.map((req) => (
              <div 
                key={req.id} 
                className={`requirement ${req.regex.test(password) ? 'met' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {req.regex.test(password) ? (
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
              text={isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
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

export default NewPasswordPage;