// src/components/Orders/ManualOrderForm.jsx - Modal para crear pedidos manuales
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
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

// Configurar SweetAlert2
Swal.mixin({
  customClass: {
    popup: 'swal2-popup-high-zindex'
  }
});

const swal2Styles = `
  .swal2-popup-high-zindex {
    z-index: 10000 !important;
  }
  .swal2-container {
    z-index: 10000 !important;
  }
`;

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
    zIndex: 1300,
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
  height: '100%',
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
  
  const [deliveryType, setDeliveryType] = useState('meetup');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const {
    loading: orderLoading,
    selectedDesign,
    createManualOrder,
    selectDesign,
    resetForm
  } = useManualOrder();

  const {
    designs,
    loading: designsLoading,
    searchDesigns
  } = useDesignManagement();

  const {
    loading: addressesLoading,
    createAddress,
    fetchUserAddresses
  } = useAddresses();

  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressDetails, setShowAddressDetails] = useState(false);

  useEffect(() => {
    const loadUserAddresses = async () => {
      if (selectedDesign?.user?._id) {
        try {
          const addresses = await fetchUserAddresses(selectedDesign.user._id);
          setUserAddresses(addresses);
          
          if (selectedAddress && !addresses.some(addr => addr.id === selectedAddress.id)) {
            setSelectedAddress(null);
          }
        } catch (error) {
          console.error('Error cargando direcciones:', error);
          setUserAddresses([]);
        }
      } else {
        setUserAddresses([]);
        setSelectedAddress(null);
      }
    };

    loadUserAddresses();
  }, [selectedDesign?.user?._id, fetchUserAddresses, selectedAddress]);

  const steps = [
    { label: 'Diseño', icon: Palette },
    { label: 'Dirección', icon: Truck },
    { label: 'Pago', icon: CurrencyDollar },
    { label: 'Confirmar', icon: Check }
  ];

  useEffect(() => {
    if (designSearchQuery.length >= 2) {
      searchDesigns(designSearchQuery);
    }
  }, [designSearchQuery, searchDesigns]);

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
      const orderData = {
        designId: selectedDesign?._id,
        userId: selectedDesign?.user?._id,
        productId: selectedDesign?.product?._id,
        estimatedPrice: selectedDesign?.price || 0,
        deliveryType: deliveryType,
        deliveryAddress: selectedAddress ? {
          recipient: selectedAddress.recipient,
          address: selectedAddress.address,
          municipality: selectedAddress.municipality,
          department: selectedAddress.department,
          phoneNumber: selectedAddress.phoneNumber || selectedAddress.formattedPhone
        } : null,
        paymentMethod: paymentMethod,
        paymentData: {
          method: paymentMethod,
          amount: selectedDesign?.price || 0,
          currency: 'USD',
          timing: paymentMethod === 'cash' ? 'on_delivery' : 'advance',
          paymentType: selectedDesign?.price > 50 ? 'partial' : 'full',
          percentage: selectedDesign?.price > 50 ? 30 : 100,
          ...(paymentMethod === 'bank_transfer' && {
            bankAccount: 'Cuenta bancaria configurada',
            reference: `Transferencia para pedido manual`
          }),
          ...(paymentMethod === 'wompi' && {
            gateway: 'wompi',
            requiresAdvance: selectedDesign?.price > 50
          })
        },
        quantity: 1,
        notes: `Pedido manual creado desde diseño: ${selectedDesign?.name}`,
        isManualOrder: true,
        createdByAdmin: true
      };
      
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
    setDeliveryType('meetup');
    setSelectedAddress(null);
    setPaymentMethod('cash');
    onClose();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedDesign !== null;
      case 1: return deliveryType && (deliveryType === 'meetup' || selectedAddress);
      case 2: return paymentMethod;
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Seleccionar Diseño
            </Typography>
            
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

            {designsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {Array.isArray(designs) && designs.map((design) => (
                <Grid item xs={12} sm={6} md={4} key={design._id}>
                  <SelectionCard 
                    selected={selectedDesign?._id === design._id}
                    onClick={() => handleDesignSelect(design)}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                      <Box sx={{ position: 'relative', mb: 2, aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                        {design.product?.images?.[0] && (
                          <Box
                            component="img"
                            src={design.product.images[0]}
                            alt={design.product.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDesign(design);
                            setShowPreview(true);
                          }}
                        >
                          <Eye size={16} color="#032CA6" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'", mb: 1.5, lineHeight: 1.3 }}>
                        {design.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cliente: {design.user?.name || 'Sin nombre'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Producto: {design.product?.name || 'Sin producto'}
                        </Typography>
                      </Box>
                      
                      {design.price && (
                        <Chip 
                          label={`$${design.price}`}
                          color="secondary"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </CardContent>
                  </SelectionCard>
                </Grid>
              ))}
            </Grid>

            {Array.isArray(designs) && designs.length === 0 && !designsLoading && (
              <Alert severity="info" sx={{ borderRadius: '12px', mt: 2 }}>
                No hay diseños disponibles. Busca por nombre, cliente o producto.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Dirección de Entrega
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Tipo de Entrega
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <SelectionCard 
                    selected={deliveryType === 'meetup'}
                    onClick={() => setDeliveryType('meetup')}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      py: { xs: 2.5, sm: 3 }, 
                      px: 2,
                      '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                        <MapPin size={28} color={deliveryType === 'meetup' ? '#032CA6' : '#666'} weight="duotone" />
                      </Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
                        Punto de Entrega
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        Reunión en ubicación específica
                      </Typography>
                    </CardContent>
                  </SelectionCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectionCard 
                    selected={deliveryType === 'delivery'}
                    onClick={() => setDeliveryType('delivery')}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      py: { xs: 2.5, sm: 3 }, 
                      px: 2,
                      '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                        <Truck size={28} color={deliveryType === 'delivery' ? '#032CA6' : '#666'} weight="duotone" />
                      </Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
                        Delivery
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        Entrega a domicilio
                      </Typography>
                    </CardContent>
                  </SelectionCard>
                </Grid>
              </Grid>
            </Box>

            {deliveryType === 'delivery' && (
              <Box>
                {!showAddressDetails ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'stretch', sm: 'center' }, 
                      gap: { xs: 1.5, sm: 2 }, 
                      mb: 2.5 
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Direcciones Guardadas
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddressModal(true)}
                        startIcon={<MapPin size={16} />}
                        sx={{ 
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2
                        }}
                      >
                        Nueva Dirección
                      </Button>
                    </Box>

                    {addressesLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} />
                      </Box>
                    ) : (
                      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                        {userAddresses?.map((address) => (
                          <Grid item xs={12} sm={6} key={address._id}>
                            <SelectionCard 
                              selected={selectedAddress?._id === address._id}
                              onClick={() => {
                                setSelectedAddress(address);
                                setShowAddressDetails(true);
                              }}
                            >
                              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                                    {address.label || 'Dirección'}
                                  </Typography>
                                  {address.isDefault && (
                                    <Chip 
                                      label="Predeterminada" 
                                      size="small"
                                      color="primary" 
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {address.recipient}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {address.address}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {address.municipality}, {address.department}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </SelectionCard>
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    {userAddresses?.length === 0 && !addressesLoading && (
                      <Alert severity="info" sx={{ borderRadius: '12px', mt: 2 }}>
                        No hay direcciones guardadas. Crea una nueva dirección.
                      </Alert>
                    )}
                  </>
                ) : (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'stretch', sm: 'center' }, 
                      gap: 2, 
                      mb: 3 
                    }}>
                      <Typography variant="subtitle1" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                        Dirección Seleccionada
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddressDetails(false)}
                        startIcon={<ArrowLeft size={16} />}
                        sx={{ 
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Cambiar Dirección
                      </Button>
                    </Box>

                    {selectedAddress && (
                      <Card sx={{ 
                        border: `2px solid #032CA6`, 
                        backgroundColor: alpha('#032CA6', 0.05),
                        borderRadius: '12px'
                      }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                            <MapPin size={20} color="#032CA6" weight="duotone" />
                            <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                              {selectedAddress.label || 'Dirección'}
                            </Typography>
                            {selectedAddress.isDefault && (
                              <Chip 
                                label="Predeterminada" 
                                size="small" 
                                color="primary"
                              />
                            )}
                          </Box>
                          
                          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                                Destinatario
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 0.5 }}>
                                {selectedAddress.recipient}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                📞 {selectedAddress.formattedPhone || selectedAddress.phoneNumber}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                                Dirección
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 0.5 }}>
                                {selectedAddress.address}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedAddress.municipality}, {selectedAddress.department}
                              </Typography>
                            </Grid>

                            {selectedAddress.additionalDetails && (
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                                  Detalles Adicionales
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedAddress.additionalDetails}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {deliveryType === 'meetup' && (
              <Alert severity="info" sx={{ borderRadius: '12px', mt: 2 }}>
                Se coordinará el punto de entrega directamente con el cliente.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Método de Pago
            </Typography>

            <Box sx={{ mb: 3, p: { xs: 2, sm: 2.5 }, backgroundColor: alpha('#032CA6', 0.05), borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontFamily: "'Mona Sans'" }}>
                Resumen del Pedido
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Diseño:</strong> {selectedDesign?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cliente:</strong> {selectedDesign?.user?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Precio:</strong> ${selectedDesign?.price || 0}
                  </Typography>
                </Grid>
              </Grid>
              {selectedDesign?.price > 50 && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
                  <Typography variant="body2">
                    Pedido grande detectado. Se requiere adelanto del 30% (${Math.round(selectedDesign.price * 0.3)})
                  </Typography>
                </Alert>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Selecciona el Método de Pago
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              <Grid item xs={12} sm={4}>
                <SelectionCard 
                  selected={paymentMethod === 'cash'}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 2.5, sm: 3 }, 
                    px: 2,
                    '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                      <CurrencyDollar size={28} color={paymentMethod === 'cash' ? '#032CA6' : '#666'} weight="duotone" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
                      Efectivo
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      Pago contra entrega
                    </Typography>
                  </CardContent>
                </SelectionCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <SelectionCard 
                  selected={paymentMethod === 'bank_transfer'}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 2.5, sm: 3 }, 
                    px: 2,
                    '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                      <Receipt size={28} color={paymentMethod === 'bank_transfer' ? '#032CA6' : '#666'} weight="duotone" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
                      Transferencia
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      Datos bancarios
                    </Typography>
                  </CardContent>
                </SelectionCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <SelectionCard 
                  selected={paymentMethod === 'wompi'}
                  onClick={() => setPaymentMethod('wompi')}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 2.5, sm: 3 }, 
                    px: 2,
                    '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                      <CurrencyDollar size={28} color={paymentMethod === 'wompi' ? '#032CA6' : '#666'} weight="duotone" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
                      Tarjeta
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      Wompi/PayPal
                    </Typography>
                  </CardContent>
                </SelectionCard>
              </Grid>
            </Grid>

            {paymentMethod && (
              <Box sx={{ mt: 3 }}>
                {paymentMethod === 'cash' && (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                      💰 Pago en Efectivo
                    </Typography>
                    <Typography variant="body2">
                      El cliente pagará contra entrega al recibir el producto. No se requiere pago anticipado.
                    </Typography>
                  </Alert>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                      🏦 Transferencia Bancaria
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      El cliente debe realizar una transferencia bancaria a la cuenta configurada.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Los datos bancarios se proporcionarán de forma segura después de confirmar el pedido.
                    </Typography>
                  </Alert>
                )}

                {paymentMethod === 'wompi' && (
                  <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
                      💳 Pago con Tarjeta (Wompi)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Se utilizará una tarjeta guardada del cliente para procesar el pago.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Solo se pueden usar tarjetas previamente guardadas por el cliente.
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                      El admin NO puede crear nuevas tarjetas por seguridad.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Confirmar Pedido
            </Typography>

            <Alert severity="success" sx={{ borderRadius: '12px', mb: 3 }}>
              <Typography variant="body2">
                Revisa todos los detalles antes de crear el pedido.
              </Typography>
            </Alert>

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  border: `1px solid ${alpha('#1F64BF', 0.12)}`,
                  borderRadius: '12px',
                  height: '100%',
                  backgroundColor: alpha('#1F64BF', 0.02)
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Mona Sans'" }}>
                    Diseño Seleccionado
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedDesign?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {selectedDesign?.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Producto: {selectedDesign?.product?.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: '#28A745' }}>
                      ${selectedDesign?.price || 0}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
                  
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  border: `1px solid ${alpha('#1F64BF', 0.12)}`,
                  borderRadius: '12px',
                  height: '100%',
                  backgroundColor: alpha('#1F64BF', 0.02)
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Mona Sans'" }}>
                    Dirección de Entrega
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="body2">
                      <strong>Tipo:</strong> {deliveryType === 'meetup' ? 'Punto de Entrega' : 'Delivery'}
                    </Typography>
                    {deliveryType === 'delivery' && selectedAddress && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{selectedAddress.label}:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedAddress.address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedAddress.municipality}, {selectedAddress.department}
                        </Typography>
                      </>
                    )}
                    {deliveryType === 'meetup' && (
                      <Typography variant="body2" color="text.secondary">
                        Se coordinará con el cliente
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
                  
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  border: `1px solid ${alpha('#1F64BF', 0.12)}`,
                  borderRadius: '12px',
                  height: '100%',
                  backgroundColor: alpha('#1F64BF', 0.02)
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Mona Sans'" }}>
                    Método de Pago
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentMethod === 'cash' ? '💰 Efectivo' : 
                       paymentMethod === 'bank_transfer' ? '🏦 Transferencia' : 
                       '💳 Tarjeta'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {paymentMethod === 'cash' ? 'Pago contra entrega' : 
                       paymentMethod === 'bank_transfer' ? 'Transferencia bancaria' : 
                       'Wompi/PayPal'}
                    </Typography>
                    {selectedDesign?.price > 50 && (
                      <Alert severity="warning" sx={{ mt: 1, p: 1, borderRadius: '8px' }}>
                        <Typography variant="caption">
                          Adelanto: ${Math.round(selectedDesign.price * 0.3)}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
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
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 1 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontFamily: "'Mona Sans'",
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: '400px', maxHeight: '60vh', overflow: 'auto' }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, borderTop: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
        <SecondaryButton
          onClick={currentStep === 0 ? handleClose : handleBack}
          startIcon={currentStep === 0 ? <X size={16} /> : <ArrowLeft size={16} />}
        >
          {currentStep === 0 ? 'Cancelar' : 'Atrás'}
        </SecondaryButton>

        <Box sx={{ flex: 1 }} />

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
      </DialogActions>

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
              onClose={() => setShowPreview(false)}
              design={previewDesign}
              product={previewDesign?.product}
              enableDownload={true}
            />
          </Box>
        </Box>
      )}

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={async (addressData, mode) => {
          try {
            const createdAddress = await createAddress(addressData);
            setSelectedAddress(createdAddress);
            setShowAddressModal(false);
            
            if (selectedDesign?.user?._id) {
              const updatedAddresses = await fetchUserAddresses(selectedDesign.user._id);
              setUserAddresses(updatedAddresses);
            }
          } catch (error) {
            console.error('Error creando dirección:', error);
            throw error;
          }
        }}
        editMode={false}
        addressToEdit={null}
        users={selectedDesign?.user ? [{
          ...selectedDesign.user,
          id: selectedDesign.user._id || selectedDesign.user.id
        }] : []}
        loadingUsers={false}
        preSelectedUserId={selectedDesign?.user?._id}
      />
    </StyledDialog>
  );
};

export default ManualOrderForm;