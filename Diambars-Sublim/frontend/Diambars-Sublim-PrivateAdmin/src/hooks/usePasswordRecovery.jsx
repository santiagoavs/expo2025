import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from '../api/authService';
import Swal from 'sweetalert2';

// Funciones de SweetAlert2 personalizadas
const showSuccess = async (title, text = '') => {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#040DBF',
    confirmButtonText: 'Continuar',
    background: '#ffffff',
    color: '#010326',
    customClass: {
      popup: 'diambars-swal-popup',
      confirmButton: 'diambars-swal-confirm'
    }
  });
};

const showError = async (title, text = '') => {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Entendido',
    background: '#ffffff',
    color: '#010326',
    customClass: {
      popup: 'diambars-swal-popup',
      confirmButton: 'diambars-swal-confirm'
    }
  });
};

export const usePasswordRecovery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estado inicial con token de location.state si existe
  const [verificationToken, setVerificationToken] = useState(
    location.state?.verificationToken || 
    sessionStorage.getItem('recoveryToken') || 
    null
  );
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Persistir token en sessionStorage
  useEffect(() => {
    if (verificationToken) {
      sessionStorage.setItem('recoveryToken', verificationToken);
    } else {
      sessionStorage.removeItem('recoveryToken');
    }
  }, [verificationToken]);

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestCode = async (emailValue) => {
    console.log('[usePasswordRecovery] Solicitando código para:', emailValue);
    
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setEmail(emailValue);

    try {
      console.log('[usePasswordRecovery] Llamando a requestRecoveryCode...');
      const response = await requestRecoveryCode(emailValue);
      console.log('[usePasswordRecovery] Respuesta del servidor:', response);
      
      await showSuccess('¡Correo enviado!', 'Se ha enviado un código a tu correo');
      
      navigate('/code-confirmation', { 
        state: { 
          email: emailValue,
          message: 'Ingresa el código que recibiste en tu correo'
        } 
      });
      
      startTimer();
    } catch (err) {
      console.error('[usePasswordRecovery] Error al solicitar código:', err);
      const errorMessage = err.message || 'Error al enviar el correo';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    console.log('[usePasswordRecovery] Verificando código:', code);
    
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa el código completo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('[usePasswordRecovery] Llamando a verifyRecoveryCode...');
      const response = await verifyRecoveryCode(email, completeCode);
      console.log('[usePasswordRecovery] Código verificado, token recibido:', response);
      
      setVerificationToken(response.token);
      
      await showSuccess('¡Código verificado!', 'Ahora puedes crear una nueva contraseña');
      
      navigate('/new-password', {
        state: { 
          verificationToken: response.token,
          email
        }
      });
    } catch (err) {
      console.error('[usePasswordRecovery] Error al verificar código:', err);
      const errorMessage = err.message || 'Código inválido o expirado';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    console.log('[usePasswordRecovery] Iniciando reset de contraseña con token:', verificationToken);
    
    if (!verificationToken) {
      const errorMsg = 'Token de verificación no encontrado';
      console.error('[usePasswordRecovery]', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('[usePasswordRecovery] Enviando solicitud al servidor...');
      const response = await resetPassword({
        newPassword,
        token: verificationToken
      });
      
      console.log('[usePasswordRecovery] Contraseña actualizada exitosamente:', response);
      setVerificationToken(null);
      sessionStorage.removeItem('recoveryToken');
      
      await showSuccess('¡Contraseña actualizada!', 'Tu contraseña ha sido cambiada exitosamente');
      navigate('/login');
    } catch (err) {
      console.error('[usePasswordRecovery] Error detallado:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      const errorMessage = err.message || 'Error al actualizar contraseña';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    console.log('[usePasswordRecovery] Reenviando código para:', email);
    
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
      console.error('[usePasswordRecovery] Error al reenviar código:', error);
      const errorMessage = error.message || 'Error al reenviar el correo';
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
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
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
    verificationToken,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    startTimer,
    handleInputChange,
    handleKeyDown
  };
};