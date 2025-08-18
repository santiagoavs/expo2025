// src/hooks/usePasswordRecovery.js - CON ALERTAS BONITAS Y DELAYS
import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from '../api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePasswordRecovery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Estados básicos
  const [verificationToken, setVerificationToken] = useState(
    route.params?.verificationToken || null
  );
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Estados para alertas y loading bonitos
  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Función para mostrar alertas bonitas
  const showCustomAlert = (type, title, message, onConfirm = () => {}) => {
    setAlertConfig({
      type,
      title,
      message,
      onConfirm: () => {
        setShowAlert(false);
        onConfirm();
      },
    });
    setShowAlert(true);
  };

  // Función para mostrar loading
  const showLoadingOverlay = (show = true, type = 'default') => {
    setShowLoading(show);
  };

  // Persistir token en AsyncStorage
  useEffect(() => {
    const saveToken = async () => {
      try {
        if (verificationToken) {
          await AsyncStorage.setItem('recoveryToken', verificationToken);
        } else {
          await AsyncStorage.removeItem('recoveryToken');
        }
      } catch (error) {
        console.error('Error saving recovery token:', error);
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
    console.log('[usePasswordRecovery] Solicitando código para:', emailValue);
    
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setEmail(emailValue);

    // 🌀 MOSTRAR LOADING BONITO
    console.log('🌀 [Recovery] Mostrando spinner de envío...');
    showLoadingOverlay(true, 'sending');

    // ⏰ DELAY MÍNIMO para que se vea el spinner
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      console.log('[usePasswordRecovery] Llamando a requestRecoveryCode...');
      const response = await requestRecoveryCode(emailValue);
      console.log('[usePasswordRecovery] Respuesta del servidor:', response);
      
      // ⏰ DELAY ANTES DE OCULTAR
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 🌀 OCULTAR LOADING
      console.log('🌀 [Recovery] Ocultando spinner de envío...');
      showLoadingOverlay(false);
      
      // Mostrar alerta de éxito bonita
      showCustomAlert(
        'success',
        '¡Correo Enviado!',
        `Se ha enviado un código de 6 dígitos a ${emailValue}. Revisa tu bandeja de entrada y spam.`,
        () => {
          navigation.navigate('CodeConfirmation', { 
            email: emailValue,
            message: 'Ingresa el código que recibiste en tu correo',
            fromRecovery: true
          });
          startTimer();
        }
      );
      
    } catch (err) {
      console.error('[usePasswordRecovery] Error al solicitar código:', err);
      
      // 🌀 OCULTAR LOADING EN ERROR
      console.log('🌀 [Recovery] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      const errorMessage = err.message || 'Error al enviar el correo';
      setError(errorMessage);
      
      // Mostrar alerta de error bonita
      showCustomAlert(
        'error',
        'Error al Enviar',
        `No se pudo enviar el código de recuperación. ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    console.log('[usePasswordRecovery] Verificando código:', code);
    
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // 🌀 MOSTRAR LOADING BONITO
    console.log('🌀 [Recovery] Mostrando spinner de verificación...');
    showLoadingOverlay(true, 'verifying');

    // ⏰ DELAY MÍNIMO para que se vea el spinner
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      console.log('[usePasswordRecovery] Llamando a verifyRecoveryCode...');
      const response = await verifyRecoveryCode(email, completeCode);
      console.log('[usePasswordRecovery] Código verificado, token recibido:', response);
      
      setVerificationToken(response.token);
      
      // ⏰ DELAY ANTES DE OCULTAR
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 🌀 OCULTAR LOADING
      console.log('🌀 [Recovery] Ocultando spinner de verificación...');
      showLoadingOverlay(false);
      
      // Mostrar alerta de éxito bonita
      showCustomAlert(
        'success',
        '¡Código Verificado!',
        'El código es correcto. Ahora puedes crear una nueva contraseña segura.',
        () => {
          navigation.navigate('NewPassword', {
            verificationToken: response.token,
            email,
            fromCodeConfirmation: true
          });
        }
      );
      
    } catch (err) {
      console.error('[usePasswordRecovery] Error al verificar código:', err);
      
      // 🌀 OCULTAR LOADING EN ERROR
      console.log('🌀 [Recovery] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      const errorMessage = err.message || 'Código inválido o expirado';
      setError(errorMessage);
      
      // Mostrar alerta de error bonita
      showCustomAlert(
        'error',
        'Código Incorrecto',
        'El código ingresado es inválido o ha expirado. Verifica los dígitos o solicita un nuevo código.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    console.log('[usePasswordRecovery] Iniciando reset de contraseña');
    
    if (!verificationToken) {
      const errorMsg = 'Token de verificación no encontrado';
      console.error('[usePasswordRecovery]', errorMsg);
      setError(errorMsg);
      
      showCustomAlert(
        'error',
        'Error de Sesión',
        'Ha ocurrido un error con la sesión de recuperación. Por favor, inicia el proceso nuevamente.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    // 🌀 MOSTRAR LOADING BONITO
    console.log('🌀 [Recovery] Mostrando spinner de actualización...');
    showLoadingOverlay(true, 'updating');

    // ⏰ DELAY MÍNIMO para que se vea el spinner
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      console.log('[usePasswordRecovery] Enviando solicitud al servidor...');
      const response = await resetPassword({
        newPassword,
        token: verificationToken
      });
      
      console.log('[usePasswordRecovery] Contraseña actualizada exitosamente:', response);
      setVerificationToken(null);
      
      try {
        await AsyncStorage.removeItem('recoveryToken');
      } catch (storageError) {
        console.error('Error limpiando token:', storageError);
      }
      
      // ⏰ DELAY ANTES DE OCULTAR
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 🌀 OCULTAR LOADING
      console.log('🌀 [Recovery] Ocultando spinner de actualización...');
      showLoadingOverlay(false);
      
      // Mostrar alerta de éxito bonita
      showCustomAlert(
        'success',
        '¡Contraseña Actualizada!',
        'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        () => {
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
        }
      );
      
    } catch (err) {
      console.error('[usePasswordRecovery] Error detallado:', err);
      
      // 🌀 OCULTAR LOADING EN ERROR
      console.log('🌀 [Recovery] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      const errorMessage = err.message || 'Error al actualizar contraseña';
      setError(errorMessage);
      
      // Mostrar alerta de error bonita
      showCustomAlert(
        'error',
        'Error al Actualizar',
        `No se pudo actualizar la contraseña. ${errorMessage}`
      );
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

    // 🌀 MOSTRAR LOADING BONITO
    console.log('🌀 [Recovery] Mostrando spinner de reenvío...');
    showLoadingOverlay(true, 'sending');

    // ⏰ DELAY MÍNIMO para que se vea el spinner
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      await requestRecoveryCode(email);
      
      // ⏰ DELAY ANTES DE OCULTAR
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // 🌀 OCULTAR LOADING
      console.log('🌀 [Recovery] Ocultando spinner de reenvío...');
      showLoadingOverlay(false);
      
      // Mostrar alerta de éxito bonita
      showCustomAlert(
        'success',
        'Código Reenviado',
        `Se ha enviado un nuevo código a ${email}. Revisa tu bandeja de entrada.`,
        () => {
          startTimer();
        }
      );
      
    } catch (error) {
      console.error('[usePasswordRecovery] Error al reenviar código:', error);
      
      // 🌀 OCULTAR LOADING EN ERROR
      console.log('🌀 [Recovery] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      const errorMessage = error.message || 'Error al reenviar el correo';
      setError(errorMessage);
      
      // Mostrar alerta de error bonita
      showCustomAlert(
        'error',
        'Error al Reenviar',
        `No se pudo reenviar el código. ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior se maneja en el componente
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('RecoveryPassword');
    }
  };

  return {
    // Estados básicos
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
    
    // Funciones principales
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    startTimer,
    handleInputChange,
    handleKeyPress,
    handleGoBack,
    
    // Alertas y Loading bonitos
    showAlert,
    showLoading,
    alertConfig,
    setShowAlert,
    showCustomAlert,
    showLoadingOverlay,
  };
};