// src/components/Orders/ManualOrderForm.jsx - Modal para crear pedidos manuales
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Alert,
  styled,
  alpha
} from '@mui/material';
import {
  X,
  Palette,
  CurrencyDollar,
  Truck,
  Receipt,
  MagnifyingGlass,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  MapPin
} from '@phosphor-icons/react';

import { useManualOrder, useDesignManagement } from '../../../hooks/useManualOrder';
import useAddresses from '../../../hooks/useAddresses';
import AddressFormModal from '../../AddressManagement/AddressFormModal/AddressFormModal';
import KonvaDesignViewer from '../../../components/KonvaDesignEditor/components/KonvaDesignViewer';
import Swal from 'sweetalert2';

// Configurar SweetAlert2 para que aparezca por encima de los modales
Swal.mixin({
  customClass: {
    popup: 'swal2-popup-high-zindex'
  }
});

// Agregar estilos CSS para SweetAlert2
const swal2Styles = `
  .swal2-popup-high-zindex {
    z-index: 10000 !important;
  }
  .swal2-container {
    z-index: 10000 !important;
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = swal2Styles;
  document.head.appendChild(style);
}

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.12)',
    maxWidth: '900px',
    zIndex: 1300, // Z-index del modal principal
    width: '90%',
    maxHeight: '90vh'
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 32px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#010326'
}));

const SelectionCard = styled(Card)(({ theme, selected }) => ({
  border: selected ? `2px solid #1F64BF` : `1px solid ${alpha('#1F64BF', 0.08)}`,
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.12)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: "'Mona Sans'",
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2),
    },
    '&:hover fieldset': {
      borderColor: '#1F64BF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF',
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    '&.Mui-focused': {
      color: '#1F64BF',
    }
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
  },
  '&:disabled': {
    background: alpha('#1F64BF', 0.3),
    boxShadow: 'none',
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: '#1F64BF',
  borderColor: alpha('#1F64BF', 0.3),
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    borderColor: '#1F64BF',
    backgroundColor: alpha('#1F64BF', 0.05),
  }
}));

// ================ COMPONENTE PRINCIPAL ================
const ManualOrderForm = ({ open, onClose, onOrderCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [designSearchQuery, setDesignSearchQuery] = useState('');
  const [previewDesign, setPreviewDesign] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados para dirección de entrega
  const [deliveryType, setDeliveryType] = useState('meetup'); // 'meetup' o 'delivery'
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Estados para método de pago
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'bank_transfer', 'wompi'
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Log para diagnosticar estados
  console.log('🔍 [ManualOrderForm] Estados actuales:', {
    showPreview,
    previewDesign: previewDesign?.name || 'null'
  });

  // Hooks principales
  const {
    loading: orderLoading,
    orderData,
    estimatedPrice,
    selectedDesign,
    createManualOrder,
    updateOrderData,
    selectDesign,
    resetForm,
    isFormComplete,
    validateCurrentData
  } = useManualOrder();

  const {
    designs,
    loading: designsLoading,
    searchDesigns
  } = useDesignManagement();

  const {
    addresses: allAddresses,
    loading: addressesLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    fetchUserAddresses
  } = useAddresses();

  // Estado local para direcciones del usuario del diseño seleccionado
  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressDetails, setShowAddressDetails] = useState(false);

  // Efecto para cargar direcciones del usuario del diseño seleccionado
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (selectedDesign?.user?._id) {
        console.log('📍 [ManualOrderForm] Cargando direcciones para usuario:', selectedDesign.user.name, selectedDesign.user._id);
        try {
          const addresses = await fetchUserAddresses(selectedDesign.user._id);
          setUserAddresses(addresses);
          console.log('✅ [ManualOrderForm] Direcciones cargadas:', addresses.length);
          
          // Limpiar dirección seleccionada si no pertenece al nuevo usuario
          if (selectedAddress && !addresses.some(addr => addr.id === selectedAddress.id)) {
            setSelectedAddress(null);
            console.log('🔄 [ManualOrderForm] Dirección seleccionada limpiada (no pertenece al usuario)');
          }
        } catch (error) {
          console.error('❌ [ManualOrderForm] Error cargando direcciones:', error);
          setUserAddresses([]);
        }
      } else {
        setUserAddresses([]);
        setSelectedAddress(null);
      }
    };

    loadUserAddresses();
  }, [selectedDesign?.user?._id, fetchUserAddresses, selectedAddress]);

  // Steps configuration - 4 pasos refactorizados
  const steps = [
    { label: 'Diseño', icon: Palette, description: 'Seleccionar diseño existente' },
    { label: 'Dirección', icon: Truck, description: 'Configurar entrega' },
    { label: 'Pago', icon: CurrencyDollar, description: 'Método de pago' },
    { label: 'Confirmar', icon: Check, description: 'Revisar y crear' }
  ];

  // Effects
  useEffect(() => {
    if (designSearchQuery.length >= 2) {
      searchDesigns(designSearchQuery);
    }
  }, [designSearchQuery, searchDesigns]);

  // Handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDesignSelect = (design) => {
    selectDesign(design);
    setCurrentStep(1);
  };

  const handleCreateOrder = async () => {
    try {
      // Construir datos del pedido con la información del formulario
      const orderData = {
        // Información del diseño seleccionado
        designId: selectedDesign?._id,
        userId: selectedDesign?.user?._id, // El backend espera userId
        productId: selectedDesign?.product?._id,
        
        // Precio del diseño
        estimatedPrice: selectedDesign?.price || 0,
        
        // Información de entrega
        deliveryType: deliveryType,
        deliveryAddress: selectedAddress ? {
          recipient: selectedAddress.recipient,
          address: selectedAddress.address,
          municipality: selectedAddress.municipality,
          department: selectedAddress.department,
          phoneNumber: selectedAddress.phoneNumber || selectedAddress.formattedPhone
        } : null,
        
        // Método de pago
        paymentMethod: paymentMethod,
        paymentData: {
          method: paymentMethod,
          amount: selectedDesign?.price || 0,
          currency: 'USD',
          timing: paymentMethod === 'cash' ? 'on_delivery' : 'advance', // Efectivo contra entrega, otros por adelantado
          paymentType: selectedDesign?.price > 50 ? 'partial' : 'full', // Pedidos grandes requieren pago parcial
          percentage: selectedDesign?.price > 50 ? 30 : 100, // 30% adelanto para pedidos grandes
          // Para efectivo no necesitamos datos adicionales
          ...(paymentMethod === 'bank_transfer' && {
            bankAccount: 'Cuenta bancaria configurada',
            reference: `Transferencia para pedido manual`
          }),
          ...(paymentMethod === 'wompi' && {
            gateway: 'wompi',
            requiresAdvance: selectedDesign?.price > 50
          })
        },
        
        // Información adicional
        quantity: 1, // Por defecto 1
        notes: `Pedido manual creado desde diseño: ${selectedDesign?.name}`,
        
        // Metadatos
        isManualOrder: true,
        createdByAdmin: true
      };

      console.log('📝 [ManualOrderForm] Datos del pedido:', orderData);
      
      const orderCreated = await createManualOrder(orderData);
      if (orderCreated) {
        onOrderCreated?.(orderCreated);
        handleClose();
      }
    } catch (error) {
      console.error('Error creando orden:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    setCurrentStep(0);
    setDesignSearchQuery('');
    onClose();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedDesign !== null;
      case 1: return deliveryType && (deliveryType === 'meetup' || selectedAddress);
      case 2: return paymentMethod; // Método de pago seleccionado
      case 3: return true; // Paso final
      default: return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Seleccionar Diseño
            </Typography>
            
            {/* Búsqueda de diseños */}
            <StyledTextField
              fullWidth
              label="Buscar diseño"
              value={designSearchQuery}
              onChange={(e) => setDesignSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, cliente o producto..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={18} color="#032CA6" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            {/* Lista de diseños */}
            {designsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            <Grid container spacing={2}>
              {Array.isArray(designs) && designs.map((design) => (
                <Grid item xs={12} sm={6} md={4} key={design._id}>
                  <SelectionCard 
                    selected={selectedDesign?._id === design._id}
                    onClick={() => handleDesignSelect(design)}
                  >
                    <CardContent>
                      {/* Imagen del producto base */}
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        {design.product?.images?.[0] && (
                        <Box
                          component="img"
                            src={design.product.images[0]}
                            alt={design.product.name}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                          }}
                        />
                      )}
                        
                        {/* Botón para ver vista previa */}
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que se seleccione el diseño
                            console.log('🔍 [ManualOrderForm] Botón de vista previa clickeado');
                            console.log('🎨 [ManualOrderForm] Diseño seleccionado:', design);
                            setPreviewDesign(design);
                            setShowPreview(true);
                            console.log('✅ [ManualOrderForm] Estados actualizados - showPreview:', true);
                          }}
                        >
                          <Eye size={16} color="#032CA6" />
                        </IconButton>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'", mb: 1 }}>
                        {design.name}
                          </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Cliente: {design.user?.name || 'Sin nombre'}
                          </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Producto: {design.product?.name || 'Sin producto'}
                      </Typography>
                      {design.price && (
                            <Chip 
                          label={`+${design.price}`}
                          color="secondary"
                              size="small"
                              variant="outlined"
                            />
                      )}
                    </CardContent>
                  </SelectionCard>
                </Grid>
              ))}
            </Grid>

            {Array.isArray(designs) && designs.length === 0 && !designsLoading && (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                No hay diseños disponibles. Busca por nombre, cliente o producto.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Dirección de Entrega
            </Typography>
            
            {/* Tipo de entrega */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Tipo de Entrega
              </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: deliveryType === 'meetup' ? '2px solid #032CA6' : '1px solid #e0e0e0',
                      backgroundColor: deliveryType === 'meetup' ? alpha('#032CA6', 0.05) : 'white'
                    }}
                    onClick={() => setDeliveryType('meetup')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Truck size={24} color={deliveryType === 'meetup' ? '#032CA6' : '#666'} />
                      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                        Punto de Entrega
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reunión en ubicación específica
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card 
                            sx={{
                      cursor: 'pointer',
                      border: deliveryType === 'delivery' ? '2px solid #032CA6' : '1px solid #e0e0e0',
                      backgroundColor: deliveryType === 'delivery' ? alpha('#032CA6', 0.05) : 'white'
                    }}
                    onClick={() => setDeliveryType('delivery')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Truck size={24} color={deliveryType === 'delivery' ? '#032CA6' : '#666'} />
                      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                        Delivery
                          </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Entrega a domicilio
                          </Typography>
                    </CardContent>
                  </Card>
                </Grid>
            </Grid>
          </Box>

            {/* Direcciones guardadas */}
            <Box sx={{ mb: 3 }}>
              {!showAddressDetails ? (
                // Vista de selección de direcciones
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Direcciones Guardadas
            </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddressModal(true)}
                      startIcon={<Truck size={16} />}
                    >
                      Nueva Dirección
                    </Button>
                  </Box>

                  {addressesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
                  ) : (
            <Grid container spacing={2}>
                      {userAddresses?.map((address) => (
                        <Grid item xs={12} sm={6} key={address._id}>
                          <Card 
                          sx={{
                              cursor: 'pointer',
                              border: selectedAddress?._id === address._id ? '2px solid #032CA6' : '1px solid #e0e0e0',
                              backgroundColor: selectedAddress?._id === address._id ? alpha('#032CA6', 0.05) : 'white'
                            }}
                            onClick={() => {
                              setSelectedAddress(address);
                              setShowAddressDetails(true);
                            }}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                {address.label || 'Dirección'}
                      </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {address.recipient}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {address.address}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {address.municipality}, {address.department}
                              </Typography>
                              {address.isDefault && (
                        <Chip 
                                  label="Predeterminada" 
                          size="small"
                                  color="primary" 
                                  sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                          </Card>
                </Grid>
              ))}
            </Grid>
                  )}

                  {userAddresses?.length === 0 && !addressesLoading && (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                      No hay direcciones guardadas. Crea una nueva dirección.
              </Alert>
            )}
                </>
              ) : (
                // Vista de detalles de la dirección seleccionada
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                      Dirección Seleccionada
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddressDetails(false)}
                      startIcon={<ArrowLeft size={16} />}
                    >
                      Cambiar Dirección
                    </Button>
                  </Box>

                  {selectedAddress && (
                    <Card sx={{ border: '2px solid #032CA6', backgroundColor: alpha('#032CA6', 0.05) }}>
                      <CardContent sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <MapPin size={20} color="#032CA6" />
                          <Typography variant="h6" sx={{ ml: 1, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                            {selectedAddress.label || 'Dirección'}
                          </Typography>
                          {selectedAddress.isDefault && (
                            <Chip 
                              label="Predeterminada" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Destinatario:
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {selectedAddress.recipient}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📞 {selectedAddress.formattedPhone || selectedAddress.phoneNumber}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Dirección:
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {selectedAddress.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedAddress.municipality}, {selectedAddress.department}
                          </Typography>
                        </Box>

                        {selectedAddress.additionalDetails && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Detalles Adicionales:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedAddress.additionalDetails}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Creada: {selectedAddress.formattedDate}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setShowAddressDetails(false)}
                            sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}
                          >
                            Confirmar Dirección
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Método de Pago
            </Typography>

            {/* Información del pedido */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: alpha('#032CA6', 0.05), borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Resumen del Pedido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Diseño: {selectedDesign?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: {selectedDesign?.user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Precio: ${selectedDesign?.price || 0}
              </Typography>
              {selectedDesign?.price > 50 && (
                <Alert severity="warning" sx={{ mt: 1, borderRadius: '8px' }}>
                  Pedido grande detectado. Se requiere adelanto del 30% (${Math.round(selectedDesign.price * 0.3)})
                </Alert>
              )}
            </Box>

            {/* Métodos de pago */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: paymentMethod === 'cash' ? '2px solid #032CA6' : '1px solid #e0e0e0',
                    backgroundColor: paymentMethod === 'cash' ? alpha('#032CA6', 0.05) : 'white'
                  }}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CurrencyDollar size={24} color={paymentMethod === 'cash' ? '#032CA6' : '#666'} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Efectivo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pago contra entrega
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: paymentMethod === 'bank_transfer' ? '2px solid #032CA6' : '1px solid #e0e0e0',
                    backgroundColor: paymentMethod === 'bank_transfer' ? alpha('#032CA6', 0.05) : 'white'
                  }}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Receipt size={24} color={paymentMethod === 'bank_transfer' ? '#032CA6' : '#666'} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Transferencia
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Datos bancarios
                    </Typography>
                  </CardContent>
                </Card>
                  </Grid>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: paymentMethod === 'wompi' ? '2px solid #032CA6' : '1px solid #e0e0e0',
                    backgroundColor: paymentMethod === 'wompi' ? alpha('#032CA6', 0.05) : 'white'
                  }}
                  onClick={() => setPaymentMethod('wompi')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CurrencyDollar size={24} color={paymentMethod === 'wompi' ? '#032CA6' : '#666'} />
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                      Tarjeta
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wompi/PayPal
                    </Typography>
                  </CardContent>
                </Card>
                  </Grid>
                  </Grid>

            {/* Indicaciones específicas según el método seleccionado */}
            {paymentMethod && (
              <Box sx={{ mt: 3 }}>
                {paymentMethod === 'cash' && (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      💰 Pago en Efectivo
                    </Typography>
                    <Typography variant="body2">
                      El cliente pagará contra entrega al recibir el producto. No se requiere pago anticipado.
                    </Typography>
                  </Alert>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      🏦 Transferencia Bancaria
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      El cliente debe realizar una transferencia bancaria a la cuenta configurada.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ⚠️ Los datos bancarios se proporcionarán de forma segura después de confirmar el pedido.
                    </Typography>
                  </Alert>
                )}

                {paymentMethod === 'wompi' && (
                  <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      💳 Pago con Tarjeta (Wompi)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Se utilizará una tarjeta guardada del cliente para procesar el pago.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ⚠️ Solo se pueden usar tarjetas previamente guardadas por el cliente.
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                      🔒 El admin NO puede crear nuevas tarjetas por seguridad.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        // TODO: Implementar selección de tarjetas guardadas
                        console.log('🔍 [ManualOrderForm] Seleccionar tarjeta guardada para:', selectedDesign?.user?.name);
                      }}
                    >
                      Seleccionar Tarjeta Guardada
                    </Button>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Confirmar Pedido
            </Typography>

            {/* Resumen completo */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Diseño Seleccionado
                </Typography>
                  <Typography variant="body2" color="text.secondary">
                      {selectedDesign?.name}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliente: {selectedDesign?.user?.name}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Producto: {selectedDesign?.product?.name}
                    </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                    Precio: ${selectedDesign?.price || 0}
                    </Typography>
                </Card>
                  </Grid>
                  
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Dirección de Entrega
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {deliveryType === 'meetup' ? 'Punto de Entrega' : 'Delivery'}
                    </Typography>
                  {selectedAddress && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAddress.name}
                    </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAddress.address}
                    </Typography>
                    </>
                )}
            </Card>
                  </Grid>
                  
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Método de Pago
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {paymentMethod === 'cash' ? 'Efectivo' : 
                     paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 
                     'Tarjeta de Crédito/Débito'}
                    </Typography>
                  {selectedDesign?.price > 50 && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                      ⚠️ Pedido grande - Adelanto requerido: ${Math.round(selectedDesign.price * 0.3)}
                    </Typography>
                  )}
                </Card>
                  </Grid>
                </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitleStyled>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Receipt size={24} color="#1F64BF" />
          <Typography variant="h5" component="div" sx={{ fontFamily: "'Mona Sans'", fontWeight: 700 }}>
            Crear Pedido Manual
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#032CA6' }}>
          <X size={24} />
        </IconButton>
      </DialogTitleStyled>

      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontFamily: "'Mona Sans'",
                      fontWeight: 600
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box sx={{ minHeight: '400px', maxHeight: '60vh', overflow: 'auto' }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SecondaryButton
            onClick={currentStep === 0 ? handleClose : handleBack}
            startIcon={currentStep === 0 ? <X size={16} /> : <ArrowLeft size={16} />}
          >
            {currentStep === 0 ? 'Cancelar' : 'Atrás'}
          </SecondaryButton>

          {currentStep < steps.length - 1 ? (
            <PrimaryButton
              onClick={handleNext}
              disabled={!canProceedToNext()}
              endIcon={<ArrowRight size={16} />}
            >
              Siguiente
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={handleCreateOrder}
              disabled={!canProceedToNext() || orderLoading}
              startIcon={orderLoading ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
            >
              {orderLoading ? 'Creando...' : 'Crear Pedido'}
            </PrimaryButton>
          )}
        </Box>
      </DialogActions>

      {/* Vista Previa con KonvaDesignViewer */}
      {showPreview && previewDesign && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {console.log('🎨 [ManualOrderForm] Renderizando KonvaDesignViewer con:', previewDesign)}
          <Box
            sx={{
              width: '90%',
              height: '90%',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <KonvaDesignViewer 
              isOpen={showPreview}
              onClose={() => {
                console.log('❌ [ManualOrderForm] Cerrando vista previa');
                setShowPreview(false);
              }}
              design={previewDesign}
              product={previewDesign?.product}
              enableDownload={true}
            />
          </Box>
        </Box>
      )}

      {/* Modal de creación de direcciones */}
      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={async (addressData, mode) => {
          console.log('✅ [ManualOrderForm] Nueva dirección creada:', addressData, 'Modo:', mode);
          
          try {
            // Usar el hook createAddress para crear la dirección
            const createdAddress = await createAddress(addressData);
            console.log('✅ [ManualOrderForm] Dirección creada exitosamente:', createdAddress);
            
            setSelectedAddress(createdAddress);
            setShowAddressModal(false);
            
            // Recargar direcciones del usuario
            if (selectedDesign?.user?._id) {
              const updatedAddresses = await fetchUserAddresses(selectedDesign.user._id);
              setUserAddresses(updatedAddresses);
              console.log('🔄 [ManualOrderForm] Direcciones actualizadas tras crear nueva');
            }
          } catch (error) {
            console.error('❌ [ManualOrderForm] Error creando dirección:', error);
            throw error; // Re-lanzar el error para que el modal lo maneje
          }
        }}
        editMode={false}
        addressToEdit={null}
        users={selectedDesign?.user ? [{
          ...selectedDesign.user,
          id: selectedDesign.user._id || selectedDesign.user.id // Asegurar que tenga ambos
        }] : []} // Solo el usuario del diseño
        loadingUsers={false}
        preSelectedUserId={selectedDesign?.user?._id} // Pre-seleccionar usuario del diseño
      />
    </StyledDialog>
  );
};

export default ManualOrderForm;