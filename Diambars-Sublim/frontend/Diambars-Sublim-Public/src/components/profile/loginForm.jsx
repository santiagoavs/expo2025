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
    onSubmit: loginHandler
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

        <form onSubmit={isLogin ? handleLoginSubmit(loginHandler) : handleRegisterSubmit(registerHandler)}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nombre completo"
                {...regRegister('name', { required: 'Nombre requerido' })}
              />
              <div className="phone-wrapper">
                <span>+503</span>
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  {...regRegister('phone', { required: 'Teléfono requerido' })}
                />
              </div>
              <input
                type="text"
                placeholder="Dirección"
                {...regRegister('address', { required: 'Dirección requerida' })}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            {...(isLogin ? loginRegister('email') : regRegister('email'))}
          />
          <input
            type="password"
            placeholder="Contraseña"
            {...(isLogin ? loginRegister('password') : regRegister('password'))}
          />

          <button type="submit" className="main-button" disabled={isLoggingIn || isRegistering}>
            {isLogin ? 'Entrar' : 'Siguiente'}
          </button>
        </form>

        <div className="divider">
          {isLogin ? 'O inicia sesión con' : 'O regístrate con'}
        </div>

        {registerErrors.root && (
        <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
           {registerErrors.root.message}
        </p>
        )}

        <button className="google-button">
          <img src="/icons/google.png" alt="Google" />
          Google
        </button>
      </div>
    </div>
  );
}
