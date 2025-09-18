// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  EnvelopeSimple, 
  Phone, 
  Calendar,
  PencilSimple,
  Check,
  X,
  Eye,
  EyeSlash,
  Lock,
  Shield,
  Camera,
  MapPin,
  Briefcase
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profileService';
import Swal from 'sweetalert2';
import './Profile.css';

const Profile = () => {
  const { user, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Estados para edición de perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    bio: '',
    role: '',
    hireDate: '',
    dui: ''
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user || !user.id) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const response = await ProfileService.getUserProfile(user.id);
      
      if (response.success) {
        const userData = response.data;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          position: getRoleDisplayName(userData.role) || 'Empleado',
          location: userData.address || 'No especificado',
          bio: userData.bio || `${getRoleDisplayName(userData.role)} en DIAMBARS Sublimado`,
          role: userData.role || 'employee',
          hireDate: userData.hireDate ? new Date(userData.hireDate).toLocaleDateString() : '',
          dui: userData.dui || 'No especificado'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del perfil',
          confirmButtonColor: '#040DBF'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al cargar el perfil',
        confirmButtonColor: '#040DBF'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Función para obtener el nombre del rol en español
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'employee': 'Empleado',
      'delivery': 'Repartidor',
      'production': 'Producción'
    };
    return roleNames[role?.toLowerCase()] || 'Empleado';
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Validaciones básicas
      if (!profileData.name.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'El nombre es obligatorio',
          confirmButtonColor: '#040DBF'
        });
        return;
      }

      if (!profileData.email.trim() || !profileData.email.includes('@')) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Ingresa un email válido',
          confirmButtonColor: '#040DBF'
        });
        return;
      }

      // Llamada a la API
      const response = await ProfileService.updateUserProfile(user.id, profileData);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Los cambios se han guardado exitosamente',
          confirmButtonColor: '#040DBF',
          timer: 2000,
          showConfirmButton: false
        });

        setIsEditing(false);
        
        // Refrescar autenticación si es necesario
        if (refreshAuth) {
          await refreshAuth();
        }
        
        // Recargar datos del perfil
        await loadUserProfile();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.error || 'No se pudo actualizar el perfil',
          confirmButtonColor: '#040DBF'
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        confirmButtonColor: '#040DBF'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      // Validaciones
      if (!passwordData.currentPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ingresa tu contraseña actual',
          confirmButtonColor: '#040DBF'
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La nueva contraseña debe tener al menos 6 caracteres',
          confirmButtonColor: '#040DBF'
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Las contraseñas no coinciden',
          confirmButtonColor: '#040DBF'
        });
        return;
      }

      // Llamada a la API
      const response = await ProfileService.changePassword(user.id, passwordData);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada',
          text: 'Tu contraseña se ha actualizado exitosamente',
          confirmButtonColor: '#040DBF',
          timer: 2000,
          showConfirmButton: false
        });

        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.error || 'No se pudo cambiar la contraseña',
          confirmButtonColor: '#040DBF'
        });
      }

    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
        confirmButtonColor: '#040DBF'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Recargar datos originales
    loadUserProfile();
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  // Mostrar loading mientras carga el perfil
  if (profileLoading) {
    return (
      <div className="profile-admin-page">
        <div className="profile-admin-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px',
            color: '#64748b'
          }}>
            Cargando perfil...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-admin-page">
      <div className="profile-admin-container">
        
        {/* Header */}
        <div className="profile-admin-header">
          <div className="profile-admin-header-content">
            <h1 className="profile-admin-title">Mi Perfil</h1>
            <p className="profile-admin-subtitle">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
        </div>

        <div className="profile-admin-content">
          
          {/* Card de Avatar y Info Principal */}
          <div className="profile-admin-card profile-admin-card--main">
            <div className="profile-admin-avatar-section">
              <div className="profile-admin-avatar">
                <div className="profile-admin-avatar-circle">
                  <span className="profile-admin-avatar-text">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <div className="profile-admin-avatar-status"></div>
                </div>
                <button className="profile-admin-avatar-upload">
                  <Camera size={16} weight="duotone" />
                  <span>Cambiar foto</span>
                </button>
              </div>
              
              <div className="profile-admin-main-info">
                <h2 className="profile-admin-name">{profileData.name || 'Nombre del Usuario'}</h2>
                <p className="profile-admin-role">{profileData.position}</p>
                <div className="profile-admin-badges">
                  <span className={`profile-admin-badge ${
                    profileData.role === 'admin' ? 'profile-admin-badge--admin' : 'profile-admin-badge--active'
                  }`}>
                    <Shield size={14} weight="duotone" />
                    {profileData.position}
                  </span>
                  <span className="profile-admin-badge profile-admin-badge--active">
                    <span className="profile-admin-status-dot"></span>
                    En línea
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-admin-grid">
            
            {/* Card de Información Personal */}
            <div className="profile-admin-card">
              <div className="profile-admin-card-header">
                <h3 className="profile-admin-card-title">
                  <User size={20} weight="duotone" />
                  Información Personal
                </h3>
                {!isEditing && (
                  <button 
                    className="profile-admin-edit-btn"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <PencilSimple size={16} weight="duotone" />
                    Editar
                  </button>
                )}
              </div>

              <div className="profile-admin-card-body">
                {isEditing ? (
                  <div className="profile-admin-form">
                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <User size={16} weight="duotone" />
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        className="profile-admin-input"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Tu nombre completo"
                        disabled={loading}
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <EnvelopeSimple size={16} weight="duotone" />
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="profile-admin-input"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        disabled={loading}
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <Phone size={16} weight="duotone" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="profile-admin-input"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="+503 1234-5678"
                        disabled={loading}
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <MapPin size={16} weight="duotone" />
                        Dirección
                      </label>
                      <input
                        type="text"
                        className="profile-admin-input"
                        value={profileData.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="Tu dirección"
                        disabled={loading}
                      />
                    </div>

                    <div className="profile-admin-actions">
                      <button 
                        className="profile-admin-btn profile-admin-btn--primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <Check size={16} weight="duotone" />
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button 
                        className="profile-admin-btn profile-admin-btn--secondary"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <X size={16} weight="duotone" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-admin-info-display">
                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <User size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Nombre</span>
                        <span className="profile-admin-info-value">{profileData.name}</span>
                      </div>
                    </div>

                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <EnvelopeSimple size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Email</span>
                        <span className="profile-admin-info-value">{profileData.email}</span>
                      </div>
                    </div>

                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <Phone size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Teléfono</span>
                        <span className="profile-admin-info-value">{profileData.phone || 'No especificado'}</span>
                      </div>
                    </div>

                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <Briefcase size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Cargo</span>
                        <span className="profile-admin-info-value">{profileData.position}</span>
                      </div>
                    </div>

                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <MapPin size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Dirección</span>
                        <span className="profile-admin-info-value">{profileData.location}</span>
                      </div>
                    </div>

                    <div className="profile-admin-info-item">
                      <span className="profile-admin-info-icon">
                        <Calendar size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-info-content">
                        <span className="profile-admin-info-label">Fecha de contratación</span>
                        <span className="profile-admin-info-value">{profileData.hireDate}</span>
                      </div>
                    </div>

                    {profileData.dui !== 'No especificado' && (
                      <div className="profile-admin-info-item">
                        <span className="profile-admin-info-icon">
                          <User size={16} weight="duotone" />
                        </span>
                        <div className="profile-admin-info-content">
                          <span className="profile-admin-info-label">DUI</span>
                          <span className="profile-admin-info-value">{profileData.dui}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card de Seguridad */}
            <div className="profile-admin-card">
              <div className="profile-admin-card-header">
                <h3 className="profile-admin-card-title">
                  <Lock size={20} weight="duotone" />
                  Seguridad
                </h3>
                {!isChangingPassword && (
                  <button 
                    className="profile-admin-edit-btn"
                    onClick={() => setIsChangingPassword(true)}
                    disabled={loading}
                  >
                    <PencilSimple size={16} weight="duotone" />
                    Cambiar contraseña
                  </button>
                )}
              </div>

              <div className="profile-admin-card-body">
                {isChangingPassword ? (
                  <div className="profile-admin-form">
                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <Lock size={16} weight="duotone" />
                        Contraseña actual
                      </label>
                      <div className="profile-admin-password-input">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="profile-admin-input"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          placeholder="Tu contraseña actual"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={loading}
                        >
                          {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <Lock size={16} weight="duotone" />
                        Nueva contraseña
                      </label>
                      <div className="profile-admin-password-input">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="profile-admin-input"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          placeholder="Nueva contraseña (min. 6 caracteres)"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={loading}
                        >
                          {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <Lock size={16} weight="duotone" />
                        Confirmar nueva contraseña
                      </label>
                      <div className="profile-admin-password-input">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="profile-admin-input"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          placeholder="Confirma tu nueva contraseña"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-admin-actions">
                      <button 
                        className="profile-admin-btn profile-admin-btn--primary"
                        onClick={handleChangePassword}
                        disabled={loading}
                      >
                        <Check size={16} weight="duotone" />
                        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                      </button>
                      <button 
                        className="profile-admin-btn profile-admin-btn--secondary"
                        onClick={handleCancelPasswordChange}
                        disabled={loading}
                      >
                        <X size={16} weight="duotone" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-admin-security-info">
                    <div className="profile-admin-security-item">
                      <span className="profile-admin-security-icon">
                        <Lock size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-security-content">
                        <span className="profile-admin-security-label">Contraseña</span>
                        <span className="profile-admin-security-value">••••••••</span>
                      </div>
                      <span className="profile-admin-security-status profile-admin-security-status--good">
                        Segura
                      </span>
                    </div>

                    <div className="profile-admin-security-item">
                      <span className="profile-admin-security-icon">
                        <Shield size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-security-content">
                        <span className="profile-admin-security-label">Rol</span>
                        <span className="profile-admin-security-value">{profileData.position}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;