// src/components/CreateUserModal/CreateUserModal.jsx
import React, { useState } from 'react';
import { 
  User, 
  EnvelopeSimple, 
  Phone, 
  Lock, 
  Shield,
  Crown,
  Eye,
  EyeSlash,
  Check,
  X,
  Warning
} from '@phosphor-icons/react';
import './CreateUserModal.css';

const CreateUserModal = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active',
    permissions: []
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'user', label: 'Usuario', icon: <User size={16} weight="duotone" />, description: 'Acceso básico al sistema' },
    { value: 'admin', label: 'Administrador', icon: <Crown size={16} weight="duotone" />, description: 'Control total del sistema' }
  ];

  const permissionsByRole = {
    user: ['catalog'],
    moderator: ['catalog', 'orders'],
    admin: ['catalog', 'orders', 'users', 'reports', 'settings']
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar errores cuando el usuario corrige
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Actualizar permisos automáticamente cuando cambia el rol
    if (field === 'role') {
      setFormData(prev => ({
        ...prev,
        permissions: permissionsByRole[value] || []
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validación teléfono
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    // Validación contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validación confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.icon : <User size={16} weight="duotone" />;
  };

  return (
    <div className="create-user-modal">
      <form onSubmit={handleSubmit} className="create-user-form">
        
        {/* Información Personal */}
        <div className="create-user-section">
          <h3 className="create-user-section-title">
            <User size={18} weight="duotone" />
            Información Personal
          </h3>

          <div className="create-user-field">
            <label className="create-user-label">
              <User size={14} weight="duotone" />
              Nombre completo *
            </label>
            <input
              type="text"
              className={`create-user-input ${errors.name ? 'create-user-input--error' : ''}`}
              placeholder="Nombre del usuario"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            {errors.name && (
              <span className="create-user-error">
                <Warning size={12} weight="duotone" />
                {errors.name}
              </span>
            )}
          </div>

          <div className="create-user-field">
            <label className="create-user-label">
              <EnvelopeSimple size={14} weight="duotone" />
              Correo electrónico *
            </label>
            <input
              type="email"
              className={`create-user-input ${errors.email ? 'create-user-input--error' : ''}`}
              placeholder="usuario@diambars.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {errors.email && (
              <span className="create-user-error">
                <Warning size={12} weight="duotone" />
                {errors.email}
              </span>
            )}
          </div>

          <div className="create-user-field">
            <label className="create-user-label">
              <Phone size={14} weight="duotone" />
              Teléfono
            </label>
            <input
              type="tel"
              className={`create-user-input ${errors.phone ? 'create-user-input--error' : ''}`}
              placeholder="+503 1234-5678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            {errors.phone && (
              <span className="create-user-error">
                <Warning size={12} weight="duotone" />
                {errors.phone}
              </span>
            )}
          </div>
        </div>

        {/* Credenciales */}
        <div className="create-user-section">
          <h3 className="create-user-section-title">
            <Lock size={18} weight="duotone" />
            Credenciales de Acceso
          </h3>

          <div className="create-user-field">
            <label className="create-user-label">
              <Lock size={14} weight="duotone" />
              Contraseña *
            </label>
            <div className="create-user-password-field">
              <input
                type={showPassword ? "text" : "password"}
                className={`create-user-input ${errors.password ? 'create-user-input--error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="create-user-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="create-user-error">
                <Warning size={12} weight="duotone" />
                {errors.password}
              </span>
            )}
          </div>

          <div className="create-user-field">
            <label className="create-user-label">
              <Lock size={14} weight="duotone" />
              Confirmar contraseña *
            </label>
            <div className="create-user-password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`create-user-input ${errors.confirmPassword ? 'create-user-input--error' : ''}`}
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <button
                type="button"
                className="create-user-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="create-user-error">
                <Warning size={12} weight="duotone" />
                {errors.confirmPassword}
              </span>
            )}
          </div>
        </div>

        {/* Rol y Permisos */}
        <div className="create-user-section">
          <h3 className="create-user-section-title">
            <Shield size={18} weight="duotone" />
            Rol y Permisos
          </h3>

          <div className="create-user-field">
            <label className="create-user-label">Rol del usuario</label>
            <div className="create-user-role-options">
              {roleOptions.map(role => (
                <label
                  key={role.value}
                  className={`create-user-role-option ${formData.role === role.value ? 'create-user-role-option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="create-user-role-radio"
                  />
                  <div className="create-user-role-content">
                    <div className="create-user-role-header">
                      {role.icon}
                      <span className="create-user-role-name">{role.label}</span>
                    </div>
                    <span className="create-user-role-description">{role.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="create-user-field">
            <label className="create-user-label">Estado inicial</label>
            <select
              className="create-user-select"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Permisos Preview */}
          {formData.permissions.length > 0 && (
            <div className="create-user-permissions-preview">
              <span className="create-user-permissions-label">Permisos asignados:</span>
              <div className="create-user-permissions-list">
                {formData.permissions.map((permission, index) => (
                  <span key={index} className="create-user-permission-tag">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="create-user-actions">
          <button
            type="button"
            className="create-user-btn create-user-btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X size={16} weight="duotone" />
            Cancelar
          </button>
          
          <button
            type="submit"
            className="create-user-btn create-user-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="create-user-spinner"></div>
                Creando...
              </>
            ) : (
              <>
                <Check size={16} weight="duotone" />
                Crear Usuario
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateUserModal;