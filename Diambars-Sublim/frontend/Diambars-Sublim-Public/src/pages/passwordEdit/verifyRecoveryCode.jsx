import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestRecoveryCode } from '../../api/passwordService';
import './verifyRecoveryCode.css';

export default function VerifyRecoveryCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    email: '',
    isValid: false
  });
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Validar el estado al montar el componente
  useEffect(() => {
    const { email } = location.state || {};
    
    if (!email) {
      setMessage({
        text: 'Correo electrónico no encontrado. Por favor inicia el proceso nuevamente.',
        isError: true
      });
      return;
    }

    setState({
      email,
      isValid: true
    });
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await fetch('https://expo2025-8bjn.onrender.com/api/password-recovery/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: state.email, 
          code 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el código');
      }

      if (!data.token) {
        throw new Error('No se recibió el token de verificación del servidor');
      }

      // Navegar a reset-password con ambos datos
      navigate('/passwordReset', { 
        state: { 
          email: state.email,
          token: data.token
        }
      });

    } catch (err) {
      console.error('[VerifyCode] Error:', err);
      setMessage({
        text: err.message || 'Error en el proceso de verificación',
        isError: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSending(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await requestRecoveryCode(state.email);
      
      if (response.success) {
        setCooldown(60);
        setMessage({
          text: 'Código reenviado correctamente',
          isError: false
        });
      } else {
        throw new Error(response.message || 'Error al reenviar el código');
      }
    } catch (err) {
      setMessage({
        text: err.message,
        isError: true
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  if (!state.isValid) {
    return (
      <div className="verify-code-container">
        <h2>Error en el proceso</h2>
        <p className="error">{message.text || 'Datos incompletos'}</p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="primary-button"
        >
          Volver a solicitar recuperación
        </button>
      </div>
    );
  }

  return (
    <main className='verify-code-page'>
    <div className="verify-code-container">
      <h2>Ingresa el código</h2>
      <div className='verify-code-content'>
      <p>Revisa tu correo electrónico <strong>{state.email}</strong> y escribe el código de 6 dígitos que te enviamos.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={6}
          placeholder="Código de recuperación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        {message.text && (
          <p className={message.isError ? 'error' : 'success'}>
            {message.text}
          </p>
        )}

        <div className="verify-button-group">
          <button
            type="submit"
            disabled={isSubmitting || !code}
            className="primary-button"
          >
            {isSubmitting ? 'Verificando...' : 'Verificar código'}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={cooldown > 0 || isSending}
            className="secondary-button"
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
          </button>
        </div>
      </form>
      </div>
    </div>
    </main>
  );
}