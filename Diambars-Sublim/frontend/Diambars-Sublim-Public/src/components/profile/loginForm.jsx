// src/components/profile/loginForm.jsx
import { useState } from 'react';
import './loginForm.css';
import { useLogin } from '../../hooks/useLogin';
import { useRegister } from '../../hooks/useRegister';

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(false); // true = login, false = registro

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    errors: loginErrors,
    isSubmitting: isLoggingIn,
    onSubmit: loginHandler,
    handleVerifyEmailClick
  } = useLogin();

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    errors: registerErrors,
    isSubmitting: isRegistering,
    onSubmit: registerHandler,
    watch: watchRegister
  } = useRegister(() => setIsLogin(true)); // callback para cambiar de vista tras registro

  const handleTabSwitch = (mode) => {
    setIsLogin(mode);
  };

  const currentErrors = isLogin ? loginErrors : registerErrors;

  // Watch para validación en tiempo real del teléfono
  const phoneValue = watchRegister ? watchRegister('phone') : '';

  return (
    <div className="login-form-container">
      <div className="tabs">
        <button className={isLogin ? '' : 'active'} onClick={() => handleTabSwitch(false)}>
          Registrarse
        </button>
        <button className={isLogin ? 'active' : ''} onClick={() => handleTabSwitch(true)}>
          Iniciar sesión
        </button>
      </div>

      <div className="form-content">
        <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>

        <form className="form-content-content" onSubmit={isLogin ? handleLoginSubmit(loginHandler) : handleRegisterSubmit(registerHandler)}>
          {!isLogin && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  {...regRegister('name')}
                  className={registerErrors.name ? 'input-error-border' : ''}
                />
                {registerErrors.name && <p className="input-error">{registerErrors.name.message}</p>}
              </div>

              <div className="input-group">
                <div className="phone-wrapper">
                  <span>+503</span>
                  <input 
                    className={`telephone-input ${registerErrors.phone ? 'input-error-border' : ''}`}
                    type="tel"
                    placeholder="Número de teléfono"
                    maxLength="8"
                    {...regRegister('phone')}
                    onInput={(e) => {
                      // Solo permitir números
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }}
                  />
                </div>
                {registerErrors.phone && <p className="input-error">{registerErrors.phone.message}</p>}
                {/* Validación visual en tiempo real */}
                {phoneValue && phoneValue.length > 0 && phoneValue.length < 8 && !registerErrors.phone && (
                  <p className="input-hint">Ingresa los 8 dígitos completos</p>
                )}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Dirección"
                  {...regRegister('address')}
                  className={registerErrors.address ? 'input-error-border' : ''}
                />
                {registerErrors.address && <p className="input-error">{registerErrors.address.message}</p>}
              </div>
            </>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              {...(isLogin
                ? loginRegister('email', { required: 'Correo requerido' })
                : regRegister('email'))}
              className={currentErrors.email ? 'input-error-border' : ''}
            />
            {currentErrors.email && <p className="input-error">{currentErrors.email.message}</p>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              {...(isLogin
                ? loginRegister('password', { required: 'Contraseña requerida' })
                : regRegister('password'))}
              className={currentErrors.password ? 'input-error-border' : ''}
            />
            {currentErrors.password && <p className="input-error">{currentErrors.password.message}</p>}
          </div>

          {isLogin && (
            <a className='forgot-password-link-l' href="/passwordRecovery">
              ¿Olvidaste tu contraseña?
            </a>
          )}

          <button type="submit" className="main-button" disabled={isLoggingIn || isRegistering}>
            {isLogin 
              ? (isLoggingIn ? 'Iniciando...' : 'Entrar') 
              : (isRegistering ? 'Registrando...' : 'Siguiente')
            }
          </button>

          {/* Mostrar errores generales del registro */}
          {!isLogin && registerErrors.root && (
            <div className="form-error-message">
              {registerErrors.root.message}
            </div>
          )}
        </form>

        {/* Mover el mensaje de error fuera del form y mostrarlo siempre que haya un error de login */}
        {isLogin && loginErrors.root && (
          <div className="form-error-message">
            {loginErrors.root.message === 'NEEDS_VERIFICATION' ? (
              <>
                Correo no verificado, {' '}
                <span 
                  className="verify-link"
                  onClick={() => handleVerifyEmailClick(loginErrors.root.email)}
                >
                  verifícalo
                </span>
                {' '}para poder iniciar sesión
              </>
            ) : (
              loginErrors.root.message
            )}
          </div>
        )}

        <div className="divider">
          {isLogin ? 'O inicia sesión con' : 'O regístrate con'}
        </div>

        <button className="google-button">
          <img src="/icons/google.png" alt="Google" />
        </button>
      </div>
    </div>
  );
}