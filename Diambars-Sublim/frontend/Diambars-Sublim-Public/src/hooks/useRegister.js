// src/hooks/useRegister.js
import { useForm } from 'react-hook-form';
import { registerUser } from '../api/registerService';
import { useNavigate } from 'react-router-dom';

export const useRegister = (onSuccessCallback) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch
  } = useForm({
    mode: 'onChange', // Validar en tiempo real
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('[useRegister] Iniciando registro con datos:', data);
      
      // Validar que el teléfono sea válido si se proporciona
      if (data.phone && !/^[267][0-9]{7}$/.test(data.phone)) {
        setError('phone', { 
          type: 'manual', 
          message: 'Número inválido (8 dígitos, comienza con 2, 6 o 7)' 
        });
        return;
      }

      const response = await registerUser(data);
      console.log('[useRegister] Registro exitoso:', response);

      // Ejecutar callback si se proporciona (cambio de vista)
      if (onSuccessCallback && typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }

      // Redirige a pantalla de verificación
      navigate('/verifyEmail', { 
        state: { 
          email: response.email || data.email,
          message: response.message || 'Usuario registrado correctamente'
        } 
      });

      // Limpiar formulario
      reset();
      
    } catch (error) {
      console.error('[useRegister] Error en registro:', error);
      
      // Determinar dónde mostrar el error
      const message = error.message || 'Error al registrar';
      
      // Si es un error específico de campo, mostrarlo en el campo
      if (message.toLowerCase().includes('correo')) {
        setError('email', { type: 'manual', message });
      } else if (message.toLowerCase().includes('teléfono') || message.toLowerCase().includes('telefono')) {
        setError('phone', { type: 'manual', message });
      } else if (message.toLowerCase().includes('nombre')) {
        setError('name', { type: 'manual', message });
      } else if (message.toLowerCase().includes('contraseña')) {
        setError('password', { type: 'manual', message });
      } else {
        // Error general
        setError('root', { type: 'manual', message });
      }
    }
  };

  // Validaciones adicionales
  const validatePhone = (value) => {
    if (!value) return true; // Opcional
    if (!/^[0-9]+$/.test(value)) return 'Solo se permiten números';
    if (value.length !== 8) return 'Debe tener exactamente 8 dígitos';
    if (!/^[267]/.test(value)) return 'Debe comenzar con 2, 6 o 7';
    return true;
  };

  const validateEmail = (value) => {
    if (!value) return 'Correo requerido';
    if (!/^\S+@\S+\.\S+$/.test(value)) return 'Formato de correo inválido';
    return true;
  };

  const validateName = (value) => {
    if (!value?.trim()) return 'Nombre requerido';
    if (value.trim().length < 3) return 'Debe tener al menos 3 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras y espacios';
    return true;
  };

  const validatePassword = (value) => {
    if (!value) return 'Contraseña requerida';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return true;
  };

  const validateAddress = (value) => {
    if (!value?.trim()) return 'Dirección requerida';
    if (value.trim().length < 5) return 'Debe tener al menos 5 caracteres';
    return true;
  };

  return {
    register: (name, options = {}) => {
      // Agregar validaciones automáticas según el campo
      switch (name) {
        case 'phone':
          return register(name, { ...options, validate: validatePhone });
        case 'email':
          return register(name, { ...options, validate: validateEmail });
        case 'name':
          return register(name, { ...options, validate: validateName });
        case 'password':
          return register(name, { ...options, validate: validatePassword });
        case 'address':
          return register(name, { ...options, validate: validateAddress });
        default:
          return register(name, options);
      }
    },
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    reset,
    watch
  };
};