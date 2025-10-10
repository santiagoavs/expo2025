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
    clearErrors,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);

      // Validar roles
      const allowedTypes = ['employee', 'manager', 'delivery', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'delivery'];
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();

      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      if (hasValidType || hasValidRole) {
        await Swal.fire({
          title: '¡Bienvenido!',
          text: `Acceso autorizado como ${user.role || user.type}`,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: '#ffffff',
          color: '#1f2937'
        });
        reset();
        navigate('/catalog-management', { replace: true });
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Acceso Denegado',
          text: 'Se requiere una cuenta de empleado para acceder al panel administrativo',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#fbbf24',
          background: '#ffffff',
          color: '#1f2937'
        });
        setError('root', {
          message: 'Solo personal autorizado puede acceder al sistema'
        });
        setTimeout(() => clearErrors('root'), 2000);
      }
    } catch (error) {
      let alertText = 'Ha ocurrido un error al iniciar sesión';
      if (error.message?.includes('Credenciales incorrectas') || error.message?.includes('credenciales')) {
        alertText = 'El correo electrónico o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.';
      } else if (error.message?.includes('personal autorizado') || error.message?.includes('empleado')) {
        alertText = 'Se requiere una cuenta de empleado para acceder al panel administrativo.';
      } else if (error.needsVerification) {
        alertText = 'Tu cuenta necesita ser verificada por un administrador.';
      } else if (error.message?.includes('red') || error.code === 'NETWORK_ERROR') {
        alertText = 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté funcionando.';
      } else if (error.message?.includes('servidor') || error.status >= 500) {
        alertText = 'El servidor está experimentando problemas. Por favor, intenta más tarde.';
      } else {
        alertText = error.message || 'Error desconocido al iniciar sesión';
      }
      await Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: alertText,
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#fbbf24',
        background: '#ffffff',
        color: '#1f2937'
      });
      setError('root', { message: alertText });
      setTimeout(() => clearErrors('root'), 2000);
    }
  };

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
    reset
  };
};