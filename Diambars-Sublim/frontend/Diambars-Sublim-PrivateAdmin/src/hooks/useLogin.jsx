// src/hooks/useLogin.js - PANEL ADMIN CORREGIDO
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
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

  // Configuración personalizada de SweetAlert con colores modernos
  const showAlert = (type, title, text, options = {}) => {
    const defaultOptions = {
      title,
      text,
      icon: type,
      confirmButtonColor: '#fbbf24',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        content: 'modern-swal-content',
        confirmButton: 'modern-swal-confirm',
        cancelButton: 'modern-swal-cancel'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    };

    return Swal.fire({
      ...defaultOptions,
      ...options
    });
  };

  const onSubmit = async (data) => {
    try {
      console.log('[useLogin-ADMIN] Iniciando login para:', data.email);
      
      const user = await login(data);
      
      console.log('[useLogin-ADMIN] Usuario recibido:', user);
      
      // Verificar que el usuario tenga permisos (doble verificación)
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      if (hasValidType || hasValidRole) {
        console.log('[useLogin-ADMIN] Usuario autorizado, redirigiendo...');
        
        // Alerta de éxito con información del usuario
        await showAlert(
          'success',
          '¡Bienvenido!',
          `Acceso autorizado como ${user.role || user.type}`,
          {
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          }
        );
       
        // Limpiar formulario
        reset();
        
        // Redirigir al panel después del login exitoso
        navigate('/catalog-management', { replace: true });
      } else {
        console.warn('[useLogin-ADMIN] Usuario sin permisos suficientes');
        
        // Alerta de acceso denegado
        await showAlert(
          'warning',
          'Acceso Denegado',
          'Se requiere una cuenta de empleado para acceder al panel administrativo',
          {
            confirmButtonText: 'Entendido'
          }
        );
       
        setError('root', {
          message: 'Solo personal autorizado puede acceder al sistema'
        });
      }
    } catch (error) {
      console.error('[useLogin-ADMIN] Error en login:', error);
      
      let alertTitle = 'Error de Autenticación';
      let alertText = 'Ha ocurrido un error al iniciar sesión';
     
      if (error.message?.includes('Credenciales incorrectas') || 
          error.message?.includes('credenciales')) {
        alertTitle = 'Credenciales Incorrectas';
        alertText = 'El correo electrónico o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
       
        setError('root', { message: 'Email o contraseña incorrectos' });
       
      } else if (error.message?.includes('personal autorizado') || 
                 error.message?.includes('empleado')) {
        alertTitle = 'Acceso Restringido';
        alertText = 'Se requiere una cuenta de empleado para acceder al panel administrativo.';
       
        await showAlert('warning', alertTitle, alertText, {
          confirmButtonText: 'Entendido'
        });
       
        setError('root', { message: 'Se requiere cuenta de empleado' });
       
      } else if (error.needsVerification) {
        // Empleados normalmente no necesitan verificación, pero por si acaso
        const result = await showAlert(
          'info',
          'Verificación Requerida',
          'Tu cuenta necesita ser verificada por un administrador.',
          {
            confirmButtonText: 'Entendido'
          }
        );
        
        setError('root', { message: 'Cuenta pendiente de verificación' });
        return;
       
      } else if (error.message?.includes('red') || error.code === 'NETWORK_ERROR') {
        alertTitle = 'Error de Conexión';
        alertText = 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté funcionando.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
        
        setError('root', { message: 'Error de conexión con el servidor' });
       
      } else if (error.message?.includes('servidor') || error.status >= 500) {
        alertTitle = 'Error del Servidor';
        alertText = 'El servidor está experimentando problemas. Por favor, intenta más tarde.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Entendido'
        });
        
        setError('root', { message: 'Error del servidor, intenta más tarde' });
       
      } else {
        // Error genérico
        alertText = error.message || 'Error desconocido al iniciar sesión';
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
        
        setError('root', { message: alertText });
      }
    }
  };

  // Función para mostrar alerta de loading durante el proceso
  const showLoadingAlert = () => {
    return Swal.fire({
      title: 'Iniciando Sesión...',
      text: 'Por favor espera mientras verificamos tus credenciales',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'modern-swal-popup'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  // Función para cerrar la alerta de loading
  const closeLoadingAlert = () => {
    Swal.close();
  };

  // Validaciones mejoradas
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

  return {
    register: (name, options = {}) => {
      // Agregar validaciones automáticas según el campo
      switch (name) {
        case 'email':
          return register(name, { ...options, validate: validateEmail });
        case 'password':
          return register(name, { ...options, validate: validatePassword });
        default:
          return register(name, options);
      }
    },
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showAlert,
    showLoadingAlert,
    closeLoadingAlert,
    reset
  };
};