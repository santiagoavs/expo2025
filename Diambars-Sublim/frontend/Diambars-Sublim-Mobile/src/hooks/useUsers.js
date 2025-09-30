// src/hooks/useUsers.js
import { useCallback, useEffect, useState } from 'react';
import userService from '../api/userService';
import { Alert } from 'react-native';

const useUsers = () => {
  // ==================== ESTADOS ====================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage) => {
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

    console.error('❌ [useUsers-Mobile] Error:', { error, response: error.response, config: error.config });
    
    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK', style: 'default' }]
    );
    
    setError(errorMessage);
    throw new Error(errorMessage);
  }, []);

  // Función para formatear usuarios con campos faltantes
  const formatUser = useCallback((user) => {
    const formattedUser = {
      ...user,
      id: user._id || user.id,
      phone: user.phoneNumber || user.phone || '', // Mapear phoneNumber a phone para compatibilidad
      phoneNumber: user.phoneNumber || user.phone || '', // Mantener ambos
      avatar: user.avatar || null,
      lastLogin: user.lastLogin || null,
      permissions: user.permissions || [],
      status: user.active !== false ? 'active' : 'inactive' // Mapear active a status
    };
    
    console.log('🔧 [useUsers-Mobile] Usuario formateado:', {
      id: formattedUser.id,
      name: formattedUser.name,
      status: formattedUser.status,
      active: formattedUser.active
    });
    
    return formattedUser;
  }, []);

  // ==================== OPERACIONES CRUD ====================

  // Obtener todos los usuarios
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [useUsers-Mobile] Obteniendo usuarios...');
      const data = await userService.getAll();
      console.log('✅ [useUsers-Mobile] Usuarios recibidos:', data);

      if (!Array.isArray(data)) {
        throw new Error("Formato de usuarios inválido");
      }

      const formattedUsers = data.map(formatUser);
      setUsers(formattedUsers);
      console.log('✅ [useUsers-Mobile] Usuarios formateados y establecidos:', formattedUsers.length);

    } catch (err) {
      console.error("❌ [useUsers-Mobile] Error al cargar usuarios:", err);
      handleError(err, "Error al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [formatUser, handleError]);

  // Crear usuario
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      console.log('📤 [useUsers-Mobile] Creando usuario:', userData);
      
      // Sanitizar datos
      const sanitizedData = {
        name: userData.name?.trim(),
        email: userData.email?.trim().toLowerCase(),
        phoneNumber: userData.phoneNumber?.trim() || userData.phone?.trim(),
        password: userData.password?.trim(),
        role: userData.role || 'customer',
        active: userData.active !== false
      };

      // Validaciones básicas
      if (!sanitizedData.name) {
        throw new Error('El nombre es obligatorio');
      }
      if (!sanitizedData.email) {
        throw new Error('El email es obligatorio');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedData.email)) {
        throw new Error('El email no tiene un formato válido');
      }
      if (!sanitizedData.password) {
        throw new Error('La contraseña es obligatoria');
      }
      if (sanitizedData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      console.log('📤 [useUsers-Mobile] Datos sanitizados para envío:', sanitizedData);
      const response = await userService.create(sanitizedData);

      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al crear usuario');
      }

      Alert.alert(
        'Éxito',
        'Usuario creado correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al crear usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, handleError]);

  // Actualizar usuario
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      console.log(`📝 [useUsers-Mobile] Actualizando usuario ${id}:`, userData);
      
      // Sanitizar datos
      const sanitizedData = {
        name: userData.name?.trim(),
        email: userData.email?.trim().toLowerCase(),
        phoneNumber: userData.phoneNumber?.trim() || userData.phone?.trim(),
        role: userData.role || 'customer'
      };

      // Validaciones básicas
      if (!sanitizedData.name) {
        throw new Error('El nombre es obligatorio');
      }
      if (!sanitizedData.email) {
        throw new Error('El email es obligatorio');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedData.email)) {
        throw new Error('El email no tiene un formato válido');
      }

      console.log('📝 [useUsers-Mobile] Datos sanitizados para envío:', sanitizedData);
      const response = await userService.update(id, sanitizedData);

      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al actualizar usuario');
      }

      Alert.alert(
        'Éxito',
        'Usuario actualizado correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, handleError]);

  // Actualizar estado del usuario (activo/inactivo)
  const updateUserStatus = useCallback(async (id, active) => {
    try {
      setLoading(true);
      console.log(`🔄 [useUsers-Mobile] Actualizando estado del usuario ${id} a:`, active);
      
      const response = await userService.updateStatus(id, active);
      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al actualizar estado del usuario');
      }

      const statusText = active ? 'activado' : 'desactivado';
      Alert.alert(
        'Éxito',
        `Usuario ${statusText} correctamente`,
        [{ text: 'OK', style: 'default' }]
      );

      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar estado del usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, handleError]);

  // Cambiar contraseña
  const changePassword = useCallback(async (id, passwordData) => {
    try {
      setLoading(true);
      console.log(`🔐 [useUsers-Mobile] Cambiando contraseña del usuario ${id}`);
      
      // Validaciones básicas
      if (!passwordData.newPassword) {
        throw new Error('La nueva contraseña es obligatoria');
      }
      if (passwordData.newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const response = await userService.changePassword(id, passwordData);
      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al cambiar contraseña');
      }

      Alert.alert(
        'Éxito',
        'Contraseña cambiada correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al cambiar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Eliminar usuario (soft delete)
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      console.log(`🗑️ [useUsers-Mobile] Eliminando usuario ${id}`);
      
      const response = await userService.delete(id);
      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al eliminar usuario');
      }

      Alert.alert(
        'Éxito',
        'Usuario eliminado correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, handleError]);

  // Eliminar usuario permanentemente (hard delete)
  const hardDeleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      console.log(`🗑️ [useUsers-Mobile] Eliminando usuario permanentemente ${id}`);
      
      const response = await userService.hardDelete(id);
      console.log('🔍 [useUsers-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al eliminar usuario permanentemente');
      }

      Alert.alert(
        'Éxito',
        'Usuario eliminado permanentemente',
        [{ text: 'OK', style: 'default' }]
      );

      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar usuario permanentemente');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, handleError]);

  // ==================== ESTADÍSTICAS ====================

  // Obtener estadísticas de usuarios
  const getUserStats = useCallback(() => {
    const total = users.length;
    const active = users.filter(user => user.status === 'active' || user.active === true).length;
    const inactive = users.filter(user => user.status === 'inactive' || user.active === false).length;
    const admins = users.filter(user => user.role === 'admin').length;
    const customers = users.filter(user => user.role === 'customer').length;
    const premium = users.filter(user => user.role === 'premium').length;

    return {
      total,
      active,
      inactive,
      admins,
      customers,
      premium
    };
  }, [users]);

  // ==================== EFECTOS ====================

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==================== RETORNO ====================

  return {
    // Estados
    users,
    loading,
    error,

    // Operaciones CRUD
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    changePassword,
    deleteUser,
    hardDeleteUser,

    // Estadísticas
    getUserStats,

    // Utilidades
    formatUser
  };
};

export default useUsers;
