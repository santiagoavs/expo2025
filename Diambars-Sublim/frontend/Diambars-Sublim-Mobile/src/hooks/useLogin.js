// src/hooks/useLogin.js - CONECTADO AL BACKEND
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { login as loginService } from '../api/authService'; // 👈 NUEVA IMPORTACIÓN

export const useLogin = () => {
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

  const onSubmit = async (data) => {
    try {
      console.log('[useLogin] Datos del formulario:', data);
      
      // 🔥 CONECTAR AL BACKEND - Reemplazar simulación
      const user = await loginService(data);
      
      console.log('[useLogin] Usuario recibido del backend:', user);
      
      // Verificar que el usuario tenga permisos de empleado
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);

      if (hasValidType || hasValidRole) {
        // ✅ Usuario autorizado
        Alert.alert(
          '¡Bienvenido!', 
          `Acceso autorizado como ${user.role || user.type}`,
          [{ text: 'Continuar', onPress: () => {
            reset(); // Limpiar formulario
            navigation.navigate('CatalogManagement');
          }}]
        );
      } else {
        // ❌ Usuario sin permisos
        Alert.alert(
          'Acceso Denegado', 
          'Se requiere una cuenta de empleado para acceder al panel administrativo'
        );
        setError('root', { message: 'Solo personal autorizado puede acceder' });
      }
      
    } catch (error) {
      console.error('[useLogin] Error en login:', error);
      
      // 🚨 MANEJO DE ERRORES DEL BACKEND
      let alertTitle = 'Error de Autenticación';
      let alertMessage = 'Ha ocurrido un error al iniciar sesión';
      
      if (error.message?.includes('Credenciales incorrectas') || 
          error.message?.includes('credenciales')) {
        alertTitle = 'Credenciales Incorrectas';
        alertMessage = 'El correo electrónico o la contraseña son incorrectos.';
        setError('root', { message: 'Email o contraseña incorrectos' });
        
      } else if (error.message?.includes('personal autorizado') || 
                 error.message?.includes('empleado')) {
        alertTitle = 'Acceso Restringido';
        alertMessage = 'Se requiere una cuenta de empleado para acceder al panel administrativo.';
        setError('root', { message: 'Se requiere cuenta de empleado' });
        
      } else if (error.message?.includes('red') || error.code === 'NETWORK_ERROR') {
        alertTitle = 'Error de Conexión';
        alertMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        setError('root', { message: 'Error de conexión con el servidor' });
        
      } else if (error.message?.includes('servidor') || error.status >= 500) {
        alertTitle = 'Error del Servidor';
        alertMessage = 'El servidor está experimentando problemas. Por favor, intenta más tarde.';
        setError('root', { message: 'Error del servidor, intenta más tarde' });
        
      } else {
        alertMessage = error.message || 'Error desconocido al iniciar sesión';
        setError('root', { message: alertMessage });
      }
      
      Alert.alert(alertTitle, alertMessage);
    }
  };

  // Validaciones (las mantengo igual)
  const validateEmail = (value) => {
    if (!value?.trim()) return 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    return true;
  };

  const validatePassword = (value) => {
    if (!value) return 'Contraseña requerida';
    if (value.length < 3) return 'Mínimo 3 caracteres'; // Cambiaste a 3, lo respeto
    return true;
  };

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    validateEmail,
    validatePassword,
    reset
  };
};