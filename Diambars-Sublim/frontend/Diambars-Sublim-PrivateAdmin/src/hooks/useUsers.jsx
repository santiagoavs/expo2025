// src/hooks/useUsers.js
import { useCallback, useEffect, useState } from 'react';
import userService from '../api/userService';
import { toast } from 'react-hot-toast';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('Error:', { error, response: error.response, config: error.config });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear usuarios con campos faltantes
  const formatUser = (user) => {
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
    
    console.log('[formatUser] Usuario formateado:', {
      id: formattedUser.id,
      name: formattedUser.name,
      status: formattedUser.status,
      active: formattedUser.active
    });
    
    return formattedUser;
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      console.log("👉 Usuarios recibidos:", data);

      if (!Array.isArray(data)) {
        throw new Error("Formato de usuarios inválido");
      }

      const formattedUsers = data.map(formatUser);
      setUsers(formattedUsers);

    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
      setError(err.message || "Error al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const response = await userService.createUser(userData);
      toast.success('Usuario creado exitosamente');
      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al crear usuario');
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, userData) => {
    try {
      const response = await userService.updateUser(id, userData);
      toast.success('Usuario actualizado exitosamente');
      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar usuario');
    }
  }, [fetchUsers]);

  const updateUserStatus = useCallback(async (id, active) => {
    try {
      const response = await userService.updateUserStatus(id, active);
      const statusText = active ? 'activado' : 'desactivado';
      toast.success(`Usuario ${statusText} exitosamente`);
      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar estado del usuario');
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      const response = await userService.deleteUser(id);
      toast.success('Usuario eliminado exitosamente');
      await fetchUsers(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar usuario');
    }
  }, [fetchUsers]);

  const changePassword = useCallback(async (id, passwordData) => {
    try {
      const response = await userService.changePassword(id, passwordData);
      toast.success('Contraseña cambiada exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al cambiar contraseña');
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      const response = await userService.getUserById(id);
      return formatUser(response);
    } catch (error) {
      handleError(error, 'Error al obtener usuario');
    }
  }, []);

  const updateOwnProfile = useCallback(async (userData) => {
    try {
      const response = await userService.updateOwnProfile(userData);
      toast.success('Perfil actualizado exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar perfil');
    }
  }, []);

  // Funciones de wishlist
  const getUserWishlist = useCallback(async (id) => {
    try {
      const response = await userService.getUserWishlist(id);
      return response;
    } catch (error) {
      handleError(error, 'Error al obtener wishlist');
    }
  }, []);

  const addToWishlist = useCallback(async (id, productId) => {
    try {
      const response = await userService.addToWishlist(id, productId);
      toast.success('Producto añadido a wishlist');
      return response;
    } catch (error) {
      handleError(error, 'Error al añadir a wishlist');
    }
  }, []);

  const removeFromWishlist = useCallback(async (id, productId) => {
    try {
      const response = await userService.removeFromWishlist(id, productId);
      toast.success('Producto removido de wishlist');
      return response;
    } catch (error) {
      handleError(error, 'Error al remover de wishlist');
    }
  }, []);

  // Funciones de direcciones
  const getUserAddresses = useCallback(async (id) => {
    try {
      const response = await userService.getUserAddresses(id);
      return response;
    } catch (error) {
      handleError(error, 'Error al obtener direcciones');
    }
  }, []);

  const setDefaultAddress = useCallback(async (id, addressId) => {
    try {
      const response = await userService.setDefaultAddress(id, addressId);
      toast.success('Dirección predeterminada actualizada');
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar dirección predeterminada');
    }
  }, []);

  // Funciones de estadísticas
  const getUserStats = useCallback(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const premium = users.filter(u => u.role === 'premium').length;
    const customers = users.filter(u => u.role === 'customer').length;
    const inactive = users.filter(u => u.status === 'inactive').length;

    return { total, active, admins, premium, customers, inactive };
  }, [users]);

  // Cargar usuarios al inicializar
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    changePassword,
    getUserById,
    updateOwnProfile,
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    getUserAddresses,
    setDefaultAddress,
    getUserStats
  };
};

export default useUsers;