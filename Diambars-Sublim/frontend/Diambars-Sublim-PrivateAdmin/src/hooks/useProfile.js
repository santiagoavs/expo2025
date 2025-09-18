// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import ProfileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar perfil del usuario
  const loadProfile = async (userId = null) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      setError('No se encontró ID de usuario');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await ProfileService.getUserProfile(targetUserId);
      
      if (response.success) {
        setProfileData(response.data);
      } else {
        setError(response.error || 'Error al cargar el perfil');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil
  const updateProfile = async (data, userId = null) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      throw new Error('No se encontró ID de usuario');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await ProfileService.updateUserProfile(targetUserId, data);
      
      if (response.success) {
        // Actualizar datos locales
        setProfileData(prev => ({
          ...prev,
          ...response.data.updated
        }));
        return response;
      } else {
        setError(response.error || 'Error al actualizar el perfil');
        throw new Error(response.error || 'Error al actualizar el perfil');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const changePassword = async (passwordData, userId = null) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      throw new Error('No se encontró ID de usuario');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await ProfileService.changePassword(targetUserId, passwordData);
      
      if (response.success) {
        return response;
      } else {
        setError(response.error || 'Error al cambiar la contraseña');
        throw new Error(response.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil automáticamente cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  return {
    profileData,
    loading,
    error,
    loadProfile,
    updateProfile,
    changePassword,
    setError
  };
};