// src/components/profile/UserInfo.jsx
import { useState, useEffect } from 'react';
import './UserInfo.css';
import { useAuth } from '../../context/authContext';
import { updateUserProfile } from '../../api/updateProfileService';
import { resendVerificationEmail } from '../../api/resendVerificatonService';
import Swal from 'sweetalert2';

function UserInfo() {
  const { user, login, logout } = useAuth();
  
  console.log('UserInfo renderizado, user:', user);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar los datos del usuario cuando el componente se monta o cuando user cambia
  useEffect(() => {
    if (user) {
      console.log('Usuario completo en useEffect:', user);
      
      // Compatibilidad: usar phoneNumber o phone según lo que esté disponible
      const phoneValue = user.phoneNumber || user.phone || '';
      
      const userData = {
        name: user.name || '',
        phoneNumber: phoneValue,
        email: user.email || ''
      };
      
      console.log('Datos del usuario cargados:', userData);
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
      newErrors.email = 'Por favor ingrese un correo electrónico válido';
    }

    // Validar teléfono (opcional, pero si se proporciona debe ser válido)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^[0-9]{8}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = 'El teléfono debe contener exactamente 8 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error específico cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Formatear número de teléfono para mostrar
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    // Solo mostrar los 8 dígitos, el +503 se muestra en el placeholder
    return phoneNumber.replace(/^(\+503)?/, '');
  };

  // Verificar si hay cambios
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSave = async () => {
    // Limpiar errores previos
    setErrors({});
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Verificar si hay cambios
    if (!hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No hay cambios para guardar',
        confirmButtonColor: '#2d788e',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Guardando datos:', formData);
      
      // Determinar si el email cambió para la verificación automática
      const emailChanged = formData.email !== originalData.email;
      
      // Preparar datos para enviar - usar phoneNumber para el backend
      const updateData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : '',
        email: formData.email.toLowerCase().trim()
      };

      console.log('Datos a enviar al backend:', updateData);

      // Actualizar perfil usando la ruta /users/profile
      const response = await updateUserProfile(null, updateData, originalData.email);
      
      console.log('Respuesta del servidor:', response);
      
      // El backend devuelve el usuario actualizado en response.user
      const updatedUserFromResponse = response.user || response;
      
      // Crear el usuario actualizado para el contexto, asegurando compatibilidad
      const updatedUser = {
        ...user,
        ...updatedUserFromResponse,
        // Asegurar que tanto phone como phoneNumber estén disponibles
        phone: updatedUserFromResponse.phoneNumber || updatedUserFromResponse.phone,
        phoneNumber: updatedUserFromResponse.phoneNumber || updatedUserFromResponse.phone
      };

      console.log('Usuario actualizado para contexto:', updatedUser);

      // Actualizar el contexto con los nuevos datos
      login(updatedUser);
      setOriginalData(formData);
      
      // Mostrar mensaje apropiado
      if (emailChanged) {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Perfil actualizado correctamente. Se ha enviado un correo de verificación a tu nueva dirección.',
          confirmButtonColor: '#2d788e',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Perfil actualizado correctamente',
          confirmButtonColor: '#2d788e',
          confirmButtonText: 'OK'
        });
      }
      
    } catch (error) {
      console.error('Error al guardar datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar el perfil',
        confirmButtonColor: '#2d788e',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar verificación manualmente
  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await resendVerificationEmail(user.email);
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Correo de verificación enviado correctamente',
        confirmButtonColor: '#2d788e',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al enviar el correo de verificación',
        confirmButtonColor: '#2d788e',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Si no hay usuario logueado, mostrar un mensaje o redirigir
  if (!user) {
    return (
      <div className="user-info-container">
        <p>No hay usuario logueado</p>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      <div className="profile-picture-section">
        <img src="/images/profile/defaultPfp.png" alt="Foto de perfil" className="profile-image" />
        <div className="add-photo">↘ Añadir foto de perfil</div>
      </div>

      <div className="info-section">
        <div className="info-header">
          <h3>Tu información personal</h3>
          <a className='change-password-link' href="/changePassword">Cambiar contraseña</a>
        </div>

        <div className="info-grid">
          <div className="input-group-info">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`underline-input ${errors.name ? 'error' : ''}`}
              placeholder="Nombre"
              disabled={isLoading}
            />
            {errors.name && <span className="error-text-info">{errors.name}</span>}
          </div>

          <div className="input-group-info">
            <input
              type="text"
              value={formatPhoneNumber(formData.phoneNumber)}
              onChange={(e) => {
                // Solo permitir números y máximo 8 dígitos
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                handleInputChange('phoneNumber', value);
              }}
              className={`underline-input ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="+503 Número de teléfono (opcional)"
              disabled={isLoading}
            />
            {errors.phoneNumber && <span className="error-text-info">{errors.phoneNumber}</span>}
          </div>

          <div className="input-group-info">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`underline-input ${errors.email ? 'error' : ''}`}
              placeholder="Correo electrónico"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text-info">{errors.email}</span>}
          </div>

          <div className="input-group-info password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value="••••••••"
              className="underline-input"
              placeholder="Contraseña"
              disabled
              readOnly
            />
            <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">👁️</span>
          </div>
        </div>
        
        <div className="email-status-row">
          <div className="email-verification-status">
            {/* Verificación de estado de email con múltiples campos posibles */}
            {console.log('Usuario completo para verificación:', {
              verified: user.verified,
              isVerified: user.isVerified,
              emailVerified: user.emailVerified
            })}
            {(user.verified === true || user.isVerified === true || user.emailVerified === true) ? (
              <p className="email-verified">
                Correo verificado <span className="green-dot">●</span>
              </p>
            ) : (
              <div className="email-not-verified">
                <p className="email-warning">
                  Correo no verificado <span className="red-dot">●</span>
                </p>
                <button 
                  onClick={handleResendVerification} 
                  className="resend-verification-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Reenviar verificación'}
                </button>
              </div>
            )}
          </div>
          <button className="logout-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <button 
          type="submit" 
          className={`save-button ${!hasChanges() ? 'disabled' : ''}`}
          onClick={handleSave}
          disabled={isLoading || !hasChanges()}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

export default UserInfo;