// hooks/usePasswordRecovery.js - REACT NATIVE VERSION
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from '../api/authService';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Funciones de Toast personalizadas
const showSuccess = async (title, text = '') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: text,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

const showError = async (title, text = '') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: text,
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
  });
};

export const usePasswordRecovery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Estado inicial con token de route.params si existe
  const [verificationToken, setVerificationToken] = useState(
    route.params?.verificationToken || null
  );
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Persistir token en AsyncStorage
  useEffect(() => {
    const saveToken = async () => {
      if (verificationToken) {
        await AsyncStorage.setItem('recoveryToken', verificationToken);
      } else {
        await AsyncStorage.removeItem('recoveryToken');
      }
    };
    saveToken();
  }, [verificationToken]);

  // Recuperar token al inicializar
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('recoveryToken');
        if (storedToken && !verificationToken) {
          setVerificationToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading recovery token:', error);
      }
    };
    loadToken();
  }, []);

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
    console.log('[usePasswordRecovery-RN] Solicitando código para:', emailValue);
    
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setEmail(emailValue);

    try {
      console.log('[usePasswordRecovery-RN] Llamando a requestRecoveryCode...');
      const response = await requestRecoveryCode(emailValue);
      console.log('[usePasswordRecovery-RN] Respuesta del servidor:', response);
      
      await showSuccess('¡Correo enviado!', 'Se ha enviado un código a tu correo');
      
      navigation.navigate('CodeConfirmation', { 
        email: emailValue,
        message: 'Ingresa el código que recibiste en tu correo'
      });
      
      startTimer();
    } catch (err) {
      console.error('[usePasswordRecovery-RN] Error al solicitar código:', err);
      const errorMessage = err.message || 'Error al enviar el correo';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    console.log('[usePasswordRecovery-RN] Verificando código:', code);
    
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa el código completo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('[usePasswordRecovery-RN] Llamando a verifyRecoveryCode...');
      const response = await verifyRecoveryCode(email, completeCode);
      console.log('[usePasswordRecovery-RN] Código verificado, token recibido:', response);
      
      setVerificationToken(response.token);
      
      await showSuccess('¡Código verificado!', 'Ahora puedes crear una nueva contraseña');
      
      navigation.navigate('NewPassword', {
        verificationToken: response.token,
        email,
        fromCodeConfirmation: true
      });
    } catch (err) {
      console.error('[usePasswordRecovery-RN] Error al verificar código:', err);
      const errorMessage = err.message || 'Código inválido o expirado';
      setError(errorMessage);
      await showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    console.log('[usePasswordRecovery-RN] Iniciando reset de contraseña con token:', verificationToken);
    
    if (!verificationToken) {
      const errorMsg = 'Token de verificación no encontrado';
      console.error('[usePasswordRecovery-RN]', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('[usePasswordRecovery-RN] Enviando solicitud al servidor...');
      const response = await resetPassword({
        newPassword,
        token: verificationToken
      });
      
      console.log('[usePasswordRecovery-RN] Contraseña actualizada exitosamente:', response);
      setVerificationToken(null);
      await AsyncStorage.removeItem('recoveryToken');
      
      await showSuccess('¡Contraseña actualizada!', 'Tu contraseña ha sido cambiada exitosamente');
      
      // Navegar al login con mensaje de éxito
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Login', 
          params: { 
            message: 'Contraseña actualizada correctamente',
            type: 'success'
          }
        }],
      });
    } catch (err) {
      console.error('[usePasswordRecovery-RN] Error detallado:', {
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
    console.log('[usePasswordRecovery-RN] Reenviando código para:', email);
    
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
      console.error('[usePasswordRecovery-RN] Error al reenviar código:', error);
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
    
    // Auto-enfoque al siguiente input se maneja en el componente
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior se maneja en el componente
    }
  };

  return {
    email,
    setEmail,
    code,
    setCode,
    isSubmitting,
    error,
    setError,
    timer,
    canResend,
    verificationToken,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    startTimer,
    handleInputChange,
    handleKeyPress
  };
};