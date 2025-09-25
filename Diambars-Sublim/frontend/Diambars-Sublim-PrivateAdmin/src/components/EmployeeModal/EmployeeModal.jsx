// src/components/EmployeeModal/EmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  User, 
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
  Warning,
  PencilSimple,
  Trash,
  Lock,
  LockOpen,
  Crown,
  Truck,
  Factory
} from '@phosphor-icons/react';
import useEmployees from '../../hooks/useEmployees';
import './EmployeeModal.css';

const EmployeeModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' | 'edit'
  employeeId = null,
  onSuccess 
}) => {
  const { 
    getEmployeeById, 
    createEmployee, 
    updateEmployee, 
    inactivateEmployee,
    hardDeleteEmployee,
    loading 
  } = useEmployees();

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
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const roles = [
    { value: 'employee', label: 'Empleado', icon: User },
    { value: 'manager', label: 'Gerente', icon: Crown },
    { value: 'delivery', label: 'Repartidor', icon: Truck },
    { value: 'production', label: 'Producción', icon: Factory }
  ];

  // Manejar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      
      // Bloquear scroll en body y html
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      
      return () => {
        // Restaurar el scroll cuando se cierre el modal
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.bottom = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Cargar datos del empleado si está en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && employeeId) {
      loadEmployeeData();
    } else if (isOpen && mode === 'create') {
      resetForm();
    }
  }, [isOpen, mode, employeeId]);

  const loadEmployeeData = async () => {
    setIsLoadingEmployee(true);
    try {
      const employee = await getEmployeeById(employeeId);
      if (employee) {
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          phoneNumber: employee.phoneNumber || employee.phone || '',
          dui: employee.dui || '',
          address: employee.address || '',
          birthday: employee.birthday ? new Date(employee.birthday).toISOString().split('T')[0] : '',
          hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
          password: '', // No cargar contraseña por seguridad
          confirmPassword: '',
          role: employee.role || 'employee'
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

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

    // Validación en tiempo real para campos específicos
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        if (value.trim() && value.trim().length < 2) {
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          errorMessage = 'El nombre solo puede contener letras y espacios';
        } else if (value.trim() && value.trim().includes('.')) {
          errorMessage = 'El nombre no puede contener puntos';
        }
        break;

      case 'email':
        if (value.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value.trim())) {
          errorMessage = 'El formato del email no es válido';
        } else if (value.trim() && value.trim().includes('..')) {
          errorMessage = 'El email no puede contener puntos consecutivos';
        }
        break;

      case 'phoneNumber':
        if (value.trim() && !/^[0-9]{8,15}$/.test(value.trim())) {
          errorMessage = 'El teléfono debe contener entre 8 y 15 dígitos numéricos';
        }
        break;

      case 'dui':
        if (value.trim() && !/^[0-9]{8}-[0-9]{1}$/.test(value.trim())) {
          errorMessage = 'El DUI debe tener el formato 12345678-9';
        }
        break;

      case 'address':
        if (value.trim() && value.trim().length < 5) {
          errorMessage = 'La dirección debe tener al menos 5 caracteres';
        }
        break;

      case 'password':
        if (value && value.length < 6) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (value && value.length > 50) {
          errorMessage = 'La contraseña no puede exceder 50 caracteres';
        }
        break;

      case 'confirmPassword':
        if (value && formData.password && value !== formData.password) {
          errorMessage = 'Las contraseñas no coinciden';
        }
        break;
    }

    // Solo actualizar el error si hay un mensaje o si se está limpiando
    if (errorMessage || !value.trim()) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas de campos requeridos
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    } else if (formData.name.trim().includes('.')) {
      newErrors.name = 'El nombre no puede contener puntos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email.trim())) {
      newErrors.email = 'El formato del email no es válido';
    } else if (formData.email.trim().includes('..')) {
      newErrors.email = 'El email no puede contener puntos consecutivos';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El teléfono es requerido';
    } else if (!/^[0-9]{8,15}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'El teléfono debe contener entre 8 y 15 dígitos numéricos';
    }

    if (!formData.dui.trim()) {
      newErrors.dui = 'El DUI es requerido';
    } else if (!/^[0-9]{8}-[0-9]{1}$/.test(formData.dui.trim())) {
      newErrors.dui = 'El DUI debe tener el formato 12345678-9';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'La dirección debe tener al menos 5 caracteres';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        newErrors.birthday = 'La fecha de nacimiento no puede ser futura';
      } else if (age < 16) {
        newErrors.birthday = 'El empleado debe ser mayor de 16 años';
      } else if (age > 80) {
        newErrors.birthday = 'La edad parece incorrecta';
      }
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'La fecha de contratación es requerida';
    } else {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();
      
      if (hireDate > today) {
        newErrors.hireDate = 'La fecha de contratación no puede ser futura';
      }
      
      if (formData.birthday) {
        const birthDate = new Date(formData.birthday);
        if (birthDate > hireDate) {
          newErrors.hireDate = 'La fecha de contratación debe ser posterior al nacimiento';
        }
      }
    }

    // Validaciones de contraseña
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      } else if (formData.password.length > 50) {
        newErrors.password = 'La contraseña no puede exceder 50 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password) {
      // Validar contraseña solo si se está cambiando en modo edición
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      } else if (formData.password.length > 50) {
        newErrors.password = 'La contraseña no puede exceder 50 caracteres';
      }

      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
        role: formData.role,
        active: true
      };

      // Solo incluir contraseña si se está creando o si se proporcionó una nueva
      if (mode === 'create' || formData.password) {
        employeeData.password = formData.password;
      }

      if (mode === 'create') {
        await createEmployee(employeeData);
      } else {
        await updateEmployee(employeeId, employeeData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al guardar el empleado';
      let errorTitle = 'Error';
      
      if (error.response?.status === 400) {
        errorTitle = 'Error de Validación';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Los datos ingresados no son válidos. Por favor, revisa los campos marcados.';
        }
      } else if (error.response?.status === 409) {
        errorTitle = 'Conflicto';
        errorMessage = 'Ya existe un empleado con este email o DUI.';
      } else if (error.response?.status === 500) {
        errorTitle = 'Error del Servidor';
        errorMessage = 'Error interno del servidor. Inténtalo de nuevo.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar alerta de error
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await hardDeleteEmployee(employeeId);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error deleting employee:', error);
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

  if (!isOpen) return null;

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal">
        <div className="employee-modal__header">
          <div className="employee-modal__title">
            {mode === 'create' ? (
              <>
                <UserPlus size={24} weight="duotone" />
                <h3>Crear Nuevo Empleado</h3>
              </>
            ) : (
              <>
                <PencilSimple size={24} weight="duotone" />
                <h3>Editar Empleado</h3>
              </>
            )}
          </div>
          <button 
            className="employee-modal__close"
            onClick={onClose}
            type="button"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {isLoadingEmployee ? (
          <div className="employee-modal__loading">
            <div className="employee-modal__spinner"></div>
            <span>Cargando datos del empleado...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="employee-modal__form">
            <div className="employee-modal__grid">
              {/* Información Personal */}
              <div className="employee-modal__section">
                <h4 className="employee-modal__section-title">
                  <User size={18} weight="duotone" />
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

                {/* Contraseña - Solo mostrar en creación o si se quiere cambiar */}
                <div className="employee-modal__field">
                  <label className="employee-modal__label">
                    {mode === 'create' ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
                  </label>
                  <div className="employee-modal__input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`employee-modal__input ${errors.password ? 'employee-modal__input--error' : ''}`}
                      placeholder={mode === 'create' ? 'Mínimo 6 caracteres' : 'Dejar vacío para mantener la actual'}
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

                {/* Confirmar contraseña solo si se está creando o cambiando contraseña */}
                {(mode === 'create' || formData.password) && (
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
                )}
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
                    {roles.map(role => {
                      const IconComponent = role.icon;
                      return (
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
                            <IconComponent size={24} weight="duotone" className="employee-modal__role-icon" />
                            <span className="employee-modal__role-label">{role.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="employee-modal__actions">
              {/* Botón de eliminar solo en modo edición */}
              {mode === 'edit' && (
                <button
                  type="button"
                  className="employee-modal__btn employee-modal__btn--danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  <Trash size={16} weight="duotone" />
                  Eliminar
                </button>
              )}

              <div className="employee-modal__actions-right">
                <button
                  type="button"
                  className="employee-modal__btn employee-modal__btn--secondary"
                  onClick={onClose}
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
                      {mode === 'create' ? 'Creando...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} weight="duotone" />
                      {mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="employee-modal__delete-confirm">
            <div className="employee-modal__delete-content">
              <div className="employee-modal__delete-icon">
                <Trash size={32} weight="duotone" />
              </div>
              <h4>¿Eliminar empleado permanentemente?</h4>
              <p>Esta acción no se puede deshacer. El empleado será eliminado completamente del sistema.</p>
              <div className="employee-modal__delete-actions">
                <button
                  className="employee-modal__btn employee-modal__btn--secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="employee-modal__btn employee-modal__btn--danger"
                  onClick={handleDelete}
                >
                  <Trash size={16} weight="duotone" />
                  Eliminar Permanentemente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
