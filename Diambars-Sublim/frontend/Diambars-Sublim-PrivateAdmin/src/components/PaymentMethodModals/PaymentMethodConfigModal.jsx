// components/PaymentMethodModals/PaymentMethodConfigModal.jsx - Modal para configuración de métodos de pago
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
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Gear,
  CreditCard,
  CurrencyDollar,
  Bank,
  CheckCircle,
  XCircle,
  Plus,
  PencilSimple
} from '@phosphor-icons/react';
import { usePaymentConfigManagement } from '../../hooks/usePaymentConfig';
import toast from 'react-hot-toast';

const PaymentMethodConfigModal = ({ open, onClose, selectedMethod = null, mode = 'create' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Hooks
  const { 
    configs, 
    loading, 
    upsertConfig, 
    updateConfig, 
    deleteConfig 
  } = usePaymentConfigManagement();

  // Estados locales
  const [formData, setFormData] = useState({
    name: '',
    type: 'wompi',
    enabled: true,
    message: '',
    config: {}
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Tipos de métodos soportados
  const supportedTypes = [
    {
      value: 'wompi',
      label: 'Wompi Digital',
      icon: CreditCard,
      color: '#1F64BF',
      description: 'Pagos con tarjeta en línea'
    },
    {
      value: 'cash',
      label: 'Efectivo',
      icon: CurrencyDollar,
      color: '#10B981',
      description: 'Pago contra entrega'
    },
    {
      value: 'bank_transfer',
      label: 'Transferencia Bancaria',
      icon: Bank,
      color: '#8B5CF6',
      description: 'Transferencia bancaria'
    },
    {
      value: 'credit_card',
      label: 'Tarjeta de Crédito',
      icon: CreditCard,
      color: '#F59E0B',
      description: 'Tarjeta de crédito/débito'
    }
  ];

  // Inicializar formulario
  useEffect(() => {
    if (selectedMethod && mode === 'edit') {
      setFormData({
        name: selectedMethod.name || '',
        type: selectedMethod.type || 'wompi',
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
  }, [selectedMethod, mode, open]);

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar guardar
  const handleSave = async () => {
    try {
      setActionLoading(true);

      if (!formData.name.trim()) {
        toast.error('El nombre es requerido');
        return;
      }

      if (mode === 'edit' && selectedMethod) {
        await updateConfig(selectedMethod.type, formData);
        toast.success('Método actualizado exitosamente');
      } else {
        await upsertConfig(formData);
        toast.success('Método creado exitosamente');
      }

      onClose();
    } catch (error) {
      console.error('Error guardando método:', error);
      toast.error(error.message || 'Error guardando método');
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar eliminar
  const handleDelete = async () => {
    try {
      if (!selectedMethod) return;

      setActionLoading(true);
      await deleteConfig(selectedMethod.type);
      toast.success('Método eliminado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error eliminando método:', error);
      toast.error(error.message || 'Error eliminando método');
    } finally {
      setActionLoading(false);
    }
  };

  // Obtener tipo seleccionado
  const selectedType = supportedTypes.find(type => type.value === formData.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          m: isExtraSmall ? 0 : 2,
          maxHeight: '90vh'
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
              {mode === 'edit' ? 'Modifica la configuración del método' : 'Configura un nuevo método de pago'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 3, md: 4 }, maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
        <Stack spacing={4} sx={{ pt: 2 }}>
          {/* Información básica */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha('#1F64BF', 0.08)}`,
              background: alpha('#1F64BF', 0.02)
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#010326',
                mb: 3,
                fontFamily: "'Mona Sans'"
              }}
            >
              Información Básica
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Nombre del método"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ej: Tarjeta de Crédito Visa"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontFamily: "'Mona Sans'"
                  }
                }}
              />

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

              <TextField
                label="Mensaje para el cliente"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Ej: Paga en efectivo al momento de la entrega"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontFamily: "'Mona Sans'"
                  }
                }}
              />
            </Stack>
          </Paper>

          {/* Configuración específica del tipo */}
          {selectedType && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(selectedType.color, 0.1)}`,
                background: alpha(selectedType.color, 0.02)
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(selectedType.color, 0.1),
                    color: selectedType.color
                  }}
                >
                  {selectedType && <selectedType.icon size={20} weight="duotone" />}
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: '#010326',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Configuración de {selectedType.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {selectedType.description}
                  </Typography>
                </Box>
              </Stack>

              {/* Campos específicos según el tipo */}
              {formData.type === 'wompi' && (
                <Stack spacing={3}>
                  <TextField
                    label="Clave Pública"
                    value={formData.config.publicKey || ''}
                    onChange={(e) => handleInputChange('config', { ...formData.config, publicKey: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="pk_test_..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                  <TextField
                    label="Clave Privada"
                    type="password"
                    value={formData.config.privateKey || ''}
                    onChange={(e) => handleInputChange('config', { ...formData.config, privateKey: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="sk_test_..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                </Stack>
              )}

              {formData.type === 'bank_transfer' && (
                <Stack spacing={3}>
                  <TextField
                    label="Nombre del Banco"
                    value={formData.config.bankName || ''}
                    onChange={(e) => handleInputChange('config', { ...formData.config, bankName: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="Ej: Banco de Bogotá"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                  <TextField
                    label="Número de Cuenta"
                    value={formData.config.accountNumber || ''}
                    onChange={(e) => handleInputChange('config', { ...formData.config, accountNumber: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="1234567890"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                  <TextField
                    label="Titular de la Cuenta"
                    value={formData.config.accountHolder || ''}
                    onChange={(e) => handleInputChange('config', { ...formData.config, accountHolder: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="Nombre del titular"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontFamily: "'Mona Sans'"
                      }
                    }}
                  />
                </Stack>
              )}
            </Paper>
          )}

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
                  checked={formData.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
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
                    Habilitar método
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Los clientes podrán usar este método para realizar pagos
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Paper>
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
          disabled={actionLoading || !formData.name.trim()}
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

export default PaymentMethodConfigModal;
