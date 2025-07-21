// src/hooks/useLogin.js
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];

      if (allowedTypes.includes(user.type.toLowerCase())) {
        navigate('/catalog-management', { replace: true });
      } else {
        setError('root', {
          message: 'Solo personal autorizado puede acceder'
        });
      }
    } catch (error) {
      let message = 'Error al iniciar sesión';
      
      if (error.message.includes('Credenciales incorrectas')) {
        message = 'Credenciales incorrectas';
      } else if (error.needsVerification) {
        navigate('/verify-email', { state: { email: data.email } });
        return;
      }
      
      setError('root', { message });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit
  };
};