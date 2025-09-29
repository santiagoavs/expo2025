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
  Stack,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  styled,
  alpha
} from '@mui/material';
import {
  Check,
  X,
  PencilSimple
} from '@phosphor-icons/react';
import paymentConfigService from '../../api/PaymentConfigService';
import toast from 'react-hot-toast';

// ================ ESTILOS MODERNOS PARA MODAL ================
const ModernDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    border: `1px solid ${alpha('#1F64BF', 0.08)}`,
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
    fontFamily: "'Mona Sans'",
    [theme.breakpoints.down('md')]: {
      borderRadius: '16px',
      margin: '16px',
    }
  }
}));

const ModernDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#010326',
  fontFamily: "'Mona Sans'",
  padding: '32px 32px 16px 32px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  [theme.breakpoints.down('md')]: {
    padding: '24px 24px 12px 24px',
    fontSize: '1.3rem',
  }
}));

const ModernDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px 32px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    padding: '20px 24px',
  }
}));

const ModernDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 32px 32px 32px',
  borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
  gap: '12px',
  [theme.breakpoints.down('md')]: {
    padding: '12px 24px 24px 24px',
    flexDirection: 'column',
    '& > *': {
      width: '100%'
    }
  }
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1rem',
  fontFamily: "'Mona Sans'",
  fontWeight: '600',
  padding: '12px 24px',
  minHeight: '48px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(1, 3, 38, 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.15)',
  },
  [theme.breakpoints.down('md')]: {
    minHeight: '52px',
  }
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '1rem',
    fontFamily: "'Mona Sans'",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#032CA6',
      }
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#032CA6',
        borderWidth: '2px',
      }
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    fontWeight: '500',
    '&.Mui-focused': {
      color: '#032CA6',
    }
  }
}));

const ModernFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '1rem',
    fontFamily: "'Mona Sans'",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#032CA6',
      }
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#032CA6',
        borderWidth: '2px',
      }
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    fontWeight: '500',
    '&.Mui-focused': {
      color: '#032CA6',
    }
  }
}));

const PaymentMethodConfigModal = ({ open, onClose, selectedMethod = null, mode = 'create', onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Estados simples
  const [formData, setFormData] = useState({
    name: '',
    type: 'wompi',
    enabled: true,
    message: '',
    config: {}
  });
  const [saving, setSaving] = useState(false);

  // Tipos soportados
  const paymentTypes = [
    { value: 'wompi', label: 'Wompi', color: '#8B5CF6' },
    { value: 'cash', label: 'Efectivo', color: '#10B981' },
    { value: 'bank_transfer', label: 'Transferencia Bancaria', color: '#3B82F6' },
    { value: 'credit_card', label: 'Tarjeta de Crédito', color: '#F59E0B' }
  ];

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (selectedMethod && mode === 'edit') {
        // Mapear tipo 'bank' a 'bank_transfer'
        const mappedType = selectedMethod.type === 'bank' ? 'bank_transfer' : selectedMethod.type;
        
        setFormData({
          name: selectedMethod.name || '',
          type: mappedType,
          enabled: selectedMethod.enabled || false,
          message: selectedMethod.message || '',
          config: selectedMethod.config || {}
        });
      } else {
        setFormData({
          name: '',
          type: 'wompi',
          enabled: true,
          message: '',
          config: {}
        });
      }
    }
  }, [open, selectedMethod, mode]);

  // Manejar cambios
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar guardar
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error guardando método de pago:', error);
      toast.error('Error al guardar el método de pago');
    } finally {
      setSaving(false);
    }
  };

  // Obtener tipo seleccionado
  const selectedType = paymentTypes.find(type => type.value === formData.type);

  return (
    <ModernDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <ModernDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha('#032CA6', 0.1),
              color: '#032CA6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PencilSimple size={24} />
          </Box>
          {mode === 'create' ? 'Crear Método de Pago' : 'Editar Método de Pago'}
        </Box>
      </ModernDialogTitle>

      <ModernDialogContent>
        <Stack spacing={3}>
          {/* Nombre del método */}
          <ModernTextField
            id="method-name"
            name="name"
            label="Nombre del método"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Ej: Pago en efectivo"
            required
          />

          {/* Tipo de método */}
          <ModernFormControl fullWidth>
            <InputLabel id="method-type-label">Tipo de método</InputLabel>
            <Select
              id="method-type"
              name="type"
              labelId="method-type-label"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label="Tipo de método"
            >
              {paymentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: type.color
                      }}
                    />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </ModernFormControl>

          {/* Mensaje para el cliente */}
          <ModernTextField
            id="method-message"
            name="message"
            label="Mensaje para el cliente"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            placeholder="Ej: Paga en efectivo al momento de la entrega"
          />

          {/* Campos específicos para efectivo */}
          {formData.type === 'cash' && (
            <Stack spacing={3}>
              <ModernTextField
                id="cash-message"
                name="cashMessage"
                label="Mensaje para el cliente"
                value={formData.config.cashMessage || ''}
                onChange={(e) => handleChange('config', { ...formData.config, cashMessage: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="Ej: Paga en efectivo al momento de la entrega"
              />
              <ModernTextField
                id="cash-instructions"
                name="instructions"
                label="Instrucciones adicionales"
                value={formData.config.instructions || ''}
                onChange={(e) => handleChange('config', { ...formData.config, instructions: e.target.value })}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                placeholder="Ej: Tener el cambio exacto, solo billetes, etc."
              />
            </Stack>
          )}

          {/* Campos específicos para transferencia bancaria */}
          {formData.type === 'bank_transfer' && (
            <Stack spacing={3}>
              <ModernTextField
                id="bank-name"
                name="bankName"
                label="Nombre del banco"
                value={formData.config.bankName || ''}
                onChange={(e) => handleChange('config', { ...formData.config, bankName: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="Ej: Banco de Bogotá"
              />
              <ModernTextField
                id="account-number"
                name="accountNumber"
                label="Número de cuenta"
                value={formData.config.accountNumber || ''}
                onChange={(e) => handleChange('config', { ...formData.config, accountNumber: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="Ej: 1234567890"
              />
              <ModernTextField
                id="account-type"
                name="accountType"
                label="Tipo de cuenta"
                value={formData.config.accountType || ''}
                onChange={(e) => handleChange('config', { ...formData.config, accountType: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="Ej: Ahorros"
              />
            </Stack>
          )}

          {/* Estado habilitado */}
          <FormControlLabel
            control={
              <Switch
                id="method-enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#032CA6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#032CA6',
                  }
                }}
              />
            }
            label="Método habilitado"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontFamily: "'Mona Sans'",
                fontWeight: '500'
              }
            }}
          />
        </Stack>
      </ModernDialogContent>

      <ModernDialogActions>
        <ModernButton
          onClick={onClose}
          variant="outlined"
          startIcon={<X size={20} />}
          disabled={saving}
          sx={{
            borderColor: '#6B7280',
            color: '#6B7280',
            '&:hover': {
              borderColor: '#374151',
              backgroundColor: alpha('#6B7280', 0.04),
            }
          }}
        >
          Cancelar
        </ModernButton>
        <ModernButton
          onClick={handleSave}
          variant="contained"
          startIcon={<Check size={20} />}
          disabled={saving || !formData.name.trim()}
          sx={{
            backgroundColor: '#032CA6',
            '&:hover': {
              backgroundColor: '#021A7A',
            },
            '&:disabled': {
              backgroundColor: '#9CA3AF',
              color: '#FFFFFF'
            }
          }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </ModernButton>
      </ModernDialogActions>
    </ModernDialog>
  );
};

export default PaymentMethodConfigModal;