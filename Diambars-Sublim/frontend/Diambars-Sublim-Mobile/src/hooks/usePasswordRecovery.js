// src/hooks/usePasswordRecovery.js
// Hook personalizado para la recuperación de contraseña en React Native
// Incluye manejo de alertas personalizadas, loading bonitos y delays para mejor UX

import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native'; // Para navegación y obtener params
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from '../api/authService'; // Funciones de API
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para persistir token localmente

export const usePasswordRecovery = () => {
  const navigation = useNavigation(); // Hook para navegar entre pantallas
  const route = useRoute();           // Hook para obtener parámetros de la ruta actual
  
  // -----------------------
  // Estados básicos
  // -----------------------
  const [verificationToken, setVerificationToken] = useState(
    route.params?.verificationToken || null // Inicializa token desde params o null
  );
  const [email, setEmail] = useState(route.params?.email || ''); // Email del usuario
  const [code, setCode] = useState(['', '', '', '', '', '']);    // Código de verificación de 6 dígitos
  const [isSubmitting, setIsSubmitting] = useState(false);       // Indica si hay un envío en proceso
  const [error, setError] = useState('');                        // Mensaje de error general
  const [timer, setTimer] = useState(30);                        // Contador para permitir reenvío de código
  const [canResend, setCanResend] = useState(false);             // Indica si se puede reenviar el código

  // -----------------------
  // Estados para UI bonita
  // -----------------------
  const [showAlert, setShowAlert] = useState(false);            // Controla la visibilidad de alertas
  const [showLoading, setShowLoading] = useState(false);        // Controla la visibilidad del loading
  const [alertConfig, setAlertConfig] = useState({              // Configuración de alertas personalizadas
    type: 'success',    // Tipo de alerta: success | error | info
    title: '',          // Título de la alerta
    message: '',        // Mensaje de la alerta
    onConfirm: () => {},// Función a ejecutar al confirmar
  });

  // -----------------------
  // Función para mostrar alertas bonitas
  // -----------------------
  const showCustomAlert = (type, title, message, onConfirm = () => {}) => {
    setAlertConfig({
      type,
      title,
      message,
      onConfirm: () => {
        setShowAlert(false); // Cierra la alerta al confirmar
        onConfirm();          // Ejecuta función extra si se pasa
      },
    });
    setShowAlert(true); // Muestra la alerta
  };

  // -----------------------
  // Función para mostrar/ocultar loading
  // -----------------------
  const showLoadingOverlay = (show = true, type = 'default') => {
    setShowLoading(show); // Solo controla visibilidad, type se podría usar para estilos
  };

  // -----------------------
  // Persistir token en AsyncStorage
  // -----------------------
  useEffect(() => {
    const saveToken = async () => {
      try {
        if (verificationToken) {
          await AsyncStorage.setItem('recoveryToken', verificationToken); // Guarda token
        } else {
          await AsyncStorage.removeItem('recoveryToken'); // Elimina token si es null
        }
      } catch (error) {
        console.error('Error saving recovery token:', error);
      }
    };
    saveToken();
  }, [verificationToken]);

  // -----------------------
  // Recuperar token desde AsyncStorage al inicializar
  // -----------------------
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('recoveryToken'); // Lee token
        if (storedToken && !verificationToken) {
          setVerificationToken(storedToken); // Si existe y no hay token en estado, lo setea
        }
      } catch (error) {
        console.error('Error loading recovery token:', error);
      }
    };
    loadToken();
  }, []);

  // -----------------------
  // Timer para habilitar reenvío de código
  // -----------------------
  const startTimer = () => {
    setCanResend(false);
    setTimer(30); // Reinicia contador
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval); // Para timer al llegar a 0
          setCanResend(true);      // Permite reenvío
          return 0;
        }
        return prev - 1; // Decrementa cada segundo
      });
    }, 1000);
  };

  // -----------------------
  // Solicitar código de recuperación
  // -----------------------
  const handleRequestCode = async (emailValue) => {
    console.log('[usePasswordRecovery] Solicitando código para:', emailValue);
    
    // Validación básica del email
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setEmail(emailValue);

    // Mostrar loading bonito
    showLoadingOverlay(true, 'sending');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay mínimo

    try {
      const response = await requestRecoveryCode(emailValue); // Llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));  // Delay antes de ocultar loading
      showLoadingOverlay(false);

      // Alerta de éxito
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
      showLoadingOverlay(false); // Ocultar loading en error
      const errorMessage = err.message || 'Error al enviar el correo';
      setError(errorMessage);

      // Alerta de error
      showCustomAlert(
        'error',
        'Error al Enviar',
        `No se pudo enviar el código de recuperación. ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------
  // Verificar código ingresado
  // -----------------------
  const handleVerifyCode = async () => {
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }

    setIsSubmitting(true);
    setError('');
    showLoadingOverlay(true, 'verifying'); // Mostrar loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await verifyRecoveryCode(email, completeCode); // Llamada a API
      setVerificationToken(response.token); // Guarda token recibido
      await new Promise(resolve => setTimeout(resolve, 500));
      showLoadingOverlay(false);

      // Alerta de éxito
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
      showLoadingOverlay(false);
      const errorMessage = err.message || 'Código inválido o expirado';
      setError(errorMessage);

      showCustomAlert(
        'error',
        'Código Incorrecto',
        'El código ingresado es inválido o ha expirado. Verifica los dígitos o solicita un nuevo código.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------
  // Restablecer contraseña
  // -----------------------
  const handleResetPassword = async (newPassword) => {
    if (!verificationToken) {
      const errorMsg = 'Token de verificación no encontrado';
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
    showLoadingOverlay(true, 'updating'); // Loading
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const response = await resetPassword({ newPassword, token: verificationToken });
      setVerificationToken(null);
      await AsyncStorage.removeItem('recoveryToken'); // Limpiar token
      await new Promise(resolve => setTimeout(resolve, 500));
      showLoadingOverlay(false);

      // Alerta de éxito y redirección
      showCustomAlert(
        'success',
        '¡Contraseña Actualizada!',
        'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login', params: { message: 'Contraseña actualizada correctamente', type: 'success' } }],
          });
        }
      );

    } catch (err) {
      showLoadingOverlay(false);
      const errorMessage = err.message || 'Error al actualizar contraseña';
      setError(errorMessage);

      showCustomAlert(
        'error',
        'Error al Actualizar',
        `No se pudo actualizar la contraseña. ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------
  // Reenviar código
  // -----------------------
  const handleResendCode = async () => {
    if (!email) {
      setError('No se puede reenviar sin email');
      return;
    }

    setIsSubmitting(true);
    setError('');
    showLoadingOverlay(true, 'sending');
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      await requestRecoveryCode(email);
      await new Promise(resolve => setTimeout(resolve, 400));
      showLoadingOverlay(false);

      showCustomAlert(
        'success',
        'Código Reenviado',
        `Se ha enviado un nuevo código a ${email}. Revisa tu bandeja de entrada.`,
        () => startTimer()
      );

    } catch (error) {
      showLoadingOverlay(false);
      const errorMessage = error.message || 'Error al reenviar el correo';
      setError(errorMessage);

      showCustomAlert(
        'error',
        'Error al Reenviar',
        `No se pudo reenviar el código. ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------
  // Manejo de cambios en inputs de código
  // -----------------------
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Solo números

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior se maneja en componente externo
    }
  };

  // -----------------------
  // Función para volver atrás
  // -----------------------
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('RecoveryPassword');
    }
  };

  // -----------------------
  // Retorno de hook
  // -----------------------
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
