// src/components/EmployeeModal/CreateEmployeeModal.jsx
import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  Eye, 
  EyeSlash,
  Calendar,
  MapPin,
  Phone,
  Envelope,
  IdentificationCard,
  Shield,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';
import './EmployeeModal.css';

const CreateEmployeeModal = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dui: '',
    address: '',
    birthday: '',
    hireDate: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: 'employee', label: 'Empleado', icon: '👤' },
    { value: 'manager', label: 'Gerente', icon: '👔' },
    { value: 'admin', label: 'Administrador', icon: '👑' },
    { value: 'delivery', label: 'Repartidor', icon: '🚚' },
    { value: 'production', label: 'Producción', icon: '🏭' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'El teléfono es requerido';
    if (!formData.dui.trim()) newErrors.dui = 'El DUI es requerido';
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!formData.birthday) newErrors.birthday = 'La fecha de nacimiento es requerida';
    if (!formData.hireDate) newErrors.hireDate = 'La fecha de contratación es requerida';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma la contraseña';

    // Validaciones específicas
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.phoneNumber && !/^[0-9]{8,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El teléfono debe contener entre 8 y 15 dígitos';
    }

    if (formData.dui && !/^[0-9]{8}-[0-9]{1}$/.test(formData.dui)) {
      newErrors.dui = 'El DUI debe tener el formato 12345678-9';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar fechas
    if (formData.birthday && formData.hireDate) {
      const birthday = new Date(formData.birthday);
      const hireDate = new Date(formData.hireDate);
      const today = new Date();

      if (birthday >= today) {
        newErrors.birthday = 'La fecha de nacimiento debe ser anterior a hoy';
      }

      if (hireDate > today) {
        newErrors.hireDate = 'La fecha de contratación no puede ser futura';
      }

      if (birthday >= hireDate) {
        newErrors.hireDate = 'La fecha de contratación debe ser posterior al nacimiento';
      }
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
      // Preparar datos para envío
      const employeeData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        dui: formData.dui.trim(),
        address: formData.address.trim(),
        birthday: formData.birthday,
        hireDate: formData.hireDate,
        password: formData.password,
        role: formData.role,
        active: true
      };

      await onSubmit(employeeData);
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDui = (value) => {
    // Formatear DUI mientras se escribe
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers;
    } else if (numbers.length === 9) {
      return `${numbers.slice(0, 8)}-${numbers.slice(8)}`;
    }
    return value;
  };

  return (
    <div className="employee-modal">
      <div className="employee-modal__header">
        <div className="employee-modal__title">
          <UserPlus size={24} weight="duotone" />
          <h3>Crear Nuevo Empleado</h3>
        </div>
        <button 
          className="employee-modal__close"
          onClick={onCancel}
          type="button"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-modal__form">
        <div className="employee-modal__grid">
          {/* Información Personal */}
          <div className="employee-modal__section">
            <h4 className="employee-modal__section-title">
              <UserPlus size={18} weight="duotone" />
              Información Personal
            </h4>
            
            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Nombre Completo *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.name ? 'employee-modal__input--error' : ''}`}
                  placeholder="Ej: Juan Pérez"
                />
                {errors.name && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.name}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                <Envelope size={16} weight="duotone" />
                Correo Electrónico *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.email ? 'employee-modal__input--error' : ''}`}
                  placeholder="juan.perez@empresa.com"
                />
                {errors.email && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                <Phone size={16} weight="duotone" />
                Teléfono *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.phoneNumber ? 'employee-modal__input--error' : ''}`}
                  placeholder="7777-7777"
                />
                {errors.phoneNumber && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.phoneNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                <IdentificationCard size={16} weight="duotone" />
                DUI *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="text"
                  name="dui"
                  value={formData.dui}
                  onChange={(e) => {
                    const formatted = formatDui(e.target.value);
                    setFormData(prev => ({ ...prev, dui: formatted }));
                  }}
                  className={`employee-modal__input ${errors.dui ? 'employee-modal__input--error' : ''}`}
                  placeholder="12345678-9"
                  maxLength="10"
                />
                {errors.dui && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.dui}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                <MapPin size={16} weight="duotone" />
                Dirección *
              </label>
              <div className="employee-modal__input-group">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`employee-modal__input employee-modal__textarea ${errors.address ? 'employee-modal__input--error' : ''}`}
                  placeholder="Dirección completa del empleado"
                  rows="3"
                />
                {errors.address && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fechas y Contraseña */}
          <div className="employee-modal__section">
            <h4 className="employee-modal__section-title">
              <Calendar size={18} weight="duotone" />
              Fechas y Seguridad
            </h4>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Fecha de Nacimiento *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.birthday ? 'employee-modal__input--error' : ''}`}
                />
                {errors.birthday && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.birthday}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Fecha de Contratación *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.hireDate ? 'employee-modal__input--error' : ''}`}
                />
                {errors.hireDate && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.hireDate}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Contraseña *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.password ? 'employee-modal__input--error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="employee-modal__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Confirmar Contraseña *
              </label>
              <div className="employee-modal__input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`employee-modal__input ${errors.confirmPassword ? 'employee-modal__input--error' : ''}`}
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="employee-modal__password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
                {errors.confirmPassword && (
                  <div className="employee-modal__error">
                    <Warning size={16} weight="fill" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rol */}
          <div className="employee-modal__section">
            <h4 className="employee-modal__section-title">
              <Shield size={18} weight="duotone" />
              Rol y Permisos
            </h4>

            <div className="employee-modal__field">
              <label className="employee-modal__label">
                Selecciona el Rol *
              </label>
              <div className="employee-modal__role-grid">
                {roles.map(role => (
                  <label key={role.value} className="employee-modal__role-option">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleInputChange}
                      className="employee-modal__role-input"
                    />
                    <div className="employee-modal__role-card">
                      <span className="employee-modal__role-icon">{role.icon}</span>
                      <span className="employee-modal__role-label">{role.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="employee-modal__actions">
          <button
            type="button"
            className="employee-modal__btn employee-modal__btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="employee-modal__btn employee-modal__btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="employee-modal__spinner"></div>
                Creando...
              </>
            ) : (
              <>
                <CheckCircle size={16} weight="duotone" />
                Crear Empleado
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployeeModal;
