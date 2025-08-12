// hooks/useLogin.js - REACT NATIVE VERSION
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export const useLogin = () => {
  const { login } = useAuth();
  const navigation = useNavigation();

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

  // Función para mostrar toasts personalizados
  const showToast = (type, title, message, duration = 3000) => {
    Toast.show({
      type: type, // 'success', 'error', 'info'
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
    });
  };

  const onSubmit = async (data) => {
    try {
      console.log('[useLogin-RN] Iniciando login para:', data.email);
      
      const user = await login(data);
      
      console.log('[useLogin-RN] Usuario recibido:', user);
      
      // Verificar que el usuario tenga permisos (doble verificación)
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      if (hasValidType || hasValidRole) {
        console.log('[useLogin-RN] Usuario autorizado, redirigiendo...');
        
        // Toast de éxito
        showToast(
          'success',
          '¡Bienvenido!',
          `Acceso autorizado como ${user.role || user.type}`,
          2000
        );
       
        // Limpiar formulario
        reset();
        
        // Redirigir al panel después del login exitoso
        navigation.replace('CatalogManagement');
        
      } else {
        console.warn('[useLogin-RN] Usuario sin permisos suficientes');
        
        showToast(
          'error',
          'Acceso Denegado',
          'Se requiere una cuenta de empleado para acceder al panel administrativo'
        );
       
        setError('root', {
          message: 'Solo personal autorizado puede acceder al sistema'
        });
      }
    } catch (error) {
      console.error('[useLogin-RN] Error en login:', error);
      
      let toastTitle = 'Error de Autenticación';
      let toastMessage = 'Ha ocurrido un error al iniciar sesión';
     
      if (error.message?.includes('Credenciales incorrectas') || 
          error.message?.includes('credenciales')) {
        toastTitle = 'Credenciales Incorrectas';
        toastMessage = 'El correo electrónico o la contraseña son incorrectos.';
       
        showToast('error', toastTitle, toastMessage);
        setError('root', { message: 'Email o contraseña incorrectos' });
       
      } else if (error.message?.includes('personal autorizado') || 
                 error.message?.includes('empleado')) {
        toastTitle = 'Acceso Restringido';
        toastMessage = 'Se requiere una cuenta de empleado para acceder.';
       
        showToast('error', toastTitle, toastMessage);
        setError('root', { message: 'Se requiere cuenta de empleado' });
       
      } else if (error.needsVerification) {
        showToast(
          'info',
          'Verificación Requerida',
          'Tu cuenta necesita ser verificada por un administrador.'
        );
        
        setError('root', { message: 'Cuenta pendiente de verificación' });
        return;
       
      } else if (error.message?.includes('red') || error.code === 'NETWORK_ERROR') {
        toastTitle = 'Error de Conexión';
        toastMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
       
        showToast('error', toastTitle, toastMessage);
        setError('root', { message: 'Error de conexión con el servidor' });
       
      } else if (error.message?.includes('servidor') || error.status >= 500) {
        toastTitle = 'Error del Servidor';
        toastMessage = 'El servidor está experimentando problemas.';
       
        showToast('error', toastTitle, toastMessage);
        setError('root', { message: 'Error del servidor, intenta más tarde' });
       
      } else {
        // Error genérico
        toastMessage = error.message || 'Error desconocido al iniciar sesión';
        showToast('error', toastTitle, toastMessage);
        setError('root', { message: toastMessage });
      }
    }
  };

  // Validaciones mejoradas (igual que la web)
  const validateEmail = (value) => {
    if (!value?.trim()) return 'Email requerido';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)) {
      return 'Formato de email inválido';
    }
    return true;
  };

  const validatePassword = (value) => {
    if (!value) return 'Contraseña requerida';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return true;
  };

  // Función para mostrar loading toast
  const showLoadingToast = () => {
    showToast('info', 'Iniciando Sesión...', 'Verificando credenciales');
  };

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showToast,
    showLoadingToast,
    reset,
    validateEmail,
    validatePassword
  };
};