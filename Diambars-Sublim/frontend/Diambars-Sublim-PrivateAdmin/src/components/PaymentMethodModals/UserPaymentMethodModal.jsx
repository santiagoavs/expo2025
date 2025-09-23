// components/PaymentMethodModals/UserPaymentMethodModal.jsx - Modal para gestión de métodos de pago de usuarios
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  CreditCard,
  CurrencyDollar,
  Bank,
  Plus,
  PencilSimple,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';
import { usePaymentMethodActions } from '../../hooks/usePayments';
import toast from 'react-hot-toast';

const UserPaymentMethodModal = ({ open, onClose, selectedMethod = null, mode = 'create' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Hooks
  const { 
    loading: actionLoading, 
    createMethod, 
    updateMethod, 
    deleteMethod 
  } = usePaymentMethodActions();

  // Estados locales
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card',
    number: '',
    expiry: '',
    nickname: '',
    bankAccount: '',
    active: false
  });

  const [showCardNumber, setShowCardNumber] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de métodos soportados
  const supportedTypes = [
    {
      value: 'credit_card',
      label: 'Tarjeta de Crédito',
      icon: CreditCard,
      color: '#1F64BF',
      description: 'Visa, Mastercard, American Express'
    },
    {
      value: 'wompi',
      label: 'Wompi Digital',
      icon: CreditCard,
      color: '#8B5CF6',
      description: 'Pago digital con Wompi'
    },
    {
      value: 'bank_transfer',
      label: 'Transferencia Bancaria',
      icon: Bank,
      color: '#10B981',
      description: 'Transferencia bancaria'
    },
    {
      value: 'cash',
      label: 'Efectivo',
      icon: CurrencyDollar,
      color: '#F59E0B',
      description: 'Pago en efectivo'
    }
  ];

  // Inicializar formulario
  useEffect(() => {
    if (selectedMethod && mode === 'edit') {
      setFormData({
        name: selectedMethod.name || '',
        type: selectedMethod.type || 'credit_card',
        number: selectedMethod.lastFourDigits ? `****${selectedMethod.lastFourDigits}` : '',
        expiry: selectedMethod.expiry || '',
        nickname: selectedMethod.nickname || '',
        bankAccount: selectedMethod.bankAccount || '',
        active: selectedMethod.active || false
      });
    } else {
      setFormData({
        name: '',
        type: 'credit_card',
        number: '',
        expiry: '',
        nickname: '',
        bankAccount: '',
        active: false
      });
    }
    setErrors({});
  }, [selectedMethod, mode, open]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.type === 'credit_card' || formData.type === 'wompi') {
      if (!formData.number.trim()) {
        newErrors.number = 'El número de tarjeta es requerido';
      } else if (formData.number.length < 13 || formData.number.length > 19) {
        newErrors.number = 'El número de tarjeta debe tener entre 13 y 19 dígitos';
      }

      if (!formData.expiry.trim()) {
        newErrors.expiry = 'La fecha de expiración es requerida';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
        newErrors.expiry = 'La fecha debe tener formato MM/AA';
      }
    }

    if (formData.type === 'bank_transfer' && !formData.bankAccount.trim()) {
      newErrors.bankAccount = 'El número de cuenta es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  // Manejar guardar
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const methodData = {
        name: formData.name.trim(),
        type: formData.type,
        nickname: formData.nickname.trim(),
        active: formData.active
      };

      // Agregar campos específicos según el tipo
      if (formData.type === 'credit_card' || formData.type === 'wompi') {
        methodData.number = formData.number.replace(/\s/g, '');
        methodData.expiry = formData.expiry;
      }

      if (formData.type === 'bank_transfer') {
        methodData.bankAccount = formData.bankAccount;
      }

      if (mode === 'edit' && selectedMethod) {
        await updateMethod(selectedMethod._id, methodData);
        toast.success('Método actualizado exitosamente');
      } else {
        await createMethod(methodData);
        toast.success('Método creado exitosamente');
      }

      onClose();
    } catch (error) {
      console.error('Error guardando método:', error);
      toast.error(error.message || 'Error guardando método');
    }
  };

  // Manejar eliminar
  const handleDelete = async () => {
    try {
      if (!selectedMethod) return;

      await deleteMethod(selectedMethod._id);
      toast.success('Método eliminado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error eliminando método:', error);
      toast.error(error.message || 'Error eliminando método');
    }
  };

  // Obtener tipo seleccionado
  const selectedType = supportedTypes.find(type => type.value === formData.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isExtraSmall}
      PaperProps={{
        elevation: 0,
        sx: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: isExtraSmall ? 0 : 3,
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 16px 64px rgba(31, 100, 191, 0.16)',
          m: isExtraSmall ? 0 : 2
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 3, md: 4 },
          pb: 2,
          borderBottom: `1px solid ${alpha('#1F64BF', 0.06)}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha('#1F64BF', 0.1),
              color: '#1F64BF'
            }}
          >
            {mode === 'edit' ? <PencilSimple size={24} weight="duotone" /> : <Plus size={24} weight="duotone" />}
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 700,
                color: '#010326',
                fontFamily: "'Mona Sans'"
              }}
            >
              {mode === 'edit' ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontFamily: "'Mona Sans'"
              }}
            >
              {mode === 'edit' ? 'Modifica los datos del método' : 'Agrega un nuevo método de pago'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={4} sx={{ pt: 2 }}>
          {/* Tipo de método */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: "'Mona Sans'" }}>Tipo de método</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              label="Tipo de método"
              sx={{
                borderRadius: 2,
                fontSize: '1rem',
                fontFamily: "'Mona Sans'"
              }}
            >
              {supportedTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <MenuItem key={type.value} value={type.value} sx={{ fontFamily: "'Mona Sans'" }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <IconComponent size={20} weight="duotone" style={{ color: type.color }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                          {type.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontFamily: "'Mona Sans'" }}>
                          {type.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Nombre del titular */}
          <TextField
            label="Nombre del titular"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Ej: Juan Pérez"
            error={!!errors.name}
            helperText={errors.name}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1rem',
                fontFamily: "'Mona Sans'"
              }
            }}
          />

          {/* Campos específicos según el tipo */}
          {(formData.type === 'credit_card' || formData.type === 'wompi') && (
            <>
              <TextField
                label="Número de tarjeta"
                value={formData.number}
                onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
                fullWidth
                variant="outlined"
                placeholder="1234 5678 9012 3456"
                error={!!errors.number}
                helperText={errors.number}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showCardNumber ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </Button>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontFamily: "'Mona Sans'"
                  }
                }}
              />

              <TextField
                label="Fecha de expiración"
                value={formData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="MM/AA"
                error={!!errors.expiry}
                helperText={errors.expiry}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontFamily: "'Mona Sans'"
                  }
                }}
              />
            </>
          )}

          {formData.type === 'bank_transfer' && (
            <TextField
              label="Número de cuenta"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="1234567890"
              error={!!errors.bankAccount}
              helperText={errors.bankAccount}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontFamily: "'Mona Sans'"
                }
              }}
            />
          )}

          {/* Apodo opcional */}
          <TextField
            label="Apodo (opcional)"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Ej: Mi tarjeta principal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1rem',
                fontFamily: "'Mona Sans'"
              }
            }}
          />

          {/* Estado del método */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha('#1F64BF', 0.04),
              border: `1px solid ${alpha('#1F64BF', 0.08)}`
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  size="medium"
                />
              }
              label={
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: '#010326',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Método activo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Este será tu método de pago predeterminado
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Paper>

          {/* Información de seguridad */}
          <Alert severity="info" sx={{ borderRadius: 2, fontFamily: "'Mona Sans'" }}>
            <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Seguridad:</strong> Los datos sensibles como el número completo de tarjeta y CVV no se almacenan por seguridad. Solo guardamos los últimos 4 dígitos para identificación.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 3, md: 4 },
          pt: 2,
          borderTop: `1px solid ${alpha('#1F64BF', 0.06)}`,
          gap: 2
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: "'Mona Sans'",
            borderColor: alpha('#64748B', 0.2),
            color: '#64748B',
            minHeight: 48,
            flex: { xs: 1, sm: 'none' },
            '&:hover': {
              borderColor: '#64748B',
              background: alpha('#64748B', 0.04)
            }
          }}
        >
          Cancelar
        </Button>

        {mode === 'edit' && (
          <Button
            onClick={handleDelete}
            variant="outlined"
            disabled={actionLoading}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: "'Mona Sans'",
              borderColor: alpha('#EF4444', 0.2),
              color: '#EF4444',
              minHeight: 48,
              flex: { xs: 1, sm: 'none' },
              '&:hover': {
                borderColor: '#EF4444',
                background: alpha('#EF4444', 0.04)
              }
            }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        )}

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={actionLoading}
          sx={{
            background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: "'Mona Sans'",
            boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
            minHeight: 48,
            flex: { xs: 1, sm: 'none' },
            '&:hover': {
              background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
              boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)'
            }
          }}
        >
          {actionLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            mode === 'edit' ? 'Actualizar Método' : 'Crear Método'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPaymentMethodModal;
