// src/hooks/useLogin.js - HOOK DE LOGIN CON ALERTAS BONITAS Y DELAYS

// Importamos useState para manejar estados locales
import { useState } from 'react';

// Importamos useForm para manejar formularios con react-hook-form
import { useForm } from 'react-hook-form';

// Importamos useNavigation para navegar entre pantallas de React Navigation
import { useNavigation } from '@react-navigation/native';

// Importamos la función de login desde nuestro servicio de autenticación
import { login as loginService } from '../api/authService';

// Definimos el hook personalizado useLogin
export const useLogin = () => {

  // Obtenemos el objeto de navegación para poder navegar a otras pantallas
  const navigation = useNavigation();

  // Estado para mostrar/ocultar alertas bonitas
  const [showAlert, setShowAlert] = useState(false);

  // Estado para mostrar/ocultar el overlay de loading/spinner
  const [showLoading, setShowLoading] = useState(false);

  // Configuración de la alerta (tipo, título, mensaje y acción al confirmar)
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',    // tipo de alerta: success, error, warning, info
    title: '',          // título de la alerta
    message: '',        // mensaje de la alerta
    onConfirm: () => {},// función que se ejecuta al confirmar
  });

  // Configuración del formulario con react-hook-form
  const {
    control,           // controla los inputs
    handleSubmit,      // función para enviar el formulario
    formState: { errors, isSubmitting }, // errores y estado de envío
    setError,          // función para asignar errores manualmente
    reset              // función para resetear el formulario
  } = useForm({
    mode: 'onChange',  // validación en cada cambio
    defaultValues: {   // valores iniciales del formulario
      email: '',
      password: ''
    }
  });

  // -----------------------------
  // Función para mostrar alertas bonitas
  // -----------------------------
  const showCustomAlert = (type, title, message, onConfirm = () => {}) => {
    setAlertConfig({
      type,
      title,
      message,
      onConfirm: () => {
        setShowAlert(false); // ocultar alerta al confirmar
        onConfirm();         // ejecutar acción adicional si se proporciona
      },
    });
    setShowAlert(true);     // mostrar la alerta
  };

  // -----------------------------
  // Función para mostrar/ocultar overlay de loading
  // -----------------------------
  const showLoadingOverlay = (show = true) => {
    setShowLoading(show);
  };

  // -----------------------------
  // Función que maneja el envío del formulario
  // -----------------------------
  const onSubmit = async (data) => {
    try {
      console.log('[useLogin] Datos del formulario:', data);
      
      // Mostramos spinner de loading
      console.log('🌀 [useLogin] Mostrando spinner...');
      showLoadingOverlay(true);
      
      // Delay mínimo para que se vea el spinner (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Llamamos al backend para login
      const user = await loginService(data);
      console.log('[useLogin] Usuario recibido del backend:', user);
      
      // Validamos que el usuario tenga permisos correctos
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      // Delay extra antes de ocultar spinner (medio segundo)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ocultamos spinner
      console.log('🌀 [useLogin] Ocultando spinner...');
      showLoadingOverlay(false);

      // Si usuario autorizado
      if (hasValidType || hasValidRole) {
        // Alerta de éxito
        showCustomAlert(
          'success',
          '¡Bienvenido!',
          `Acceso autorizado como ${user.role || user.type}. Serás redirigido al panel administrativo.`,
          () => {
            reset(); // Limpiar formulario
            navigation.navigate('CatalogManagement'); // Ir al panel
          }
        );
      } else {
        // Usuario no autorizado - alerta de advertencia
        showCustomAlert(
          'warning',
          'Acceso Restringido',
          'Se requiere una cuenta de empleado para acceder al panel administrativo.'
        );
        setError('root', { message: 'Solo personal autorizado puede acceder' });
      }
      
    } catch (error) {
      console.error('[useLogin] Error en login:', error);
      
      // Ocultamos spinner en caso de error
      console.log('🌀 [useLogin] Ocultando spinner por error...');
      showLoadingOverlay(false);
      
      // Manejo de errores según tipo
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

  // -----------------------------
  // Validaciones de inputs
  // -----------------------------

  const validateEmail = (value) => {
    if (!value?.trim()) return 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
    return true;
  };

  const validatePassword = (value) => {
    if (!value) return 'Contraseña requerida';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    return true;
  };

  // -----------------------------
  // Retorno del hook: todo lo que necesitamos en el componente
  // -----------------------------
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
