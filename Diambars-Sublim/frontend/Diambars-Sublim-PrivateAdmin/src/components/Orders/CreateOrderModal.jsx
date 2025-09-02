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
  ListItemAvatar,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Badge,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X,
  User,
  Package,
  Truck,
  MapPin,
  Calendar,
  CurrencyDollar,
  FileText,
  Plus,
  Minus,
  Search,
  CheckCircle,
  Warning,
  Info,
  Eye,
  Edit,
  Trash,
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
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalNone,
  Bluetooth,
  BluetoothSlash,
  Wifi,
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
  VolumeHigh,
  VolumeLow,
  VolumeSlash,
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
  MusicNote,
  MusicNotes,
  Headphones,
  MicrophoneSlash,
  RadioButton,
  RadioButtonChecked,
  Checkbox as CheckboxIcon,
  CheckboxChecked as CheckboxCheckedIcon,
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
  ArrowFatLineRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight
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

// Mock data
const mockUsers = [
  { _id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '+503 1234-5678' },
  { _id: '2', name: 'María González', email: 'maria@email.com', phone: '+503 8765-4321' },
  { _id: '3', name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+503 5555-1234' },
];

const mockDesigns = [
  { _id: '1', name: 'Logo Empresa', product: { name: 'Camiseta Básica' }, price: 20.00, status: 'quoted' },
  { _id: '2', name: 'Diseño Floral', product: { name: 'Taza Personalizada' }, price: 14.00, status: 'quoted' },
  { _id: '3', name: 'Logo Deportivo', product: { name: 'Hoodie Premium' }, price: 36.67, status: 'quoted' },
];

const mockAddresses = [
  { _id: '1', label: 'Casa', recipient: 'Juan Pérez', address: 'Calle Principal #123', municipality: 'San Salvador', department: 'San Salvador' },
  { _id: '2', label: 'Oficina', recipient: 'Juan Pérez', address: 'Av. Independencia #456', municipality: 'San Salvador', department: 'San Salvador' },
];

export default function CreateOrderModal({ open, onClose, onCreate }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Información del cliente
    targetUserId: '',
    isManualOrder: true,
    
    // Información del pedido
    designId: '',
    quantity: 1,
    deliveryType: 'meetup',
    addressId: '',
    meetupDetails: {
      date: '',
      address: '',
      placeName: '',
      notes: ''
    },
    clientNotes: '',
    paymentMethod: 'cash',
    paymentTiming: 'on_delivery'
  });

  const [errors, setErrors] = useState({});

  const steps = [
    'Seleccionar Cliente',
    'Seleccionar Diseño',
    'Configurar Entrega',
    'Confirmar Pedido'
  ];

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

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.targetUserId) {
          newErrors.targetUserId = 'Debe seleccionar un cliente';
        }
        break;
      case 1:
        if (!formData.designId) {
          newErrors.designId = 'Debe seleccionar un diseño';
        }
        if (!formData.quantity || formData.quantity < 1) {
          newErrors.quantity = 'La cantidad debe ser al menos 1';
        }
        break;
      case 2:
        if (formData.deliveryType === 'delivery' && !formData.addressId) {
          newErrors.addressId = 'Debe seleccionar una dirección para entrega a domicilio';
        }
        if (formData.deliveryType === 'meetup') {
          if (!formData.meetupDetails.address) {
            newErrors['meetupDetails.address'] = 'Debe especificar la dirección del punto de encuentro';
          }
          if (!formData.meetupDetails.placeName) {
            newErrors['meetupDetails.placeName'] = 'Debe especificar el nombre del lugar';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onCreate(formData);
      onClose();
    }
  };

  const selectedUser = mockUsers.find(user => user._id === formData.targetUserId);
  const selectedDesign = mockDesigns.find(design => design._id === formData.designId);
  const selectedAddress = mockAddresses.find(address => address._id === formData.addressId);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (selectedDesign) {
      return selectedDesign.price * formData.quantity;
    }
    return 0;
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
              Crear Nuevo Pedido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pedido manual para cliente mayor
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="large">
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={3}>
          {/* Contenido del Step */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={20} />
                  Seleccionar Cliente
                </Typography>
                
                <Alert severity="info" sx={{ borderRadius: '12px', mb: 3 }}>
                  <Typography variant="body2">
                    Selecciona el cliente para quien se creará este pedido manual.
                  </Typography>
                </Alert>

                <Autocomplete
                  options={mockUsers}
                  getOptionLabel={(option) => `${option.name} - ${option.email}`}
                  value={selectedUser || null}
                  onChange={(event, newValue) => {
                    handleInputChange('targetUserId', newValue?._id || '');
                  }}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Buscar Cliente"
                      placeholder="Escribe el nombre o email del cliente..."
                      error={!!errors.targetUserId}
                      helperText={errors.targetUserId}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={20} color="#6C757D" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          <User size={20} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email} • {option.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={20} />
                  Seleccionar Diseño
                </Typography>
                
                <Alert severity="info" sx={{ borderRadius: '12px', mb: 3 }}>
                  <Typography variant="body2">
                    Selecciona el diseño que el cliente desea personalizar. Solo se muestran diseños ya cotizados.
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={mockDesigns}
                      getOptionLabel={(option) => `${option.name} - ${option.product.name}`}
                      value={selectedDesign || null}
                      onChange={(event, newValue) => {
                        handleInputChange('designId', newValue?._id || '');
                      }}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          label="Buscar Diseño"
                          placeholder="Escribe el nombre del diseño..."
                          error={!!errors.designId}
                          helperText={errors.designId}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search size={20} color="#6C757D" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar sx={{ width: 40, height: 40 }}>
                              <Package size={20} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {option.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {option.product.name}
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#28A745' }}>
                              {formatCurrency(option.price)}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      fullWidth
                      label="Cantidad"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      fullWidth
                      label="Subtotal"
                      value={formatCurrency(calculateSubtotal())}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyDollar size={20} color="#6C757D" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Truck size={20} />
                  Configurar Entrega
                </Typography>
                
                <Alert severity="info" sx={{ borderRadius: '12px', mb: 3 }}>
                  <Typography variant="body2">
                    Configura cómo se entregará el pedido al cliente.
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Tipo de Entrega
                      </Typography>
                      <RadioGroup
                        value={formData.deliveryType}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                        row
                      >
                        <FormControlLabel
                          value="meetup"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MapPin size={16} />
                              <Typography>Punto de Encuentro</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="delivery"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Truck size={16} />
                              <Typography>Entrega a Domicilio</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {formData.deliveryType === 'delivery' && (
                    <Grid item xs={12}>
                      <Autocomplete
                        options={mockAddresses}
                        getOptionLabel={(option) => `${option.label} - ${option.address}`}
                        value={selectedAddress || null}
                        onChange={(event, newValue) => {
                          handleInputChange('addressId', newValue?._id || '');
                        }}
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Seleccionar Dirección"
                            placeholder="Selecciona una dirección guardada..."
                            error={!!errors.addressId}
                            helperText={errors.addressId}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MapPin size={20} color="#6C757D" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Avatar sx={{ width: 40, height: 40 }}>
                                <MapPin size={20} />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {option.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {option.address}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {option.municipality}, {option.department}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      />
                    </Grid>
                  )}

                  {formData.deliveryType === 'meetup' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Nombre del Lugar"
                          value={formData.meetupDetails.placeName}
                          onChange={(e) => handleNestedInputChange('meetupDetails', 'placeName', e.target.value)}
                          error={!!errors['meetupDetails.placeName']}
                          helperText={errors['meetupDetails.placeName']}
                          placeholder="Ej: Centro Comercial Metrocentro"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Fecha de Encuentro"
                          type="datetime-local"
                          value={formData.meetupDetails.date}
                          onChange={(e) => handleNestedInputChange('meetupDetails', 'date', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="Dirección del Punto de Encuentro"
                          value={formData.meetupDetails.address}
                          onChange={(e) => handleNestedInputChange('meetupDetails', 'address', e.target.value)}
                          error={!!errors['meetupDetails.address']}
                          helperText={errors['meetupDetails.address']}
                          placeholder="Ej: Av. Independencia, San Salvador"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="Notas del Encuentro"
                          multiline
                          rows={3}
                          value={formData.meetupDetails.notes}
                          onChange={(e) => handleNestedInputChange('meetupDetails', 'notes', e.target.value)}
                          placeholder="Instrucciones adicionales para el encuentro..."
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Notas del Cliente"
                      multiline
                      rows={3}
                      value={formData.clientNotes}
                      onChange={(e) => handleInputChange('clientNotes', e.target.value)}
                      placeholder="Notas adicionales del cliente sobre el pedido..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={20} />
                  Confirmar Pedido
                </Typography>
                
                <Alert severity="success" sx={{ borderRadius: '12px', mb: 3 }}>
                  <Typography variant="body2">
                    Revisa todos los detalles antes de crear el pedido.
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SummaryCard>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Información del Cliente
                        </Typography>
                        {selectedUser && (
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedUser.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedUser.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedUser.phone}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </SummaryCard>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SummaryCard>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Información del Producto
                        </Typography>
                        {selectedDesign && (
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedDesign.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedDesign.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Cantidad: {formData.quantity}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#28A745', mt: 1 }}>
                              {formatCurrency(calculateSubtotal())}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </SummaryCard>
                  </Grid>

                  <Grid item xs={12}>
                    <SummaryCard>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Información de Entrega
                        </Typography>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            Tipo: {formData.deliveryType === 'delivery' ? 'Entrega a Domicilio' : 'Punto de Encuentro'}
                          </Typography>
                          
                          {formData.deliveryType === 'delivery' && selectedAddress && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {selectedAddress.label}: {selectedAddress.address}
                              </Typography>
                            </Box>
                          )}
                          
                          {formData.deliveryType === 'meetup' && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Lugar: {formData.meetupDetails.placeName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Dirección: {formData.meetupDetails.address}
                              </Typography>
                              {formData.meetupDetails.date && (
                                <Typography variant="body2" color="text.secondary">
                                  Fecha: {new Date(formData.meetupDetails.date).toLocaleString('es-SV')}
                                </Typography>
                              )}
                            </Box>
                          )}
                          
                          {formData.clientNotes && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Notas: {formData.clientNotes}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </SummaryCard>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Resumen lateral */}
          <Grid item xs={12} md={4}>
            <SummaryCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Resumen del Pedido
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Cliente
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser?.name || 'No seleccionado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Producto
                  </Typography>
                  <Typography variant="body2">
                    {selectedDesign?.name || 'No seleccionado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad: {formData.quantity}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Envío:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Impuestos:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#28A745' }}>
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ borderRadius: '8px', mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Nota:</strong> Este pedido será creado en estado "Pendiente Aprobación" y requerirá cotización manual.
                  </Typography>
                </Alert>
              </CardContent>
            </SummaryCard>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <ActionButton onClick={onClose} className="secondary">
          Cancelar
        </ActionButton>
        
        {activeStep > 0 && (
          <ActionButton onClick={handleBack} className="secondary">
            Anterior
          </ActionButton>
        )}
        
        {activeStep < steps.length - 1 ? (
          <ActionButton onClick={handleNext} className="primary">
            Siguiente
          </ActionButton>
        ) : (
          <ActionButton onClick={handleSubmit} className="success">
            Crear Pedido
          </ActionButton>
        )}
      </DialogActions>
    </StyledDialog>
  );
}
