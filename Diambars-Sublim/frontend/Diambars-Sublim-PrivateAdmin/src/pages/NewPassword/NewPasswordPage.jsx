import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Eye,
  EyeSlash,
  Warning, 
  CheckCircle,
  CircleNotch,
  ShieldCheck
} from '@phosphor-icons/react';
import { usePasswordRecovery } from '../../hooks/usePasswordRecovery';
import './NewPasswordPage.css';

const NewPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    handleResetPassword,
    isSubmitting,
    error,
    verificationToken
  } = usePasswordRecovery();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Obtener datos del estado de navegación
  const stateEmail = location.state?.email;
  const stateToken = location.state?.verificationToken;
  const fromCodeConfirmation = location.state?.fromCodeConfirmation;
  
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
  
  // Verificar que tenemos el token de verificación
  useEffect(() => {
    const currentToken = stateToken || verificationToken;
    
    if (!currentToken) {
      console.error('No se encontró token de verificación - Redirigiendo...');
      navigate('/code-confirmation', {
        state: { 
          error: 'Debes verificar el código primero',
          email: stateEmail 
        }
      });
      return;
    }

    // Verificar que venimos del flujo correcto
    if (!fromCodeConfirmation && !verificationToken) {
      console.warn('Acceso directo a nueva contraseña sin verificación');
      navigate('/recovery-password', {
        state: { 
          error: 'Debes completar el proceso de verificación' 
        }
      });
      return;
    }
  }, [stateToken, verificationToken, fromCodeConfirmation, stateEmail, navigate]);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    const metRequirements = requirements.filter(req => 
      req.regex.test(password)
    ).length;
    
    setPasswordStrength((metRequirements / requirements.length) * 100);
  }, [password, requirements]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#dc2626';
    if (passwordStrength <= 50) return '#f59e0b';
    if (passwordStrength <= 75) return '#eab308';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Muy débil';
    if (passwordStrength <= 50) return 'Débil';
    if (passwordStrength <= 75) return 'Media';
    return 'Fuerte';
  };

  const onSubmit = async (data) => {
    const currentToken = stateToken || verificationToken;
    
    if (!currentToken) {
      console.error('No hay token de verificación');
      navigate('/code-confirmation', {
        state: { 
          error: 'Token de verificación expirado',
          email: stateEmail 
        }
      });
      return;
    }

    // El hook ya maneja la navegación internamente
    await handleResetPassword(data.password);
  };

  const handleBack = () => {
    navigate('/code-confirmation', {
      state: { 
        email: stateEmail,
        fromRecovery: true 
      }
    });
  };

  return (
    <div className="diambars-newpass-container">
      {/* Partículas de fondo */}
      <div className="diambars-newpass-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`newpass-particle newpass-particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Card principal */}
      <div className="diambars-newpass-card">
        {/* Botón de volver */}
        <button 
          className="newpass-back-button"
          onClick={handleBack}
          aria-label="Volver"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        {/* Sección de branding */}
        <div className="diambars-newpass-brand">
          <div className="newpass-brand-content">
            <div className="newpass-logo-wrapper">
              <div className="newpass-logo-glow"></div>
              <img 
                src="/logo.png" 
                alt="Logo Diambars" 
                className="newpass-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="newpass-logo-placeholder" style={{ display: 'none' }}>
                D
              </div>
            </div>
            
            <div className="newpass-brand-text">
              <h1 className="newpass-brand-title">DIAMBARS</h1>
              <p className="newpass-brand-subtitle">sublimado</p>
            </div>
          </div>

          {/* Formas decorativas */}
          <div className="newpass-decorative-shapes">
            <div className="newpass-shape newpass-shape-1"></div>
            <div className="newpass-shape newpass-shape-2"></div>
          </div>
        </div>

        {/* Sección del formulario */}
        <div className="diambars-newpass-form-section">
          <div className="newpass-form-container">
            <div className="newpass-form-header">
              <h2 className="newpass-form-title">Crea tu nueva contraseña</h2>
              <p className="newpass-form-description">
                Tu nueva contraseña debe ser diferente a las anteriores
              </p>
            </div>
            
            {error && (
              <div className="newpass-form-error">
                <Warning className="newpass-error-icon" weight="fill" />
                {error}
              </div>
            )}
            
            <form className='newpass-form' onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="newpass-form-group">
                <label className="newpass-form-label">Nueva contraseña</label>
                <div className="newpass-input-wrapper">
                  <Lock className="newpass-input-icon" weight="duotone" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`newpass-form-input ${errors.password ? 'newpass-input-error' : ''}`}
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
                    className="newpass-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeSlash size={20} weight="duotone" />
                    ) : (
                      <Eye size={20} weight="duotone" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="newpass-input-error-message">
                    <Warning className="newpass-error-icon-small" weight="fill" />
                    <span>{errors.password.message}</span>
                  </div>
                )}

                {password && (
                  <div className="newpass-strength-indicator">
                    <div className="newpass-strength-bar">
                      <div 
                        className="newpass-strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      />
                    </div>
                    <span className="newpass-strength-text" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="newpass-form-group">
                <label className="newpass-form-label">Confirmar contraseña</label>
                <div className="newpass-input-wrapper">
                  <Lock className="newpass-input-icon" weight="duotone" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`newpass-form-input ${errors.confirmPassword ? 'newpass-input-error' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Este campo es requerido',
                      validate: value => 
                        value === password || 'Las contraseñas no coinciden'
                    })}
                  />
                  <button
                    type="button"
                    className="newpass-toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} weight="duotone" />
                    ) : (
                      <Eye size={20} weight="duotone" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="newpass-input-error-message">
                    <Warning className="newpass-error-icon-small" weight="fill" />
                    <span>{errors.confirmPassword.message}</span>
                  </div>
                )}
              </div>

              <div className="newpass-requirements">
                <h4 className="newpass-requirements-title">Requisitos de la contraseña:</h4>
                <div className="newpass-requirements-list">
                  {requirements.map((req) => (
                    <div 
                      key={req.id} 
                      className={`newpass-requirement ${password && req.regex.test(password) ? 'met' : ''}`}
                    >
                      <CheckCircle 
                        className="newpass-requirement-icon" 
                        weight={password && req.regex.test(password) ? "fill" : "regular"} 
                      />
                      <span className="newpass-requirement-text">{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="newpass-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircleNotch className="newpass-button-spinner" weight="bold" />
                ) : (
                  <>
                    <span>Guardar nueva contraseña</span>
                    <ShieldCheck className="newpass-button-icon" weight="bold" />
                  </>
                )}
              </button>
            </form>

            <div className="newpass-form-footer">
              <div className="newpass-divider">
                <span className="newpass-divider-text">Protección avanzada</span>
              </div>
              <p className="newpass-footer-text">
                Tu contraseña será encriptada con los más altos estándares de seguridad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;