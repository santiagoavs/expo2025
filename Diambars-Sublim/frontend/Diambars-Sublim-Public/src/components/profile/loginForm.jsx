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
    onSubmit: registerHandler
  } = useRegister(() => setIsLogin(true)); // callback para cambiar de vista tras registro

  const handleTabSwitch = (mode) => {
    setIsLogin(mode);
  };

  const currentErrors = isLogin ? loginErrors : registerErrors;

  return (
    <div className="login-form-container">
      <div className="tabs">
        <button className={isLogin ? '' : 'active'} onClick={() => handleTabSwitch(false)}>
          Registrarse
        </button>
        <button className={isLogin ? 'active' : ''} onClick={() => handleTabSwitch(true)}>
          Iniciar Sesión
        </button>
      </div>

      <div className="form-content">
        <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>

        <form className="form-content-content" onSubmit={isLogin ? handleLoginSubmit(loginHandler) : handleRegisterSubmit(registerHandler)}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nombre completo"
                {...regRegister('name', {
                  required: 'Nombre requerido',
                  minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' }
                })}
              />
              {registerErrors.name && <p className="input-error">{registerErrors.name.message}</p>}

              <div className="phone-wrapper">
                <span>+503</span>
                <input className='telephone-input'
                  type="tel"
                  placeholder="Número de teléfono"
                  {...regRegister('phone', {
                    required: 'Teléfono requerido',
                    pattern: {
                      value: /^[267][0-9]{7}$/,
                      message: 'Número inválido (8 dígitos, comienza con 2, 6 o 7)'
                    }
                  })}
                />
              </div>
              {registerErrors.phone && <p className="input-error">{registerErrors.phone.message}</p>}

              <input
                type="text"
                placeholder="Dirección"
                {...regRegister('address', {
                  required: 'Dirección requerida',
                  minLength: { value: 5, message: 'Debe tener al menos 5 caracteres' }
                })}
              />
              {registerErrors.address && <p className="input-error">{registerErrors.address.message}</p>}
            </>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            {...(isLogin
              ? loginRegister('email', { required: 'Correo requerido' })
              : regRegister('email', {
                  required: 'Correo requerido',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Formato de correo inválido'
                  }
                }))}
          />
          {currentErrors.email && <p className="input-error">{currentErrors.email.message}</p>}

          <input
            type="password"
            placeholder="Contraseña"
            {...(isLogin
              ? loginRegister('password', { required: 'Contraseña requerida' })
              : regRegister('password', {
                  required: 'Contraseña requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                }))}
          />
          {currentErrors.password && <p className="input-error">{currentErrors.password.message}</p>}
          {isLogin && (
            <a className='forgot-password-link-l' href="/passwordRecovery">
              ¿Olvidaste tu contraseña?
            </a>
          )}
          <button type="submit" className="main-button" disabled={isLoggingIn || isRegistering}>
            {isLogin ? 'Entrar' : 'Siguiente'}
          </button>
        </form>

        {/* Mover el mensaje de error fuera del form y mostrarlo siempre que haya un error de login */}
        {isLogin && loginErrors.root && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>
            {loginErrors.root.message === 'NEEDS_VERIFICATION' ? (
              <>
                Correo no verificado, {' '}
                <span 
                  style={{ 
                    color: '#007bff', 
                    cursor: 'pointer', 
                    textDecoration: 'underline' 
                  }}
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