// src/hooks/useLogin.js
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/loginService.js';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('[useLogin] Iniciando proceso de login');
      
      // Limpiar errores previos
      clearErrors();
      
      // Normalizar email
      const loginData = {
        email: data.email.toLowerCase().trim(),
        password: data.password
      };
      
      console.log('[useLogin] Datos de login normalizados:', { email: loginData.email });
      
      const user = await loginUser(loginData);
      
      console.log('[useLogin] Usuario recibido del servicio:', user);
      console.log('[useLogin] Propiedades del usuario:', Object.keys(user));
      
      // Guardar usuario en contexto
      login(user);
      
      console.log('[useLogin] Login completado, redirigiendo a perfil');
      
      // Redirigir al perfil
      navigate('/profile');
      
    } catch (error) {
      console.error('[useLogin] Error en el proceso de login:', error);
      
      // Manejar error de verificación
      if (error.needsVerification === true) {
        console.log('[useLogin] Detectado error de verificación para:', error.email || data.email);
        setError('root', { 
          type: 'manual',
          message: 'NEEDS_VERIFICATION',
          email: error.email || data.email
        });
        return;
      }
      
      // Manejar otros errores
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message) {
        if (error.message.toLowerCase().includes('credenciales')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.toLowerCase().includes('verificado') || 
                   error.message.toLowerCase().includes('verifica')) {
          // Por si acaso no se detectó como needsVerification
          setError('root', { 
            type: 'manual',
            message: 'NEEDS_VERIFICATION',
            email: data.email
          });
          return;
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('[useLogin] Estableciendo error:', errorMessage);
      setError('root', { type: 'manual', message: errorMessage });
    }
  };

  const handleVerifyEmailClick = (email) => {
    console.log('[useLogin] Redirigiendo a verificación para:', email);
    navigate('/verifyEmail', { 
      state: { 
        email: email || 'tu correo',
        fromLogin: true 
      } 
    });
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
    if (value.length < 1) return 'Contraseña no puede estar vacía';
    return true;
  };

  return {
    register: (name, options = {}) => {
      // Agregar validaciones automáticas
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
    handleVerifyEmailClick,
    clearErrors
  };
};