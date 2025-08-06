import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestRecoveryCode } from '../../api/passwordService';
import './forgotPassword.css';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm();
  const [serverMessage, setServerMessage] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerMessage('');
    const response = await requestRecoveryCode(data.email);

    if (response.success) {
      // Navegar a la página de verificación con el email
      navigate('/verifyRecoveryCode', { state: { email: data.email } });
    } else {
      // Mostrar error si falla
      setError('email', {
        type: 'manual',
        message: response.message
      });
      setServerMessage(response.message);
    }
  };

  return (
    <main className='password-request-page'>
    <div className="password-request-container">
      <h2>Recuperar contraseña</h2>
      <div className="password-request-content">
      <p className='request-text'>Ingresa tu correo electrónico para recibir un código de recuperación.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register('email', {
            required: 'Este campo es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Correo inválido'
            }
          })}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Continuar'}
        </button>
      </form>

      {serverMessage && (
        <p className={errors.email ? 'error-text' : 'success-text'}>
          {serverMessage}
        </p>
      )}
      </div>
    </div>
    </main>
  );
}