// components/PaymentMethodModals/WompiConfigModal.jsx - Modal para configuración de Wompi
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Paper,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CreditCard, 
  Eye, 
  EyeSlash, 
  CheckCircle, 
  XCircle,
  Info,
  Copy,
  ExternalLink
} from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';
import { usePaymentConfigActions } from '../../hooks/usePaymentConfig';
import toast from 'react-hot-toast';

const WompiConfigModal = ({ open, onClose, selectedMethod, mode }) => {
  const { updateConfig, loading } = usePaymentConfigActions();
  const [formData, setFormData] = useState({
    publicKey: '',
    privateKey: '',
    webhookSecret: '',
    environment: 'sandbox',
    enabled: false
  });
  const [showSecrets, setShowSecrets] = useState({
    privateKey: false,
    webhookSecret: false
  });
  const [validation, setValidation] = useState({
    publicKey: null,
    privateKey: null,
    webhookSecret: null
  });

  // Cargar datos existentes
  useEffect(() => {
    if (selectedMethod && selectedMethod.config) {
      setFormData({
        publicKey: selectedMethod.config.publicKey || '',
        privateKey: selectedMethod.config.privateKey || '',
        webhookSecret: selectedMethod.config.webhookSecret || '',
        environment: selectedMethod.config.environment || 'sandbox',
        enabled: selectedMethod.enabled || false
      });
    }
  }, [selectedMethod]);

  // Validar claves de Wompi
  const validateWompiKey = (key, type) => {
    if (!key) return null;
    
    const patterns = {
      publicKey: /^pub_(sandbox|production)_[a-zA-Z0-9]{32}$/,
      privateKey: /^prv_(sandbox|production)_[a-zA-Z0-9]{32}$/,
      webhookSecret: /^[a-zA-Z0-9]{32,}$/
    };

    const isValid = patterns[type]?.test(key);
    return isValid;
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real
    if (field === 'publicKey' || field === 'privateKey' || field === 'webhookSecret') {
      const isValid = validateWompiKey(value, field);
      setValidation(prev => ({ ...prev, [field]: isValid }));
    }
  };

  // Manejar envío
  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.publicKey || !formData.privateKey) {
        toast.error('Las claves pública y privada son requeridas');
        return;
      }

      // Validar formato de claves
      if (!validateWompiKey(formData.publicKey, 'publicKey')) {
        toast.error('Formato de clave pública inválido');
        return;
      }

      if (!validateWompiKey(formData.privateKey, 'privateKey')) {
        toast.error('Formato de clave privada inválido');
        return;
      }

      const configData = {
        type: 'wompi',
        name: 'Wompi Digital',
        enabled: formData.enabled,
        config: {
          publicKey: formData.publicKey,
          privateKey: formData.privateKey,
          webhookSecret: formData.webhookSecret,
          environment: formData.environment,
          currency: 'USD',
          country: 'SV'
        },
        message: 'Pagos digitales seguros con tarjetas de crédito y débito'
      };

      await updateConfig('wompi', configData);
      toast.success('Configuración de Wompi guardada correctamente');
      onClose();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
    }
  };

  // Copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  // Toggle mostrar/ocultar secretos
  const toggleSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isFormValid = formData.publicKey && formData.privateKey && 
    validation.publicKey !== false && validation.privateKey !== false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 100, 191, 0.08)'
        }
      }}
    >
      <DialogTitle sx={{ p: 4, pb: 2 }}>
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
            <CreditCard size={24} weight="duotone" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: "'Mona Sans'", fontWeight: 700 }}>
              Configuración de Wompi
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontFamily: "'Mona Sans'" }}>
              Configura las credenciales para procesar pagos digitales
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 2 }}>
        <Stack spacing={4}>
          {/* Información sobre Wompi */}
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': { fontFamily: "'Mona Sans'" }
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                ¿Qué es Wompi?
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                Wompi es una pasarela de pagos que permite a tus clientes pagar con tarjetas de crédito, 
                débito y otros métodos digitales de forma segura.
              </Typography>
            </Stack>
          </Alert>

          {/* Estado actual */}
          <Paper sx={{ p: 3, borderRadius: 2, background: alpha('#1F64BF', 0.04) }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                Estado Actual
              </Typography>
              <Chip
                label={formData.enabled ? 'Habilitado' : 'Deshabilitado'}
                color={formData.enabled ? 'success' : 'default'}
                size="small"
              />
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", color: '#64748B' }}>
                  Clave Pública
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                  {formData.publicKey ? 'Configurada' : 'No configurada'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", color: '#64748B' }}>
                  Clave Privada
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                  {formData.privateKey ? 'Configurada' : 'No configurada'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Divider />

          {/* Formulario de configuración */}
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Credenciales de Wompi
            </Typography>

            {/* Clave Pública */}
            <TextField
              label="Clave Pública (Public Key)"
              value={formData.publicKey}
              onChange={(e) => handleChange('publicKey', e.target.value)}
              fullWidth
              placeholder="pub_sandbox_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              helperText="Obtén esta clave desde el dashboard de Wompi"
              error={validation.publicKey === false}
              InputProps={{
                endAdornment: (
                  <Stack direction="row" spacing={1}>
                    {validation.publicKey === true && (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                    {validation.publicKey === false && (
                      <XCircle size={20} color="#EF4444" />
                    )}
                    {formData.publicKey && (
                      <Tooltip title="Copiar">
                        <IconButton size="small" onClick={() => copyToClipboard(formData.publicKey)}>
                          <Copy size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Mona Sans'",
                  fontSize: '0.9rem'
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Mona Sans'"
                }
              }}
            />

            {/* Clave Privada */}
            <TextField
              label="Clave Privada (Private Key)"
              type={showSecrets.privateKey ? 'text' : 'password'}
              value={formData.privateKey}
              onChange={(e) => handleChange('privateKey', e.target.value)}
              fullWidth
              placeholder="prv_sandbox_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              helperText="Mantén esta clave segura - no la compartas"
              error={validation.privateKey === false}
              InputProps={{
                endAdornment: (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={showSecrets.privateKey ? 'Ocultar' : 'Mostrar'}>
                      <IconButton size="small" onClick={() => toggleSecret('privateKey')}>
                        {showSecrets.privateKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </Tooltip>
                    {validation.privateKey === true && (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                    {validation.privateKey === false && (
                      <XCircle size={20} color="#EF4444" />
                    )}
                    {formData.privateKey && (
                      <Tooltip title="Copiar">
                        <IconButton size="small" onClick={() => copyToClipboard(formData.privateKey)}>
                          <Copy size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Mona Sans'",
                  fontSize: '0.9rem'
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Mona Sans'"
                }
              }}
            />

            {/* Webhook Secret */}
            <TextField
              label="Webhook Secret (Opcional)"
              type={showSecrets.webhookSecret ? 'text' : 'password'}
              value={formData.webhookSecret}
              onChange={(e) => handleChange('webhookSecret', e.target.value)}
              fullWidth
              placeholder="Tu webhook secret de Wompi"
              helperText="Para validar webhooks de Wompi (recomendado para producción)"
              InputProps={{
                endAdornment: (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={showSecrets.webhookSecret ? 'Ocultar' : 'Mostrar'}>
                      <IconButton size="small" onClick={() => toggleSecret('webhookSecret')}>
                        {showSecrets.webhookSecret ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </Tooltip>
                    {formData.webhookSecret && (
                      <Tooltip title="Copiar">
                        <IconButton size="small" onClick={() => copyToClipboard(formData.webhookSecret)}>
                          <Copy size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Mona Sans'",
                  fontSize: '0.9rem'
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Mona Sans'"
                }
              }}
            />

            {/* Enlaces útiles */}
            <Paper sx={{ p: 3, borderRadius: 2, background: alpha('#F59E0B', 0.04) }}>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 2 }}>
                Enlaces Útiles
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExternalLink size={16} />}
                  href="https://dashboard.wompi.co"
                  target="_blank"
                  sx={{ 
                    justifyContent: 'flex-start',
                    fontFamily: "'Mona Sans'",
                    textTransform: 'none'
                  }}
                >
                  Dashboard de Wompi
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Info size={16} />}
                  href="https://docs.wompi.co"
                  target="_blank"
                  sx={{ 
                    justifyContent: 'flex-start',
                    fontFamily: "'Mona Sans'",
                    textTransform: 'none'
                  }}
                >
                  Documentación de Wompi
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontFamily: "'Mona Sans'",
            textTransform: 'none'
          }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || loading}
          sx={{
            background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontFamily: "'Mona Sans'",
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)'
            }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WompiConfigModal;
