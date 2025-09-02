import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X,
  CurrencyDollar,
  Package,
  Truck,
  Receipt,
  Calculator,
  CheckCircle,
  Warning,
  Info,
  Plus,
  Minus,
  Percent,
  Tag,
  FileText,
  FloppyDisk,
  PaperPlaneTilt,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  Link,
  ChatTeardrop,
  PhoneCall,
  Video,
  Microphone,
  CameraSlash,
  ImageSquare,
  File,
  Folder,
  FolderOpen,
  HardDrive,
  Cloud,
  WifiHigh,
  WifiSlash,
  BatteryHigh,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  CellSignalHigh,
  CellSignalMedium,
  CellSignalLow,
  CellSignalNone,
  Bluetooth,
  BluetoothSlash,

  WifiSlash as WifiOff,
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Laptop,
  Monitor,
  Television,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSlash,

  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  SkipBackCircle,
  SkipForwardCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Record,
  Radio,
  MusicNote,
  MusicNotes,
  Headphones,
  MicrophoneSlash,
  Circle,
  CircleDashed,
  Square,
  CheckSquare,
  Minus as MinusIcon,
  Plus as PlusIcon,
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretDoubleUp,
  CaretDoubleDown,
  CaretDoubleLeft,
  CaretDoubleRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowBendUpRight,
  ArrowBendDownRight,
  ArrowBendUpLeft,
  ArrowBendDownLeft,
  ArrowSquareUp,
  ArrowSquareDown,
  ArrowSquareLeft,
  ArrowSquareRight,
  ArrowSquareUpLeft,
  ArrowSquareUpRight,
  ArrowSquareDownLeft,
  ArrowSquareDownRight,
  ArrowCircleUp,
  ArrowCircleDown,
  ArrowCircleLeft,
  ArrowCircleRight,
  ArrowCircleUpLeft,
  ArrowCircleUpRight,
  ArrowCircleDownLeft,
  ArrowCircleDownRight,
  ArrowElbowUpRight,
  ArrowElbowDownRight,
  ArrowElbowUpLeft,
  ArrowElbowDownLeft,
  ArrowFatUp,
  ArrowFatDown,
  ArrowFatLeft,
  ArrowFatRight,
  ArrowFatLinesUp,
  ArrowFatLinesDown,
  ArrowFatLinesLeft,
  ArrowFatLinesRight,
  ArrowFatLineUp,
  ArrowFatLineDown,
  ArrowFatLineLeft,
  ArrowFatLineRight
} from '@phosphor-icons/react';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    maxHeight: '90vh',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: '#E9ECEF',
    },
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  minWidth: 'auto',
  '&.primary': {
    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    },
  },
  '&.secondary': {
    backgroundColor: '#F8F9FA',
    color: '#6C757D',
    border: '1px solid #E9ECEF',
    '&:hover': {
      backgroundColor: '#E9ECEF',
    },
  },
  '&.success': {
    backgroundColor: '#28A745',
    color: 'white',
    '&:hover': {
      backgroundColor: '#218838',
    },
  },
  '&.danger': {
    backgroundColor: '#DC3545',
    color: 'white',
    '&:hover': {
      backgroundColor: '#C82333',
    },
  },
  '&.warning': {
    backgroundColor: '#FFC107',
    color: '#212529',
    '&:hover': {
      backgroundColor: '#E0A800',
    },
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: '1px solid #E9ECEF',
  backgroundColor: '#F8F9FA',
}));

export default function QuoteModal({ open, onClose, order, onQuote }) {
  const [formData, setFormData] = useState({
    totalPrice: order?.subtotal || 0,
    deliveryFee: 0,
    tax: 0,
    notes: '',
    estimatedDays: 7
  });

  const [errors, setErrors] = useState({});

  if (!order) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(formData.totalPrice) || 0;
    const delivery = parseFloat(formData.deliveryFee) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return subtotal + delivery + tax;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.totalPrice || formData.totalPrice <= 0) {
      newErrors.totalPrice = 'El precio total debe ser mayor a 0';
    }

    if (formData.deliveryFee < 0) {
      newErrors.deliveryFee = 'La tarifa de envío no puede ser negativa';
    }

    if (formData.tax < 0) {
      newErrors.tax = 'Los impuestos no pueden ser negativos';
    }

    if (formData.estimatedDays < 1) {
      newErrors.estimatedDays = 'Los días estimados deben ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const quoteData = {
        ...formData,
        total: calculateTotal(),
        orderId: order._id
      };
      
      onQuote(quoteData);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
              Cotizar Pedido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.orderNumber} - {order.user.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="large">
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Resumen del Pedido */}
          <Grid item xs={12} md={4}>
            <SummaryCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={20} />
                  Resumen del Pedido
                </Typography>

                <List dense>
                  {order.items.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.product.images[0]}
                          sx={{ width: 40, height: 40 }}
                        >
                          <Package size={20} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.product.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Cantidad: {item.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#28A745' }}>
                              {formatCurrency(item.subtotal)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tipo de Entrega
                  </Typography>
                  <Chip
                    label={order.deliveryType === 'delivery' ? 'Entrega a Domicilio' : 'Punto de Encuentro'}
                    color={order.deliveryType === 'delivery' ? 'primary' : 'secondary'}
                    size="small"
                    icon={order.deliveryType === 'delivery' ? <Truck size={16} /> : <Package size={16} />}
                  />
                </Box>

                {order.clientNotes && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Notas del Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      p: 2, 
                      backgroundColor: '#F8F9FA', 
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}>
                      {order.clientNotes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </SummaryCard>
          </Grid>

          {/* Formulario de Cotización */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Esta cotización será enviada al cliente para su aprobación. 
                  Asegúrate de incluir todos los costos necesarios.
                </Typography>
              </Alert>
            </Box>

            <Grid container spacing={3}>
              {/* Precio Base */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Precio Base de Productos"
                  type="number"
                  value={formData.totalPrice}
                  onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                  error={!!errors.totalPrice}
                  helperText={errors.totalPrice}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyDollar size={20} color="#6C757D" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Tarifa de Envío */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Tarifa de Envío"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                  error={!!errors.deliveryFee}
                  helperText={errors.deliveryFee}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Truck size={20} color="#6C757D" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Impuestos */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Impuestos"
                  type="number"
                  value={formData.tax}
                  onChange={(e) => handleInputChange('tax', e.target.value)}
                  error={!!errors.tax}
                  helperText={errors.tax}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Receipt size={20} color="#6C757D" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Días Estimados */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Días Estimados de Producción"
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => handleInputChange('estimatedDays', e.target.value)}
                  error={!!errors.estimatedDays}
                  helperText={errors.estimatedDays}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Package size={20} color="#6C757D" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Notas de Cotización */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Notas de la Cotización"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Incluye detalles sobre materiales, proceso, garantías, etc..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <FileText size={20} color="#6C757D" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Resumen de Costos */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calculator size={20} />
                Resumen de Costos
              </Typography>

              <Card sx={{ borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Precio Base:
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(formData.totalPrice || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tarifa de Envío:
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(formData.deliveryFee || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Impuestos:
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(formData.tax || 0)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#28A745' }}>
                        {formatCurrency(calculateTotal())}
                      </Typography>
                    </Box>
                  </Box>

                  <Alert severity="success" sx={{ borderRadius: '8px' }}>
                    <Typography variant="body2">
                      <strong>Cotización lista:</strong> El cliente recibirá esta cotización por email y podrá aceptarla o rechazarla.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <ActionButton onClick={onClose} className="secondary">
          Cancelar
        </ActionButton>
        <ActionButton 
          startIcon={<FloppyDisk size={16} />} 
          className="secondary"
          onClick={() => {
            // Aquí iría la lógica para guardar como borrador
            console.log('Guardar borrador');
          }}
        >
          Guardar Borrador
        </ActionButton>
        <ActionButton 
          startIcon={<PaperPlaneTilt size={16} />} 
          className="primary"
          onClick={handleSubmit}
        >
          Enviar Cotización
        </ActionButton>
      </DialogActions>
    </StyledDialog>
  );
}
