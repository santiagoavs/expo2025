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
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  styled,
  useTheme,
  alpha,
  Paper,
  Avatar,
  CircularProgress
} from '@mui/material';
import useEmployees from '../../hooks/useEmployees';

// ================ ESTILOS MODERNOS RESPONSIVE - EMPLOYEE MODAL ================
const EmployeeModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  animation: 'fadeIn 0.3s ease-out',
});

const EmployeeModalContainer = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
  borderRadius: '32px',
  boxShadow: `
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  maxWidth: '1000px',
  width: '95vw',
  maxHeight: '95vh',
  overflow: 'hidden',
  position: 'relative',
  animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  transform: 'perspective(1000px) rotateX(0deg)',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '900px',
    width: '90vw',
  },
  [theme.breakpoints.down('md')]: {
    width: '95vw',
    maxHeight: '95vh',
    borderRadius: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '98vw',
    maxHeight: '98vh',
    borderRadius: '20px',
  }
}));

const EmployeeModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '28px 36px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
  borderRadius: '32px 32px 0 0',
  [theme.breakpoints.down('md')]: {
    padding: '24px 28px',
    borderRadius: '24px 24px 0 0',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
    borderRadius: '20px 20px 0 0',
  }
}));

const EmployeeModalTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  color: '#010326',
  fontWeight: '600',
  fontSize: '22px',
  [theme.breakpoints.down('md')]: {
    fontSize: '20px',
    gap: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '18px',
    gap: '10px',
  }
}));

const EmployeeModalClose = styled(IconButton)(({ theme }) => ({
  background: 'rgba(148, 163, 184, 0.1)',
  border: 'none',
  borderRadius: '16px',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(148, 163, 184, 0.2)',
    color: '#334155',
    transform: 'scale(1.05)',
    borderRadius: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
  }
}));

const EmployeeModalContent = styled(Box)(({ theme }) => ({
  padding: '36px',
  maxHeight: 'calc(95vh - 140px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(0, 0, 0, 0.3)',
  },
  [theme.breakpoints.down('md')]: {
    padding: '28px',
    maxHeight: 'calc(95vh - 120px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '24px',
    maxHeight: 'calc(98vh - 100px)',
  }
}));

const EmployeeModalForm = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const EmployeeModalSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const EmployeeModalSectionTitle = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '16px',
  fontWeight: '700',
  color: '#010326',
  margin: 0,
  paddingBottom: '12px',
  borderBottom: `2px solid ${alpha('#040DBF', 0.1)}`,
});

const EmployeeModalField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const EmployeeModalLabel = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px',
});

const EmployeeModalInput = styled(TextField)(({ theme, error }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    padding: '16px 20px',
    background: '#ffffff',
    borderRadius: '16px',
    fontSize: '15px',
    minHeight: '56px',
    '& fieldset': {
      borderColor: error ? '#dc2626' : '#e2e8f0',
      borderWidth: '2px',
      borderRadius: '16px',
    },
    '&:hover fieldset': {
      borderColor: error ? '#dc2626' : '#040DBF',
      borderRadius: '16px',
    },
    '&.Mui-focused fieldset': {
      borderColor: error ? '#dc2626' : '#040DBF',
      boxShadow: error ? '0 0 0 4px rgba(220, 38, 38, 0.1)' : '0 0 0 4px rgba(4, 13, 191, 0.1)',
      borderRadius: '16px',
    },
  },
  '& .MuiInputBase-input': {
    color: '#010326',
    padding: '0',
  },
  '& .MuiInputBase-inputMultiline': {
    padding: '0',
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiOutlinedInput-root': {
      padding: '14px 16px',
      borderRadius: '14px',
      minHeight: '52px',
      fontSize: '14px',
    }
  }
}));

const EmployeeModalSelect = styled(Select)(({ theme, error }) => ({
  width: '100%',
  padding: '12px 16px',
  background: '#ffffff',
  borderRadius: '12px',
  fontSize: '14px',
  '& fieldset': {
    borderColor: error ? '#dc2626' : '#e2e8f0',
    borderWidth: '2px',
  },
  '&:hover fieldset': {
    borderColor: error ? '#dc2626' : '#040DBF',
  },
  '&.Mui-focused fieldset': {
    borderColor: error ? '#dc2626' : '#040DBF',
    boxShadow: error ? '0 0 0 4px rgba(220, 38, 38, 0.1)' : '0 0 0 4px rgba(4, 13, 191, 0.1)',
  },
  '& .MuiSelect-select': {
    color: '#010326',
  }
}));

const EmployeeModalError = styled(Typography)({
  fontSize: '12px',
  color: '#dc2626',
  fontWeight: '500',
  marginTop: '4px',
});

const EmployeeModalRoleCard = styled(Card)(({ selected, theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `3px solid #040DBF` : `2px solid ${alpha('#040DBF', 0.1)}`,
  background: selected ? alpha('#040DBF', 0.05) : '#ffffff',
  borderRadius: '20px',
  boxShadow: selected ? '0 8px 25px rgba(4, 13, 191, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    borderColor: '#040DBF',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(4, 13, 191, 0.2)',
    borderRadius: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '16px',
    '&:hover': {
      borderRadius: '20px',
    }
  }
}));

const EmployeeModalRoleContent = styled(CardContent)(({ theme }) => ({
  padding: '24px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

const EmployeeModalRoleHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
  [theme.breakpoints.down('sm')]: {
    gap: '12px',
    marginBottom: '8px',
  }
}));

const EmployeeModalRoleTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: '700',
  color: '#010326',
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    fontSize: '16px',
  }
}));

const EmployeeModalRoleDescription = styled(Typography)({
  fontSize: '13px',
  color: '#64748b',
  marginBottom: '12px',
  lineHeight: 1.4,
});

const EmployeeModalActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  justifyContent: 'flex-end',
  marginTop: '32px',
  padding: '24px 0',
  [theme.breakpoints.down('md')]: {
    gap: '12px',
    marginTop: '28px',
    padding: '20px 0',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
    padding: '16px 0',
  }
}));

const EmployeeModalBtn = styled(Button)(({ variant, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '16px 32px',
  borderRadius: '20px',
  fontSize: '15px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  minHeight: '56px',
  minWidth: '140px',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(4, 13, 191, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 25px rgba(4, 13, 191, 0.4)',
      borderRadius: '24px',
    }
  } : variant === 'danger' ? {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
      borderRadius: '24px',
    }
  } : {
    background: '#ffffff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      background: '#f8fafc',
      color: '#334155',
      borderColor: '#cbd5e1',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      borderRadius: '24px',
    }
  }),
  [theme.breakpoints.down('md')]: {
    padding: '14px 28px',
    borderRadius: '18px',
    fontSize: '14px',
    minHeight: '52px',
    minWidth: '120px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    borderRadius: '16px',
    fontSize: '14px',
    minHeight: '48px',
    minWidth: '100%',
    width: '100%',
  }
}));

const EmployeeModalPasswordStrength = styled(Box)({
  marginTop: '8px',
});

const EmployeeModalPasswordStrengthBar = styled(Box)(({ strength }) => ({
  height: '4px',
  borderRadius: '2px',
  background: strength === 'weak' ? '#dc2626' : strength === 'medium' ? '#f59e0b' : '#10b981',
  width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
  transition: 'all 0.3s ease',
}));

const EmployeeModalPasswordStrengthText = styled(Typography)(({ strength }) => ({
  fontSize: '12px',
  fontWeight: '600',
  marginTop: '4px',
  color: strength === 'weak' ? '#dc2626' : strength === 'medium' ? '#f59e0b' : '#10b981',
}));

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
    <EmployeeModalOverlay>
      <EmployeeModalContainer>
        <EmployeeModalHeader>
          <EmployeeModalTitle>
            {mode === 'create' ? (
              <>
                <UserPlus size={24} weight="duotone" />
                <Typography variant="h3" sx={{ margin: 0, fontWeight: '600', color: '#010326' }}>
                  Crear Nuevo Empleado
                </Typography>
              </>
            ) : (
              <>
                <PencilSimple size={24} weight="duotone" />
                <Typography variant="h3" sx={{ margin: 0, fontWeight: '600', color: '#010326' }}>
                  Editar Empleado
                </Typography>
              </>
            )}
          </EmployeeModalTitle>
          <EmployeeModalClose
            onClick={onClose}
            type="button"
          >
            <X size={20} weight="bold" />
          </EmployeeModalClose>
        </EmployeeModalHeader>

        {isLoadingEmployee ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '16px' }}>
            <CircularProgress size={40} />
            <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
              Cargando datos del empleado...
            </Typography>
          </Box>
        ) : (
          <EmployeeModalContent>
            <EmployeeModalForm component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Información Personal */}
                <Grid item xs={12} md={6}>
                  <EmployeeModalSection>
                    <EmployeeModalSectionTitle>
                      <User size={18} weight="duotone" />
                      Información Personal
                    </EmployeeModalSectionTitle>
                    
                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        Nombre Completo *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        placeholder="Ej: Juan Pérez"
                      />
                      {errors.name && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.name}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        <Envelope size={16} weight="duotone" />
                        Correo Electrónico *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        placeholder="juan.perez@empresa.com"
                      />
                      {errors.email && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.email}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        <Phone size={16} weight="duotone" />
                        Teléfono *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        error={!!errors.phoneNumber}
                        placeholder="7777-7777"
                      />
                      {errors.phoneNumber && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.phoneNumber}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        <IdentificationCard size={16} weight="duotone" />
                        DUI *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="text"
                        name="dui"
                        value={formData.dui}
                        onChange={(e) => {
                          const formatted = formatDui(e.target.value);
                          setFormData(prev => ({ ...prev, dui: formatted }));
                        }}
                        error={!!errors.dui}
                        placeholder="12345678-9"
                        inputProps={{ maxLength: 10 }}
                      />
                      {errors.dui && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.dui}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        <MapPin size={16} weight="duotone" />
                        Dirección *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={!!errors.address}
                        placeholder="Dirección completa del empleado"
                        multiline
                        rows={3}
                      />
                      {errors.address && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.address}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>
                  </EmployeeModalSection>
                </Grid>

                {/* Fechas y Contraseña */}
                <Grid item xs={12} md={6}>
                  <EmployeeModalSection>
                    <EmployeeModalSectionTitle>
                      <Calendar size={18} weight="duotone" />
                      Fechas y Seguridad
                    </EmployeeModalSectionTitle>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        Fecha de Nacimiento *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        error={!!errors.birthday}
                      />
                      {errors.birthday && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.birthday}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        Fecha de Contratación *
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type="date"
                        name="hireDate"
                        value={formData.hireDate}
                        onChange={handleInputChange}
                        error={!!errors.hireDate}
                      />
                      {errors.hireDate && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.hireDate}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    {/* Contraseña - Solo mostrar en creación o si se quiere cambiar */}
                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        {mode === 'create' ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
                      </EmployeeModalLabel>
                      <EmployeeModalInput
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={!!errors.password}
                        placeholder={mode === 'create' ? 'Mínimo 6 caracteres' : 'Dejar vacío para mantener la actual'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {errors.password && (
                        <EmployeeModalError>
                          <Warning size={16} weight="fill" />
                          {errors.password}
                        </EmployeeModalError>
                      )}
                    </EmployeeModalField>

                    {/* Confirmar contraseña solo si se está creando o cambiando contraseña */}
                    {(mode === 'create' || formData.password) && (
                      <EmployeeModalField>
                        <EmployeeModalLabel>
                          Confirmar Contraseña *
                        </EmployeeModalLabel>
                        <EmployeeModalInput
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          error={!!errors.confirmPassword}
                          placeholder="Repite la contraseña"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {errors.confirmPassword && (
                          <EmployeeModalError>
                            <Warning size={16} weight="fill" />
                            {errors.confirmPassword}
                          </EmployeeModalError>
                        )}
                      </EmployeeModalField>
                    )}
                  </EmployeeModalSection>
                </Grid>

                {/* Rol */}
                <Grid item xs={12}>
                  <EmployeeModalSection>
                    <EmployeeModalSectionTitle>
                      <Shield size={18} weight="duotone" />
                      Rol y Permisos
                    </EmployeeModalSectionTitle>

                    <EmployeeModalField>
                      <EmployeeModalLabel>
                        Selecciona el Rol *
                      </EmployeeModalLabel>
                      <Grid container spacing={2}>
                        {roles.map(role => {
                          const IconComponent = role.icon;
                          return (
                            <Grid item xs={12} sm={6} md={3} key={role.value}>
                              <EmployeeModalRoleCard
                                selected={formData.role === role.value}
                                onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                              >
                                <EmployeeModalRoleContent>
                                  <EmployeeModalRoleHeader>
                                    <IconComponent size={24} weight="duotone" />
                                    <EmployeeModalRoleTitle>{role.label}</EmployeeModalRoleTitle>
                                  </EmployeeModalRoleHeader>
                                </EmployeeModalRoleContent>
                              </EmployeeModalRoleCard>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </EmployeeModalField>
                  </EmployeeModalSection>
                </Grid>
              </Grid>

              <EmployeeModalActions>
                {/* Botón de eliminar solo en modo edición */}
                {mode === 'edit' && (
                  <EmployeeModalBtn
                    type="button"
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                  >
                    <Trash size={16} weight="duotone" />
                    Eliminar
                  </EmployeeModalBtn>
                )}

                <Box sx={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                  <EmployeeModalBtn
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </EmployeeModalBtn>
                  <EmployeeModalBtn
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={16} color="inherit" />
                        {mode === 'create' ? 'Creando...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} weight="duotone" />
                        {mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
                      </>
                    )}
                  </EmployeeModalBtn>
                </Box>
              </EmployeeModalActions>
            </EmployeeModalForm>
          </EmployeeModalContent>
        )}

        {/* Modal de confirmación de eliminación */}
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            padding: '32px 32px 0 32px',
            background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
              }}>
                <Trash size={40} weight="duotone" color="#dc2626" />
              </Box>
              <Typography variant="h4" sx={{ 
                fontWeight: '700', 
                color: '#010326',
                fontSize: '24px',
                lineHeight: 1.2,
              }}>
                ¿Eliminar empleado permanentemente?
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ 
            textAlign: 'center', 
            padding: '24px 32px',
            background: '#ffffff',
          }}>
            <Typography sx={{ 
              color: '#64748b', 
              lineHeight: 1.6,
              fontSize: '16px',
            }}>
              Esta acción no se puede deshacer. El empleado será eliminado completamente del sistema.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            padding: '24px 32px 32px 32px', 
            justifyContent: 'center', 
            gap: '16px',
            background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
          }}>
            <EmployeeModalBtn
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              sx={{ minWidth: '160px' }}
            >
              Cancelar
            </EmployeeModalBtn>
            <EmployeeModalBtn
              variant="danger"
              onClick={handleDelete}
              sx={{ minWidth: '200px' }}
            >
              <Trash size={16} weight="duotone" />
              Eliminar Permanentemente
            </EmployeeModalBtn>
          </DialogActions>
        </Dialog>
      </EmployeeModalContainer>
    </EmployeeModalOverlay>
  );
};

export default EmployeeModal;
