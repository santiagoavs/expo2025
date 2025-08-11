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
import Swal from 'sweetalert2';
import './Profile.css';

const Profile = () => {
  const { user, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para edición de perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    bio: ''
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || 'Administrador',
        location: user.location || 'San Salvador, El Salvador',
        bio: user.bio || 'Administrador del sistema DIAMBARS Sublimado'
      });
    }
  }, [user]);

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

      // Aquí harías la llamada a tu API para actualizar el perfil
      // const response = await updateUserProfile(profileData);

      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));

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

    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleChangePassword = async () => {
    try {
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

      // Aquí harías la llamada a tu API para cambiar la contraseña
      // const response = await changePassword(passwordData);

      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));

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

    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleCancelEdit = () => {
    // Restaurar datos originales
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || 'Administrador',
        location: user.location || 'San Salvador, El Salvador',
        bio: user.bio || 'Administrador del sistema DIAMBARS Sublimado'
      });
    }
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
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'A'}
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
                  <span className="profile-admin-badge profile-admin-badge--admin">
                    <Shield size={14} weight="duotone" />
                    Administrador
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
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <Briefcase size={16} weight="duotone" />
                        Cargo
                      </label>
                      <input
                        type="text"
                        className="profile-admin-input"
                        value={profileData.position}
                        onChange={(e) => handleProfileChange('position', e.target.value)}
                        placeholder="Tu cargo en la empresa"
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        <MapPin size={16} weight="duotone" />
                        Ubicación
                      </label>
                      <input
                        type="text"
                        className="profile-admin-input"
                        value={profileData.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="Tu ubicación"
                      />
                    </div>

                    <div className="profile-admin-field">
                      <label className="profile-admin-label">
                        Biografía
                      </label>
                      <textarea
                        className="profile-admin-textarea"
                        value={profileData.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        placeholder="Escribe una breve descripción sobre ti..."
                        rows="3"
                      />
                    </div>

                    <div className="profile-admin-actions">
                      <button 
                        className="profile-admin-btn profile-admin-btn--primary"
                        onClick={handleSaveProfile}
                      >
                        <Check size={16} weight="duotone" />
                        Guardar cambios
                      </button>
                      <button 
                        className="profile-admin-btn profile-admin-btn--secondary"
                        onClick={handleCancelEdit}
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
                        <span className="profile-admin-info-label">Ubicación</span>
                        <span className="profile-admin-info-value">{profileData.location}</span>
                      </div>
                    </div>

                    {profileData.bio && (
                      <div className="profile-admin-bio">
                        <span className="profile-admin-info-label">Biografía</span>
                        <p className="profile-admin-bio-text">{profileData.bio}</p>
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
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
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
                        />
                        <button
                          type="button"
                          className="profile-admin-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-admin-actions">
                      <button 
                        className="profile-admin-btn profile-admin-btn--primary"
                        onClick={handleChangePassword}
                      >
                        <Check size={16} weight="duotone" />
                        Cambiar contraseña
                      </button>
                      <button 
                        className="profile-admin-btn profile-admin-btn--secondary"
                        onClick={handleCancelPasswordChange}
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
                        <Calendar size={16} weight="duotone" />
                      </span>
                      <div className="profile-admin-security-content">
                        <span className="profile-admin-security-label">Último cambio</span>
                        <span className="profile-admin-security-value">Hace 30 días</span>
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