// src/components/CreateDesignModal/CreateDesignModal.jsx - MODAL CORREGIDO
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  CircularProgress,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  X,
  Users,
  Package,
  Palette,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Eye,
  PencilSimple
} from '@phosphor-icons/react';

// Importar componentes
import KonvaDesignEditor from '../KonvaDesignEditor/KonvaDesignEditor';
import KonvaDesignViewer from '../KonvaDesignViewer/KonvaDesignViewer';

// ================ SERVICIO DE VALIDACIÓN INTEGRADO ================
const DesignService = {
  validateElementsForSubmission: (elements) => {
    const errors = [];
    
    if (!elements || elements.length === 0) {
      errors.push('Debe agregar al menos un elemento al diseño');
    }
    
    elements.forEach((element, index) => {
      if (!element.type) {
        errors.push(`Elemento ${index + 1}: tipo no definido`);
      }
      
      if (!element.konvaAttrs) {
        errors.push(`Elemento ${index + 1}: atributos no definidos`);
      }
      
      if (element.type === 'text' && !element.konvaAttrs?.text?.trim()) {
        errors.push(`Elemento de texto ${index + 1}: texto vacío`);
      }
      
      if (element.type === 'image' && !element.konvaAttrs?.image) {
        errors.push(`Elemento de imagen ${index + 1}: URL de imagen no definida`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: 'white',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.16)',
    border: `1px solid ${alpha('#1F64BF', 0.08)}`,
    maxWidth: '1000px',
    width: '95vw',
    maxHeight: '90vh',
    margin: '16px',
    overflow: 'hidden'
  }
}));

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  padding: '24px 32px',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '120px',
    height: '120px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(40px, -40px)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
  }
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  }
}));

const CloseButton = styled(IconButton)({
  color: 'white',
  background: 'rgba(255, 255, 255, 0.1)',
  width: '40px',
  height: '40px',
  zIndex: 1,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  }
});

const ModalContent = styled(DialogContent)(({ theme }) => ({
  padding: '32px',
  background: 'white',
  [theme.breakpoints.down('sm')]: {
    padding: '24px',
  }
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
  '& .MuiStep-root': {
    '& .MuiStepLabel-root': {
      '& .MuiStepLabel-label': {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#032CA6',
        '&.Mui-active': {
          color: '#1F64BF',
          fontWeight: 600
        },
        '&.Mui-completed': {
          color: '#10B981',
          fontWeight: 600
        }
      }
    }
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '24px',
    '& .MuiStepLabel-label': {
      fontSize: '0.75rem !important'
    }
  }
}));

const StepContent = styled(Box)({
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
});

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  background: 'white',
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

const SectionTitle = styled(Typography)({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#F8F9FA',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha('#1F64BF', 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF',
      borderWidth: '2px',
    }
  }
}));

const DesignPreviewCard = styled(SectionCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
  border: `2px dashed ${alpha('#1F64BF', 0.3)}`,
  textAlign: 'center',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
  }
}));

const ActionButton = styled(Button)(({ variant: buttonVariant, theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  minWidth: '140px',
  transition: 'all 0.3s ease',
  ...(buttonVariant === 'contained' ? {
    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
    '&:hover': {
      background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
      boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
      transform: 'translateY(-1px)',
    }
  } : {
    border: `2px solid ${alpha('#1F64BF', 0.3)}`,
    color: '#1F64BF',
    '&:hover': {
      borderColor: '#1F64BF',
      background: alpha('#1F64BF', 0.05),
    }
  })
}));

const ModalActions = styled(DialogActions)(({ theme }) => ({
  padding: '24px 32px',
  background: alpha('#1F64BF', 0.02),
  borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
    flexDirection: 'column-reverse',
    '& > *': {
      width: '100%'
    }
  }
}));

const ElementSummary = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderRadius: '12px',
  background: alpha('#10B981', 0.05),
  border: `1px solid ${alpha('#10B981', 0.2)}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}));

// ================ COMPONENTE PRINCIPAL ================
const CreateDesignModal = ({
  isOpen,
  onClose,
  onCreateDesign,
  editMode = false,
  designToEdit = null,
  products = [],
  users = [],
  loadingProducts = false,
  loadingUsers = false
}) => {
  const theme = useTheme();
  
  // ==================== ESTADOS ====================
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados del editor
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [designElements, setDesignElements] = useState([]);
  
  // Datos del diseño
  const [designData, setDesignData] = useState({
    name: '',
    userId: '',
    productId: '',
    elements: [],
    productOptions: [],
    clientNotes: '',
    mode: 'simple',
    productColorFilter: null
  });

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (editMode && designToEdit) {
      setDesignData({
        name: designToEdit.name || '',
        userId: designToEdit.user?.id || designToEdit.user?._id || '',
        productId: designToEdit.product?.id || designToEdit.product?._id || '',
        elements: designToEdit.elements || [],
        productOptions: designToEdit.productOptions || [],
        clientNotes: designToEdit.clientNotes || '',
        mode: designToEdit.metadata?.mode || 'simple',
        productColorFilter: designToEdit.productColorFilter || null
      });
      setDesignElements(designToEdit.elements || []);
    } else {
      // Resetear para modo creación
      setDesignData({
        name: '',
        userId: '',
        productId: '',
        elements: [],
        productOptions: [],
        clientNotes: '',
        mode: 'simple',
        productColorFilter: null
      });
      setDesignElements([]);
    }
    
    setActiveStep(0);
    setErrors({});
    setShowEditor(false);
    setShowPreview(false);
  }, [editMode, designToEdit, isOpen]);

  // ==================== STEPS CONFIGURATION ====================
  const steps = [
    {
      label: 'Cliente y Producto',
      icon: Users,
      description: 'Seleccionar cliente y producto base'
    },
    {
      label: 'Diseño Visual',
      icon: Palette,
      description: 'Crear diseño con editor visual'
    },
    {
      label: 'Revisión Final',
      icon: CheckCircle,
      description: 'Verificar y confirmar el diseño'
    }
  ];

  // ==================== VALIDACIONES ====================
  const validateStep = useCallback((step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!designData.userId) {
          newErrors.userId = 'Debe seleccionar un cliente';
        }
        if (!designData.productId) {
          newErrors.productId = 'Debe seleccionar un producto';
        }
        if (!designData.name.trim()) {
          newErrors.name = 'Debe escribir un nombre para el diseño';
        }
        break;
      
      case 1:
        if (!designElements || designElements.length === 0) {
          newErrors.elements = 'Debe crear al menos un elemento en el diseño';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [designData, designElements]);

  // ==================== MANEJADORES ====================
  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  }, [activeStep, validateStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setDesignData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleOpenEditor = useCallback(() => {
    if (!designData.productId) {
      setErrors({ productId: 'Debe seleccionar un producto primero' });
      return;
    }
    setShowEditor(true);
  }, [designData.productId]);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  // *** CORREGIDO: Función handleSaveDesign arreglada ***
  const handleSaveDesign = useCallback((elements, productColorFilter) => {
    console.log('💾 Guardando elementos del diseño:', elements);
    console.log('🎨 Filtro de color del producto:', productColorFilter);
    
    // Validar elementos...
    const validation = DesignService.validateElementsForSubmission(elements);
    if (!validation.isValid) {
      setErrors({ elements: validation.errors.join('; ') });
      return;
    }

    // *** FIX: Usar 'elements' en lugar de 'elementsWithArea' ***
    const finalDesignData = {
      ...designData,
      elements: elements,  // ← CORREGIDO: era 'elementsWithArea'
      productColorFilter: productColorFilter || null
    };

    setDesignData(finalDesignData);
    setDesignElements(elements);  // ← CORREGIDO: era 'elementsWithArea'
    setShowEditor(false);
    setErrors(prev => ({ ...prev, elements: undefined }));
    
    if (activeStep === 1) {
      setActiveStep(2);
    }
  }, [activeStep, designData]);

  const handlePreviewDesign = useCallback(() => {
    if (designElements.length === 0) {
      setErrors({ elements: 'Debe crear el diseño primero' });
      return;
    }
    setShowPreview(true);
  }, [designElements]);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(2)) return;
    
    try {
      setLoading(true);
      
      // Preparar datos finales
      const finalDesignData = {
        ...designData,
        elements: designElements,
        productColorFilter: designData.productColorFilter || null
      };
      
      // Validación final
      const validation = DesignService.validateElementsForSubmission(designElements);
      if (!validation.isValid) {
        setErrors({ elements: validation.errors.join('; ') });
        return;
      }

      console.log('📤 Enviando diseño:', finalDesignData);
      await onCreateDesign(finalDesignData);
    } catch (error) {
      console.error('Error submitting design:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  }, [designData, designElements, onCreateDesign, validateStep]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // ==================== DATOS CALCULADOS ====================
  const selectedProduct = products.find(p => p.id === designData.productId || p._id === designData.productId);
  const selectedUser = users.find(u => u.id === designData.userId || u._id === designData.userId);
  const canProceed = !loading;
  const isLastStep = activeStep === steps.length - 1;
  const hasDesignElements = designElements.length > 0;

  // ==================== RENDER STEPS ====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepContent>
            <SectionCard>
              <SectionTitle component="div">
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Palette size={16} weight="bold" />
                 <span>Información básica</span>
               </Box>
              </SectionTitle>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ModernTextField
                  label="Nombre del diseño"
                  value={designData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  placeholder="Ej: Logo para camiseta promocional"
                />

                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={selectedUser || null}
                  onChange={(event, newValue) => {
                    handleInputChange('userId', newValue?.id || newValue?._id || '');
                  }}
                  loading={loadingUsers}
                  renderInput={(params) => (
                    <ModernTextField
                      {...params}
                      label="Cliente"
                      error={!!errors.userId}
                      helperText={errors.userId || 'Buscar cliente por nombre o email'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />

                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name}
                  value={selectedProduct || null}
                  onChange={(event, newValue) => {
                    handleInputChange('productId', newValue?.id || newValue?._id || '');
                  }}
                  loading={loadingProducts}
                  renderInput={(params) => (
                    <ModernTextField
                      {...params}
                      label="Producto"
                      error={!!errors.productId}
                      helperText={errors.productId || 'Seleccionar producto base para personalizar'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {(option.mainImage || option.images?.main) && (
                            <Box
                              component="img"
                              src={option.mainImage || option.images?.main}
                              alt={option.name}
                              sx={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.formattedPrice || `${option.basePrice}` || 'Precio no disponible'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  }}
                />

                <ModernTextField
                  label="Notas para el cliente (opcional)"
                  value={designData.clientNotes}
                  onChange={(e) => handleInputChange('clientNotes', e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Instrucciones especiales o detalles adicionales..."
                />
              </Box>
            </SectionCard>
          </StepContent>
        );

      case 1:
        return (
          <StepContent>
         <SectionCard>
                 <SectionTitle component="div">
                   <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Palette size={16} weight="bold" />
                     <span>Editor Visual de diseño</span>
                    </Box>
                 </SectionTitle>
              
              {selectedProduct ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {hasDesignElements ? (
                    <ElementSummary>
                      <CheckCircle size={24} weight="fill" color="#10B981" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="#059669">
                          Diseño creado exitosamente
                        </Typography>
                        <Typography variant="caption" color="#065F46">
                          {designElements.length} elemento{designElements.length !== 1 ? 's' : ''} agregado{designElements.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: '8px' }}>
                        <IconButton
                          size="small"
                          onClick={handlePreviewDesign}
                          sx={{ 
                            color: '#059669',
                            background: alpha('#10B981', 0.1),
                            '&:hover': { background: alpha('#10B981', 0.2) }
                          }}
                        >
                          <Eye size={16} weight="bold" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleOpenEditor}
                          sx={{ 
                            color: '#059669',
                            background: alpha('#10B981', 0.1),
                            '&:hover': { background: alpha('#10B981', 0.2) }
                          }}
                        >
                          <PencilSimple size={16} weight="bold" />
                        </IconButton>
                      </Box>
                    </ElementSummary>
                  ) : (
                    <DesignPreviewCard onClick={handleOpenEditor}>
                      <Palette size={48} weight="duotone" color="#1F64BF" />
                      <Typography variant="h6" fontWeight={700} color="#010326">
                        Crear Diseño Visual
                      </Typography>
                      <Typography variant="body2" color="#032CA6" sx={{ opacity: 0.8 }}>
                        Usa nuestro editor visual para crear el diseño personalizado
                      </Typography>
                      <ActionButton variant="contained" startIcon={<Plus size={16} weight="bold" />}>
                        Abrir Editor
                      </ActionButton>
                    </DesignPreviewCard>
                  )}

                  {selectedProduct.customizationAreas && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                        Áreas disponibles para personalización:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedProduct.customizationAreas.map((area) => (
                          <Chip
                            key={area._id || area.id}
                            label={area.displayName || area.name}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: alpha('#1F64BF', 0.3),
                              color: '#1F64BF',
                              fontSize: '0.75rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {errors.elements && (
                    <Typography color="error" variant="body2">
                      {errors.elements}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  color: alpha('#032CA6', 0.6) 
                }}>
                  <Package size={48} weight="duotone" />
                  <Typography component="div" variant="body1" sx={{ mt: 2 }}>
                    Selecciona un producto en el paso anterior para continuar
                  </Typography>
                </Box>
              )}
            </SectionCard>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <SectionCard>
              <SectionTitle component="div">
  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Palette size={16} weight="bold" />
    <span>Resumen del diseño</span>
  </Box>
</SectionTitle>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Información básica */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px' 
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre del diseño
                    </Typography>
                    <Typography component="div" variant="body1" fontWeight={600}>
                      {designData.name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cliente
                    </Typography>
                    <Typography component="div" variant="body1" fontWeight={600}>
                      {selectedUser?.name || 'No seleccionado'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Producto
                    </Typography>
                    <Typography component="div" variant="body1" fontWeight={600}>
                      {selectedProduct?.name || 'No seleccionado'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Elementos
                    </Typography>
                    <Typography component="div" variant="body1" fontWeight={600}>
                      {designElements.length} elemento{designElements.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>

                {/* Vista previa del diseño */}
                {hasDesignElements && selectedProduct && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                      Vista previa del diseño:
                    </Typography>
                    <DesignPreviewCard onClick={handlePreviewDesign}>
                      <Eye size={32} weight="duotone" color="#1F64BF" />
                      <Typography variant="body2" fontWeight={600}>
                        Ver diseño completo
                      </Typography>
                      <ActionButton variant="outlined" startIcon={<Eye size={16} weight="bold" />}>
                        Vista Previa
                      </ActionButton>
                    </DesignPreviewCard>
                  </Box>
                )}

                {/* Producto preview */}
                {(selectedProduct?.mainImage || selectedProduct?.images?.main) && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Producto base
                    </Typography>
                    <Box
                      component="img"
                      src={selectedProduct.mainImage || selectedProduct.images?.main}
                      alt={selectedProduct.name}
                      sx={{
                        width: '100%',
                        maxWidth: '300px',
                        height: 'auto',
                        borderRadius: '12px',
                        border: `1px solid ${alpha('#1F64BF', 0.12)}`
                      }}
                    />
                  </Box>
                )}

                {/* Notas del cliente */}
                {designData.clientNotes && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Notas para el cliente
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        p: 2,
                        borderRadius: '8px',
                        background: alpha('#1F64BF', 0.05),
                        border: `1px solid ${alpha('#1F64BF', 0.1)}`,
                        fontStyle: 'italic'
                      }}
                    >
                      "{designData.clientNotes}"
                    </Typography>
                  </Box>
                )}

                {errors.submit && (
                  <Typography color="error" variant="body2">
                    {errors.submit}
                  </Typography>
                )}
              </Box>
            </SectionCard>
          </StepContent>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER PRINCIPAL ====================
  return (
    <>
      <StyledDialog
        open={isOpen}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
      >
        <ModalHeader>
          <HeaderTitle>
            <Palette size={24} weight="duotone" />
            {editMode ? 'Editar Diseño' : 'Crear Nuevo Diseño'}
          </HeaderTitle>
          <CloseButton onClick={handleClose} disabled={loading}>
            <X size={20} weight="bold" />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <StepperContainer>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={<step.icon size={20} weight={index <= activeStep ? "fill" : "regular"} />}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperContainer>

          {renderStepContent()}
        </ModalContent>

        <ModalActions>
          <ActionButton
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </ActionButton>

          <Box sx={{ display: 'flex', gap: '12px' }}>
            {activeStep > 0 && (
              <ActionButton
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                startIcon={<ArrowLeft size={16} weight="bold" />}
              >
                Anterior
              </ActionButton>
            )}

            {isLastStep ? (
              <ActionButton
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !canProceed || !hasDesignElements}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} weight="bold" />}
              >
                {loading ? 'Creando...' : (editMode ? 'Actualizar Diseño' : 'Crear Diseño')}
              </ActionButton>
            ) : (
              <ActionButton
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<ArrowRight size={16} weight="bold" />}
              >
                Siguiente
              </ActionButton>
            )}
          </Box>
        </ModalActions>
      </StyledDialog>

      {/* Editor Konva */}
      {showEditor && selectedProduct && (
        <KonvaDesignEditor
          isOpen={showEditor}
          onClose={handleCloseEditor}
          product={selectedProduct}
          initialDesign={{ elements: designElements }}
          onSave={handleSaveDesign}
        />
      )}

      {/* Vista previa */}
      {showPreview && selectedProduct && hasDesignElements && (
        <KonvaDesignViewer
          isOpen={showPreview}
          onClose={handleClosePreview}
          design={{
            name: designData.name,
            elements: designElements,
            user: selectedUser,
            status: 'draft'
          }}
          product={selectedProduct}
          showInfo={true}
          enableDownload={true}
        />
      )}
    </>
  );
};

// ==================== PROP TYPES ====================
CreateDesignModal.defaultProps = {
  isOpen: false,
  editMode: false,
  designToEdit: null,
  products: [],
  users: [],
  loadingProducts: false,
  loadingUsers: false,
  onClose: () => {},
  onCreateDesign: () => {}
};

export default CreateDesignModal;