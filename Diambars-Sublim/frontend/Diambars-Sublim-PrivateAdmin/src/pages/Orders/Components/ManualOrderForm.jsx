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
  ArrowLeft
} from '@phosphor-icons/react';

import { useManualOrder, useDesignManagement } from '../../../hooks/useManualOrder';
import Swal from 'sweetalert2';

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.12)',
    maxWidth: '900px',
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

  // Steps configuration - Simplificado a 3 pasos
  const steps = [
    { label: 'Diseño', icon: Palette, description: 'Seleccionar diseño existente' },
    { label: 'Detalles', icon: CurrencyDollar, description: 'Configurar entrega y pago' },
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
      case 1: return orderData.quantity > 0 && orderData.deliveryType;
      case 2: return isFormComplete();
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
              {Array.isArray(designs) && designs.map((design) => {
                // Log para diagnosticar las propiedades del diseño
                console.log('🎨 [ManualOrderForm] Diseño:', design.name, {
                  previewImage: design.previewImage,
                  image: design.image,
                  thumbnail: design.thumbnail,
                  preview: design.preview,
                  allKeys: Object.keys(design)
                });
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={design._id}>
                    <SelectionCard 
                      selected={selectedDesign?._id === design._id}
                      onClick={() => handleDesignSelect(design)}
                    >
                      <CardContent>
                        {(design.previewImage || design.image || design.thumbnail || design.preview) && (
                          <Box
                            component="img"
                            src={design.previewImage || design.image || design.thumbnail || design.preview}
                            alt={design.name}
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: '8px',
                              mb: 2
                            }}
                            onError={(e) => {
                              console.log('❌ [ManualOrderForm] Error cargando imagen:', e.target.src);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
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
                );
              })}
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
              Detalles del Pedido
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={orderData.quantity || 1}
                  onChange={(e) => updateOrderData({ quantity: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de entrega</InputLabel>
                  <Select
                    value={orderData.deliveryType || ''}
                    onChange={(e) => updateOrderData({ deliveryType: e.target.value })}
                    label="Tipo de entrega"
                    sx={{ borderRadius: '12px', fontFamily: "'Mona Sans'" }}
                  >
                    <MenuItem value="meetup">Punto de encuentro</MenuItem>
                    <MenuItem value="delivery">Entrega a domicilio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {orderData.deliveryType === 'delivery' && (
                <>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Dirección de entrega"
                      multiline
                      rows={2}
                      value={orderData.deliveryAddress?.street || ''}
                      onChange={(e) => updateOrderData({ 
                        deliveryAddress: { 
                          ...orderData.deliveryAddress, 
                          street: e.target.value 
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Ciudad"
                      value={orderData.deliveryAddress?.city || ''}
                      onChange={(e) => updateOrderData({ 
                        deliveryAddress: { 
                          ...orderData.deliveryAddress, 
                          city: e.target.value 
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Teléfono de contacto"
                      value={orderData.deliveryAddress?.phone || ''}
                      onChange={(e) => updateOrderData({ 
                        deliveryAddress: { 
                          ...orderData.deliveryAddress, 
                          phone: e.target.value 
                        }
                      })}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Método de pago</InputLabel>
                  <Select
                    value={orderData.paymentData?.method || 'cash'}
                    onChange={(e) => updateOrderData({ 
                      paymentData: { 
                        ...orderData.paymentData, 
                        method: e.target.value 
                      }
                    })}
                    label="Método de pago"
                    sx={{ borderRadius: '12px', fontFamily: "'Mona Sans'" }}
                  >
                    <MenuItem value="cash">Efectivo</MenuItem>
                    <MenuItem value="bank_transfer">Transferencia</MenuItem>
                    <MenuItem value="wompi">Tarjeta (Wompi)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timing de pago</InputLabel>
                  <Select
                    value={orderData.paymentData?.timing || 'on_delivery'}
                    onChange={(e) => updateOrderData({ 
                      paymentData: { 
                        ...orderData.paymentData, 
                        timing: e.target.value 
                      }
                    })}
                    label="Timing de pago"
                    sx={{ borderRadius: '12px', fontFamily: "'Mona Sans'" }}
                  >
                    <MenuItem value="on_delivery">Contra entrega</MenuItem>
                    <MenuItem value="advance">Adelantado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Notas adicionales"
                  multiline
                  rows={3}
                  value={orderData.notes || ''}
                  onChange={(e) => updateOrderData({ notes: e.target.value })}
                  placeholder="Instrucciones especiales, detalles adicionales..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
              Confirmar Pedido
            </Typography>

            {/* Resumen del pedido */}
            <Card sx={{ borderRadius: '12px', mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: "'Mona Sans'" }}>
                  Resumen del Pedido
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {selectedDesign?.user?.name || 'Sin nombre'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Producto:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {selectedDesign?.product?.name || 'Sin producto'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Diseño:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {selectedDesign?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Cantidad:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {orderData.quantity} unidad(es)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Entrega:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {orderData.deliveryType === 'delivery' ? 'Domicilio' : 'Punto de encuentro'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Pago:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {orderData.paymentData?.method === 'cash' ? 'Efectivo' : 
                       orderData.paymentData?.method === 'bank_transfer' ? 'Transferencia' : 'Tarjeta'}
                    </Typography>
                  </Grid>
                </Grid>

                {estimatedPrice > 0 && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: alpha('#1F64BF', 0.05), borderRadius: '8px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
                      Precio estimado: ${estimatedPrice.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Validaciones */}
            {!isFormComplete() && (
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                Por favor, completa todos los campos requeridos antes de crear el pedido.
              </Alert>
            )}
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
              disabled={!isFormComplete() || orderLoading}
              startIcon={orderLoading ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
            >
              {orderLoading ? 'Creando...' : 'Crear Pedido'}
            </PrimaryButton>
          )}
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default ManualOrderForm;