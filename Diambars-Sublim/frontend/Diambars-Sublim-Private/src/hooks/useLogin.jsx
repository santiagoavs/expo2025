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
    setError
  } = useForm();
 
  // Configuración personalizada de SweetAlert con los colores de tu marca
  const showAlert = (type, title, text, options = {}) => {
    const defaultOptions = {
      title,
      text,
      icon: type,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#6c757d',
      background: '#FFF6E2',
      color: '#2C2C2C',
      customClass: {
        popup: 'diambars-swal-popup',
        title: 'diambars-swal-title',
        content: 'diambars-swal-content',
        confirmButton: 'diambars-swal-confirm',
        cancelButton: 'diambars-swal-cancel'
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
      const user = await login(data);
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
 
      if (allowedTypes.includes(user.type.toLowerCase())) {
        // Alerta de éxito con información del usuario
        await showAlert(
          'success',
          '¡Bienvenido!',
          `Inicio de sesión exitoso como ${user.type}`,
          {
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          }
        );
       
        navigate('/catalog-management', { replace: true });
      } else {
        // Alerta de acceso denegado
        await showAlert(
          'warning',
          'Acceso Denegado',
          'Solo personal autorizado puede acceder al sistema',
          {
            confirmButtonText: 'Entendido'
          }
        );
       
        setError('root', {
          message: 'Solo personal autorizado puede acceder'
        });
      }
    } catch (error) {
      let alertTitle = 'Error de Autenticación';
      let alertText = 'Ha ocurrido un error al iniciar sesión';
     
      if (error.message.includes('Credenciales incorrectas')) {
        alertTitle = 'Credenciales Incorrectas';
        alertText = 'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
       
        setError('root', { message: 'Credenciales incorrectas' });
       
      } else if (error.needsVerification) {
        // Alerta para verificación de email
        const result = await showAlert(
          'info',
          'Verificación Requerida',
          'Tu cuenta necesita ser verificada. ¿Deseas ir a la página de verificación?',
          {
            showCancelButton: true,
            confirmButtonText: 'Verificar Ahora',
            cancelButtonText: 'Más Tarde',
            reverseButtons: true
          }
        );
 
        if (result.isConfirmed) {
          navigate('/verify-email', { state: { email: data.email } });
        }
        return;
       
      } else if (error.message.includes('red')) {
        alertTitle = 'Error de Conexión';
        alertText = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
       
      } else if (error.message.includes('servidor')) {
        alertTitle = 'Error del Servidor';
        alertText = 'El servidor está experimentando problemas. Por favor, intenta más tarde.';
       
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Entendido'
        });
       
      } else {
        // Error genérico
        await showAlert('error', alertTitle, alertText, {
          confirmButtonText: 'Reintentar'
        });
      }
     
      setError('root', { message: alertText });
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
      background: '#FFF6E2',
      color: '#2C2C2C',
      customClass: {
        popup: 'diambars-swal-popup'
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
 
  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showAlert,
    showLoadingAlert,
    closeLoadingAlert
  };
};