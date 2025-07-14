import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from '../api/authService';
import { showSuccess, showError } from '../utils/sweetAlert';

export const usePasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const navigate = useNavigate();

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => prev <= 1 ? (clearInterval(interval), setCanResend(true), 0) : prev - 1);
    }, 1000);
  };

  const handleRequestCode = async (emailValue) => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setEmail(emailValue);

    try {
      await requestRecoveryCode(emailValue);
      await showSuccess('¡Correo enviado!', 'Se ha enviado un código a tu correo');
      
      // Navegar a la página de confirmación de código
      navigate('/code-confirmation', { 
        state: { 
          email: emailValue,
          message: 'Ingresa el código que recibiste en tu correo'
        } 
      });
      
      startTimer();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al enviar el correo';
      setError(errorMessage);
      await showError('Error', errorMessage || 'No se pudo enviar el correo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa el código completo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await verifyRecoveryCode(email, completeCode);
      setVerificationToken(response.token);
      await showSuccess('¡Código verificado!', 'Ahora puedes crear una nueva contraseña');
      
      // Navegar a la página de nueva contraseña
      navigate('/new-password');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Código inválido o expirado';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    if (!newPassword) {
      setError('Ingresa una contraseña válida');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(newPassword, verificationToken);
      await showSuccess('¡Contraseña actualizada!', 'Ya puedes iniciar sesión');
      navigate('/login', { state: { message: 'Inicia sesión con tu nueva contraseña' } });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la contraseña';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('No se puede reenviar sin email');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await requestRecoveryCode(email);
      await showSuccess('Código reenviado', 'Se ha enviado un nuevo código a tu correo');
      startTimer();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reenviar el correo';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-enfoque al siguiente input
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }
  };

  // Función para manejar teclas en los inputs de código
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  return {
    email,
    setEmail,
    code,
    setCode,
    isSubmitting,
    error,
    timer,
    canResend,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    startTimer,
    handleInputChange,
    handleKeyDown
  };
};