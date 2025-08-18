// src/hooks/useLogin.js - CON ALERTAS BONITAS Y DELAYS
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { login as loginService } from '../api/authService';

export const useLogin = () => {
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
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
  const showLoadingOverlay = (show = true) => {
    setShowLoading(show);
  };

  const onSubmit = async (data) => {
    try {
      console.log('[useLogin] Datos del formulario:', data);
      
      // 🌀 MOSTRAR LOADING
      console.log('🌀 [useLogin] Mostrando spinner...');
      showLoadingOverlay(true);
      
      // ⏰ DELAY MÍNIMO para que se vea el spinner (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 🔥 CONECTAR AL BACKEND
      const user = await loginService(data);
      
      console.log('[useLogin] Usuario recibido del backend:', user);
      
      // Verificar que el usuario tenga permisos de empleado
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      // ⏰ DELAY ANTES DE OCULTAR (medio segundo más)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🌀 OCULTAR LOADING
      console.log('🌀 [useLogin] Ocultando spinner...');
      showLoadingOverlay(false);

      if (hasValidType || hasValidRole) {
        // ✅ Usuario autorizado - Alerta de éxito bonita
        showCustomAlert(
          'success',
          '¡Bienvenido!',
          `Acceso autorizado como ${user.role || user.type}. Serás redirigido al panel administrativo.`,
          () => {
            reset(); // Limpiar formulario
            navigation.navigate('CatalogManagement');
          }
        );
      } else {
        // ❌ Usuario sin permisos - Alerta de advertencia
        showCustomAlert(
          'warning',
          'Acceso Restringido',
          'Se requiere una cuenta de empleado para acceder al panel administrativo.'
        );
        setError('root', { message: 'Solo personal autorizado puede acceder' });
      }
      
    } catch (error) {
      console.error('[useLogin] Error en login:', error);
      
      // 🌀 OCULTAR LOADING EN CASO DE ERROR
      console.log('🌀 [useLogin] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      // 🚨 MANEJO DE ERRORES CON ALERTAS BONITAS
      if (error.message?.includes('Credenciales incorrectas') || 
          error.message?.includes('credenciales')) {
        
        showCustomAlert(
          'error',
          'Credenciales Incorrectas',
          'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.'
        );
        setError('root', { message: 'Email o contraseña incorrectos' });
        
      } else if (error.message?.includes('personal autorizado') || 
                 error.message?.includes('empleado')) {
        
        showCustomAlert(
          'warning',
          'Acceso Denegado',
          'Se requiere una cuenta de empleado para acceder al panel administrativo.'
        );
        setError('root', { message: 'Se requiere cuenta de empleado' });
        
      } else if (error.needsVerification) {
        
        showCustomAlert(
          'info',
          'Verificación Requerida',
          'Tu cuenta necesita ser verificada por un administrador antes de poder acceder.'
        );
        setError('root', { message: 'Cuenta pendiente de verificación' });
        
      } else if (error.message?.includes('red') || error.code === 'NETWORK_ERROR') {
        
        showCustomAlert(
          'error',
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté funcionando.'
        );
        setError('root', { message: 'Error de conexión con el servidor' });
        
      } else if (error.message?.includes('servidor') || error.status >= 500) {
        
        showCustomAlert(
          'error',
          'Error del Servidor',
          'El servidor está experimentando problemas. Por favor, intenta más tarde.'
        );
        setError('root', { message: 'Error del servidor, intenta más tarde' });
        
      } else {
        // Error genérico
        const errorMessage = error.message || 'Error desconocido al iniciar sesión';
        showCustomAlert(
          'error',
          'Error de Autenticación',
          errorMessage
        );
        setError('root', { message: errorMessage });
      }
    }
  };

  // Validaciones
  const validateEmail = (value) => {
    if (!value?.trim()) return 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    return true;
  };

  const validatePassword = (value) => {
    if (!value) return 'Contraseña requerida';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    return true;
  };

  return {
    // React Hook Form
    control,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    validateEmail,
    validatePassword,
    reset,
    
    // Alertas y Loading bonitos
    showAlert,
    showLoading,
    alertConfig,
    setShowAlert,
    showCustomAlert,
    showLoadingOverlay,
  };
};