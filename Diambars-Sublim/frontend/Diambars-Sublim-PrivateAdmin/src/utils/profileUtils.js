// src/utils/profileUtils.js

// Utilidades para formateo y validación de datos del perfil

// Formatear fecha para mostrar
export const formatDate = (dateString) => {
  if (!dateString) return 'No especificado';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

// Formatear teléfono
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'No especificado';
  
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato para El Salvador (+503 1234-5678)
  if (cleaned.length === 8) {
    return `+503 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  // Si ya tiene código de país
  if (cleaned.length === 11 && cleaned.startsWith('503')) {
    return `+503 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Devolver original si no coincide con los formatos esperados
};

// Validaciones
export const validateProfileData = (data) => {
  const errors = {};

  // Validar nombre
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Ingresa un email válido';
  }

  // Validar teléfono (formato salvadoreño)
  if (data.phone) {
    const phoneRegex = /^(\+503\s?)?[0-9]{4}-?[0-9]{4}$/;
    const cleanPhone = data.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone) && cleanPhone.length !== 8) {
      errors.phone = 'El teléfono debe tener el formato +503 1234-5678 o 12345678';
    }
  }

  // Validar DUI (si se proporciona)
  if (data.dui) {
    const duiRegex = /^[0-9]{8}-[0-9]$/;
    if (!duiRegex.test(data.dui)) {
      errors.dui = 'El DUI debe tener el formato 12345678-9';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar contraseña
export const validatePassword = (passwordData) => {
  const errors = {};

  if (!passwordData.currentPassword) {
    errors.currentPassword = 'Ingresa tu contraseña actual';
  }

  if (!passwordData.newPassword) {
    errors.newPassword = 'Ingresa una nueva contraseña';
  } else if (passwordData.newPassword.length < 6) {
    errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!passwordData.confirmPassword) {
    errors.confirmPassword = 'Confirma tu nueva contraseña';
  } else if (passwordData.newPassword !== passwordData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  // Validaciones adicionales de seguridad
  if (passwordData.newPassword) {
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      errors.newPassword = 'La contraseña debe contener al menos: una mayúscula, una minúscula y un número';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Obtener iniciales del nombre
export const getInitials = (name) => {
  if (!name) return 'U';
  
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
};

// Mapear roles a nombres en español
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'employee': 'Empleado',
    'delivery': 'Repartidor',
    'production': 'Producción'
  };
  return roleNames[role?.toLowerCase()] || 'Empleado';
};

// Obtener color del rol
export const getRoleColor = (role) => {
  const roleColors = {
    'admin': '#040DBF',
    'manager': '#1F64BF',
    'employee': '#64748b',
    'delivery': '#10b981',
    'production': '#f59e0b'
  };
  return roleColors[role?.toLowerCase()] || '#64748b';
};

// Formatear datos del perfil para mostrar
export const formatProfileForDisplay = (userData) => {
  if (!userData) return null;

  return {
    name: userData.name || 'Sin nombre',
    email: userData.email || 'Sin email',
    phone: formatPhoneNumber(userData.phoneNumber),
    position: getRoleDisplayName(userData.role),
    location: userData.address || 'Sin dirección',
    hireDate: formatDate(userData.hireDate),
    dui: userData.dui || 'No especificado',
    role: userData.role || 'employee',
    active: userData.active || false,
    birthday: formatDate(userData.birthday)
  };
};

// Limpiar datos del perfil para envío
export const formatProfileForSubmit = (profileData) => {
  return {
    name: profileData.name?.trim(),
    email: profileData.email?.trim().toLowerCase(),
    phoneNumber: profileData.phone?.replace(/\D/g, ''), // Solo números
    address: profileData.location?.trim()
  };
};

// Ejemplo de uso en el componente:
/*
import { 
  validateProfileData, 
  validatePassword, 
  formatProfileForDisplay, 
  formatProfileForSubmit,
  getInitials 
} from '../utils/profileUtils';

// En el componente Profile:
const handleSaveProfile = async () => {
  // Validar datos antes de enviar
  const validation = validateProfileData(profileData);
  
  if (!validation.isValid) {
    // Mostrar errores
    Object.keys(validation.errors).forEach(field => {
      console.error(`${field}: ${validation.errors[field]}`);
    });
    return;
  }

  // Formatear datos para envío
  const formattedData = formatProfileForSubmit(profileData);
  
  // Enviar a la API
  const response = await ProfileService.updateUserProfile(user.id, formattedData);
  // ...
};
*/