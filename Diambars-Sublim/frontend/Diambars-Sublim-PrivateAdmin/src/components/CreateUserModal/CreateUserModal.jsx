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
  styled,
  useTheme,
  alpha,
  Paper
} from '@mui/material';

// ================ ESTILOS MODERNOS RESPONSIVE - CREATE USER MODAL ================
const CreateUserForm = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});

const CreateUserSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const CreateUserSectionTitle = styled(Typography)({
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

const CreateUserField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const CreateUserLabel = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px',
});

const CreateUserInput = styled(TextField)(({ theme, error }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
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
  },
  '& .MuiInputBase-input': {
    color: '#010326',
  }
}));

const CreateUserSelect = styled(Select)(({ theme, error }) => ({
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

const CreateUserError = styled(Typography)({
  fontSize: '12px',
  color: '#dc2626',
  fontWeight: '500',
  marginTop: '4px',
});

const CreateUserRoleCard = styled(Card)(({ selected, theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid #040DBF` : `2px solid ${alpha('#040DBF', 0.1)}`,
  background: selected ? alpha('#040DBF', 0.05) : '#ffffff',
  '&:hover': {
    borderColor: '#040DBF',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(4, 13, 191, 0.15)',
  }
}));

const CreateUserRoleContent = styled(CardContent)({
  padding: '20px',
});

const CreateUserRoleHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
});

const CreateUserRoleTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: '700',
  color: '#010326',
  margin: 0,
});

const CreateUserRoleDescription = styled(Typography)({
  fontSize: '13px',
  color: '#64748b',
  marginBottom: '12px',
  lineHeight: 1.4,
});

const CreateUserPermissions = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

const CreateUserPermissionTag = styled(Chip)({
  fontSize: '11px',
  height: '24px',
  background: alpha('#040DBF', 0.1),
  color: '#040DBF',
  border: `1px solid ${alpha('#040DBF', 0.2)}`,
  '& .MuiChip-label': {
    padding: '0 8px',
    fontSize: '11px',
  }
});

const CreateUserActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  }
}));

const CreateUserBtn = styled(Button)(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(4, 13, 191, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(4, 13, 191, 0.4)',
    }
  } : {
    background: '#ffffff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    '&:hover': {
      background: '#f8fafc',
      color: '#334155',
      borderColor: '#cbd5e1',
    }
  })
}));

const CreateUserPasswordStrength = styled(Box)({
  marginTop: '8px',
});

const CreateUserPasswordStrengthBar = styled(Box)(({ strength }) => ({
  height: '4px',
  borderRadius: '2px',
  background: strength === 'weak' ? '#dc2626' : strength === 'medium' ? '#f59e0b' : '#10b981',
  width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
  transition: 'all 0.3s ease',
}));

const CreateUserPasswordStrengthText = styled(Typography)(({ strength }) => ({
  fontSize: '12px',
  fontWeight: '600',
  marginTop: '4px',
  color: strength === 'weak' ? '#dc2626' : strength === 'medium' ? '#f59e0b' : '#10b981',
}));

const CreateUserModal = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '', // Cambio de phone a phoneNumber para coincidir con el backend
    password: '',
    confirmPassword: '',
    role: 'customer', // Cambio de 'user' a 'customer'
    active: true // Cambio de status a active
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar roles para coincidir con el backend
  const roleOptions = [
    { 
      value: 'customer', 
      label: 'Cliente', 
      icon: <User size={16} weight="duotone" />, 
      description: 'Acceso básico para compras',
      permissions: ['catalog', 'orders', 'profile']
    },
    { 
      value: 'premium', 
      label: 'Premium', 
      icon: <Crown size={16} weight="duotone" />, 
      description: 'Acceso con descuentos y soporte prioritario',
      permissions: ['catalog', 'orders', 'profile', 'discounts', 'priority_support']
    },
    { 
      value: 'admin', 
      label: 'Administrador', 
      icon: <Shield size={16} weight="duotone" />, 
      description: 'Control total del sistema',
      permissions: ['users', 'orders', 'catalog', 'reports', 'settings', 'discounts', 'analytics']
    }
  ];

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    }

    // Validación email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validación teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.phoneNumber && !/^[0-9]{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El teléfono debe tener exactamente 8 dígitos';
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
      
      // Asegurar que active sea boolean
      submitData.active = submitData.active === true || submitData.active === 'true';
      
      console.log('[CreateUserModal] Enviando datos:', submitData);
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentRolePermissions = () => {
    const role = roleOptions.find(r => r.value === formData.role);
    return role ? role.permissions : [];
  };

  return (
    <CreateUserForm component="form" onSubmit={handleSubmit}>
      {/* Información Personal */}
      <CreateUserSection>
        <CreateUserSectionTitle>
          <User size={18} weight="duotone" />
          Información Personal
        </CreateUserSectionTitle>

        <CreateUserField>
          <CreateUserLabel>
            <User size={14} weight="duotone" />
            Nombre completo *
          </CreateUserLabel>
          <CreateUserInput
            type="text"
            error={!!errors.name}
            placeholder="Nombre del usuario"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          {errors.name && (
            <CreateUserError>
              <Warning size={12} weight="duotone" />
              {errors.name}
            </CreateUserError>
          )}
        </CreateUserField>

        <CreateUserField>
          <CreateUserLabel>
            <EnvelopeSimple size={14} weight="duotone" />
            Correo electrónico *
          </CreateUserLabel>
          <CreateUserInput
            type="email"
            error={!!errors.email}
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {errors.email && (
            <CreateUserError>
              <Warning size={12} weight="duotone" />
              {errors.email}
            </CreateUserError>
          )}
        </CreateUserField>

        <CreateUserField>
          <CreateUserLabel>
            <Phone size={14} weight="duotone" />
            Teléfono (opcional)
          </CreateUserLabel>
          <CreateUserInput
            type="tel"
            error={!!errors.phoneNumber}
            placeholder="12345678"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            inputProps={{ maxLength: 8 }}
          />
          {errors.phoneNumber && (
            <CreateUserError>
              <Warning size={12} weight="duotone" />
              {errors.phoneNumber}
            </CreateUserError>
          )}
        </CreateUserField>
      </CreateUserSection>

      {/* Credenciales */}
      <CreateUserSection>
        <CreateUserSectionTitle>
          <Lock size={18} weight="duotone" />
          Credenciales de Acceso
        </CreateUserSectionTitle>

        <CreateUserField>
          <CreateUserLabel>
            <Lock size={14} weight="duotone" />
            Contraseña *
          </CreateUserLabel>
          <CreateUserInput
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
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
            <CreateUserError>
              <Warning size={12} weight="duotone" />
              {errors.password}
            </CreateUserError>
          )}
        </CreateUserField>

        <CreateUserField>
          <CreateUserLabel>
            <Lock size={14} weight="duotone" />
            Confirmar contraseña *
          </CreateUserLabel>
          <CreateUserInput
            type={showConfirmPassword ? "text" : "password"}
            error={!!errors.confirmPassword}
            placeholder="Repite la contraseña"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
            <CreateUserError>
              <Warning size={12} weight="duotone" />
              {errors.confirmPassword}
            </CreateUserError>
          )}
        </CreateUserField>
      </CreateUserSection>

      {/* Rol y Permisos */}
      <CreateUserSection>
        <CreateUserSectionTitle>
          <Shield size={18} weight="duotone" />
          Rol y Permisos
        </CreateUserSectionTitle>

        <CreateUserField>
          <CreateUserLabel>Rol del usuario</CreateUserLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roleOptions.map(role => (
              <CreateUserRoleCard
                key={role.value}
                selected={formData.role === role.value}
                onClick={() => handleInputChange('role', role.value)}
              >
                <CreateUserRoleContent>
                  <CreateUserRoleHeader>
                    {role.icon}
                    <CreateUserRoleTitle>{role.label}</CreateUserRoleTitle>
                  </CreateUserRoleHeader>
                  <CreateUserRoleDescription>{role.description}</CreateUserRoleDescription>
                  <CreateUserPermissions>
                    {role.permissions.map((permission, index) => (
                      <CreateUserPermissionTag
                        key={index}
                        label={permission}
                        size="small"
                      />
                    ))}
                  </CreateUserPermissions>
                </CreateUserRoleContent>
              </CreateUserRoleCard>
            ))}
          </Box>
        </CreateUserField>

        <CreateUserField>
          <CreateUserLabel>Estado inicial</CreateUserLabel>
          <FormControl fullWidth>
            <CreateUserSelect
              value={formData.active}
              onChange={(e) => handleInputChange('active', e.target.value === 'true')}
            >
              <MenuItem value={true}>Activo</MenuItem>
              <MenuItem value={false}>Inactivo</MenuItem>
            </CreateUserSelect>
          </FormControl>
        </CreateUserField>

        {/* Permisos Preview */}
        {getCurrentRolePermissions().length > 0 && (
          <Box sx={{ marginTop: '16px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
              Permisos asignados:
            </Typography>
            <CreateUserPermissions>
              {getCurrentRolePermissions().map((permission, index) => (
                <CreateUserPermissionTag
                  key={index}
                  label={permission}
                  size="small"
                />
              ))}
            </CreateUserPermissions>
          </Box>
        )}
      </CreateUserSection>

      {/* Actions */}
      <CreateUserActions>
        <CreateUserBtn
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={16} weight="duotone" />
          Cancelar
        </CreateUserBtn>
        
        <CreateUserBtn
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Box sx={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Creando...
            </>
          ) : (
            <>
              <Check size={16} weight="duotone" />
              Crear Usuario
            </>
          )}
        </CreateUserBtn>
      </CreateUserActions>
    </CreateUserForm>
  );
};

export default CreateUserModal;