import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Paper,
  Stack,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X,
  User,
  Envelope,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Camera,
  FileText,
  Download,
  Share,
  Printer,
  Eye,
  Star,
  Warning,
  Info,
  Check,
  XCircle,
  ArrowRight,
  DotsThreeVertical,
  Receipt,
  CreditCard,
  Bank,
  Money,
  QrCode,
  Bell,
  Heart,
  Bookmark,
  Copy,
  Link,
  PaperPlaneTilt,
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
  Minus,
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
  zIndex: 1400, // Z-index alto para estar por encima del navbar
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    maxHeight: '90vh',
  },
  '& .MuiBackdrop-root': {
    zIndex: 1399 // Backdrop con z-index alto
  }
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid #E9ECEF',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return { bg: '#FFF3CD', color: '#856404', border: '#FFEAA7' };
      case 'quoted':
        return { bg: '#D1ECF1', color: '#0C5460', border: '#B8DAFF' };
      case 'approved':
        return { bg: '#D4EDDA', color: '#155724', border: '#C3E6CB' };
      case 'in_production':
        return { bg: '#E2E3E5', color: '#383D41', border: '#D6D8DB' };
      case 'ready_for_delivery':
        return { bg: '#CCE5FF', color: '#004085', border: '#B3D7FF' };
      case 'delivered':
        return { bg: '#D1F2EB', color: '#0F5132', border: '#A7F3D0' };
      case 'completed':
        return { bg: '#D4EDDA', color: '#155724', border: '#C3E6CB' };
      case 'cancelled':
        return { bg: '#F8D7DA', color: '#721C24', border: '#F5C6CB' };
      case 'rejected':
        return { bg: '#F8D7DA', color: '#721C24', border: '#F5C6CB' };
      default:
        return { bg: '#F8F9FA', color: '#6C757D', border: '#E9ECEF' };
    }
  };

  const colors = getStatusColor(status);
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '32px',
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
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

const statusLabels = {
  'pending_approval': 'Pendiente Aprobación',
  'quoted': 'Cotizado',
  'approved': 'Aprobado',
  'in_production': 'En Producción',
  'ready_for_delivery': 'Listo para Entrega',
  'delivered': 'Entregado',
  'completed': 'Completado',
  'cancelled': 'Cancelado',
  'rejected': 'Rechazado'
};

const statusIcons = {
  'pending_approval': Clock,
  'quoted': CurrencyDollar,
  'approved': CheckCircle,
  'in_production': Package,
  'ready_for_delivery': Truck,
  'delivered': CheckCircle,
  'completed': CheckCircle,
  'cancelled': XCircle,
  'rejected': XCircle
};

const productionStages = [
  { key: 'sourcing_product', label: 'Adquisición de Producto', icon: Package },
  { key: 'preparing_materials', label: 'Preparación de Materiales', icon: Package },
  { key: 'printing', label: 'Impresión', icon: Printer },
  { key: 'sublimating', label: 'Sublimación', icon: Package },
  { key: 'quality_check', label: 'Control de Calidad', icon: CheckCircle },
  { key: 'packaging', label: 'Empaquetado', icon: Package }
];

export default function OrderDetailModal({ open, onClose, order }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!order) return null;

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status];
    return IconComponent ? <IconComponent size={20} /> : <Clock size={20} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <Money size={20} />;
      case 'card': return <CreditCard size={20} />;
      case 'transfer': return <Bank size={20} />;
      default: return <CurrencyDollar size={20} />;
    }
  };

  const getDeliveryTypeIcon = (type) => {
    return type === 'delivery' ? <Truck size={20} /> : <MapPin size={20} />;
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
              {order.orderNumber}
            </Typography>
            <StatusChip
              label={statusLabels[order.status]}
              status={order.status}
              icon={getStatusIcon(order.status)}
            />
          </Box>
          <IconButton onClick={onClose} size="large">
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Información del Cliente */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={20} />
                  Información del Cliente
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Nombre Completo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {order.user.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Envelope size={16} color="#6C757D" />
                    <Typography variant="body2">
                      {order.user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Teléfono
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone size={16} color="#6C757D" />
                    <Typography variant="body2">
                      {order.user.phone}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Fecha de Pedido
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} color="#6C757D" />
                    <Typography variant="body2">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Fecha Estimada de Entrega
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} color="#6C757D" />
                    <Typography variant="body2">
                      {formatDate(order.estimatedReadyDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </InfoCard>
          </Grid>

          {/* Información de Entrega */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getDeliveryTypeIcon(order.deliveryType)}
                  Información de Entrega
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tipo de Entrega
                  </Typography>
                  <Chip
                    label={order.deliveryType === 'delivery' ? 'Entrega a Domicilio' : 'Punto de Encuentro'}
                    color={order.deliveryType === 'delivery' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>

                {order.deliveryType === 'delivery' && order.deliveryAddress && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Dirección
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <MapPin size={16} color="#6C757D" style={{ marginTop: '2px' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.deliveryAddress.recipient}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.deliveryAddress.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.deliveryAddress.municipality}, {order.deliveryAddress.department}
                        </Typography>
                        {order.deliveryAddress.phoneNumber && (
                          <Typography variant="body2" color="text.secondary">
                            Tel: {order.deliveryAddress.phoneNumber}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {order.deliveryType === 'meetup' && order.meetupDetails && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Punto de Encuentro
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <MapPin size={16} color="#6C757D" style={{ marginTop: '2px' }} />
                      <Box>
                        {order.meetupDetails.location?.placeName && (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.meetupDetails.location.placeName}
                          </Typography>
                        )}
                        {order.meetupDetails.location?.address && (
                          <Typography variant="body2" color="text.secondary">
                            {order.meetupDetails.location.address}
                          </Typography>
                        )}
                        {order.meetupDetails.notes && (
                          <Typography variant="body2" color="text.secondary">
                            {order.meetupDetails.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {order.clientNotes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Notas del Cliente
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <FileText size={16} color="#6C757D" style={{ marginTop: '2px' }} />
                      <Typography variant="body2">
                        {order.clientNotes}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </InfoCard>
          </Grid>

          {/* Información de Pago */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getPaymentMethodIcon(order.payment.method)}
                  Información de Pago
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Método de Pago
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPaymentMethodIcon(order.payment.method)}
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {order.payment.method}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Estado del Pago
                  </Typography>
                  <Chip
                    label={order.payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    color={order.payment.status === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Momento de Pago
                  </Typography>
                  <Typography variant="body2">
                    {order.payment.timing === 'on_delivery' ? 'Al momento de entrega' : 'Anticipado'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.subtotal)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Envío:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.deliveryFee)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Impuestos:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.tax)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#28A745' }}>
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </InfoCard>
          </Grid>

          {/* Productos */}
          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={20} />
                  Productos del Pedido
                </Typography>
                
                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.product.images[0]}
                          sx={{ width: 56, height: 56 }}
                        >
                          <Package size={24} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {item.product.name}
                            </Typography>
                            <Chip
                              label={`Cantidad: ${item.quantity}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Diseño: {item.design.name}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Precio unitario: {formatCurrency(item.unitPrice)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#28A745' }}>
                                {formatCurrency(item.subtotal)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </InfoCard>
          </Grid>

          {/* Progreso de Producción */}
          {order.status === 'in_production' && (
            <Grid item xs={12}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Package size={20} />
                    Progreso de Producción
                  </Typography>
                  
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {productionStages.map((stage, index) => {
                      const stageData = order.items[0]?.productionStages?.[stage.key];
                      const isCompleted = stageData?.completed || false;
                      const IconComponent = stage.icon;
                      
                      return (
                        <Step key={stage.key} completed={isCompleted}>
                          <StepLabel
                            icon={
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? '#28A745' : '#E9ECEF',
                                color: isCompleted ? 'white' : '#6C757D'
                              }}>
                                <IconComponent size={16} />
                              </Box>
                            }
                          >
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {stage.label}
                              </Typography>
                              {stageData?.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  {stageData.notes}
                                </Typography>
                              )}
                              {stageData?.completedAt && (
                                <Typography variant="caption" color="text.secondary">
                                  Completado: {formatDate(stageData.completedAt)}
                                </Typography>
                              )}
                            </Box>
                          </StepLabel>
                          <StepContent>
                            {stageData?.photoUrl && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Foto del Progreso:
                                </Typography>
                                <Box
                                  component="img"
                                  src={stageData.photoUrl}
                                  alt={`${stage.label} - ${order.orderNumber}`}
                                  sx={{
                                    width: '100%',
                                    maxWidth: 300,
                                    height: 'auto',
                                    borderRadius: '8px',
                                    border: '1px solid #E9ECEF'
                                  }}
                                />
                              </Box>
                            )}
                          </StepContent>
                        </Step>
                      );
                    })}
                  </Stepper>
                </CardContent>
              </InfoCard>
            </Grid>
          )}

          {/* Fotos de Producción */}
          {order.productionPhotos && order.productionPhotos.length > 0 && (
            <Grid item xs={12}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Camera size={20} />
                    Fotos de Producción
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {order.productionPhotos.map((photo, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid #E9ECEF',
                            position: 'relative'
                          }}
                        >
                          <Box
                            component="img"
                            src={photo.url}
                            alt={`${photo.stage} - ${order.orderNumber}`}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: '8px',
                              mb: 2
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {photo.stage}
                          </Typography>
                          {photo.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {photo.notes}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={photo.clientApproved ? 'Aprobada' : 'Pendiente'}
                              color={photo.clientApproved ? 'success' : 'warning'}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(photo.uploadedAt)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </InfoCard>
            </Grid>
          )}

          {/* Historial de Estados */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Grid item xs={12}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={20} />
                    Historial de Estados
                  </Typography>
                  
                  <Box>
                    {order.statusHistory.map((entry, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          mr: 2,
                          minWidth: '60px'
                        }}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main', 
                            width: 40, 
                            height: 40,
                            mb: 1
                          }}>
                            {getStatusIcon(entry.status)}
                          </Avatar>
                          {index < order.statusHistory.length - 1 && (
                            <Box sx={{ 
                              width: 2, 
                              height: 40, 
                              bgcolor: 'divider',
                              mt: 1
                            }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {statusLabels[entry.status]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(entry.timestamp)}
                            </Typography>
                          </Box>
                          {entry.notes && (
                            <Typography variant="body2" color="text.secondary">
                              {entry.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </InfoCard>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <ActionButton onClick={onClose} className="secondary">
          Cerrar
        </ActionButton>
        <ActionButton startIcon={<Download size={16} />} className="secondary">
          Exportar PDF
        </ActionButton>
        <ActionButton startIcon={<Share size={16} />} className="secondary">
          Compartir
        </ActionButton>
        <ActionButton startIcon={<Printer size={16} />} className="primary">
          Imprimir
        </ActionButton>
      </DialogActions>
    </StyledDialog>
  );
}
