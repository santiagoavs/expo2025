import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        const path = location.state?.from?.pathname || '/catalog-management';
        navigate(path, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Solo personal autorizado puede acceder'
        });
      }
    } catch (error) {
      let msg = error.message || 'Error al iniciar sesión';

      if (msg.includes('inválidos') || msg.includes('incorrectas')) {
        msg = 'Credenciales incorrectas';
      } else if (error.needsVerification) {
        navigate('/verify-email', {
          state: {
            email: data.email,
            message: 'Verifica tu correo antes de iniciar sesión'
          }
        });
        return;
      }

      setError('root', { type: 'manual', message: msg });
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
