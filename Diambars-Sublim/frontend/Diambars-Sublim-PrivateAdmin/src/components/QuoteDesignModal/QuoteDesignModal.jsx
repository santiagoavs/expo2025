// src/components/QuoteDesignModal/QuoteDesignModal.jsx - MODAL COTIZACIÓN DE DISEÑOS
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  X,
  Money,
  Calendar,
  User,
  Package,
  Calculator,
  CheckCircle,
  Warning,
  Palette
} from '@phosphor-icons/react';

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: 'white',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.16)',
    border: `1px solid ${alpha('#1F64BF', 0.08)}`,
    maxWidth: '700px',
    width: '95vw',
    maxHeight: '90vh',
    margin: '16px',
    overflow: 'hidden'
  }
}));

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  background: 'white',
  marginBottom: '24px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
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

const InfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '20px'
}));

const InfoItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
});

const InfoLabel = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#032CA6',
  opacity: 0.7,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});

const InfoValue = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  lineHeight: 1.3
});

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#F8F9FA',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#10B981', 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha('#10B981', 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#10B981',
      borderWidth: '2px',
    }
  }
}));

const PriceDisplay = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: 'white',
  textAlign: 'center',
  marginBottom: '24px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  }
}));

const PriceValue = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '8px',
  zIndex: 1,
  position: 'relative'
});

const PriceLabel = styled(Typography)({
  fontSize: '1rem',
  opacity: 0.9,
  zIndex: 1,
  position: 'relative'
});

const ComplexityChip = styled(Chip)(({ complexity }) => {
  const colors = {
    'low': { color: '#10B981', bg: alpha('#10B981', 0.1) },
    'medium': { color: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
    'high': { color: '#EF4444', bg: alpha('#EF4444', 0.1) }
  };
  
  const config = colors[complexity] || colors['medium'];
  
  return {
    height: '28px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: config.color,
    backgroundColor: config.bg,
    border: `1px solid ${alpha(config.color, 0.2)}`
  };
});

const CalculatorSection = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderRadius: '12px',
  background: alpha('#10B981', 0.05),
  border: `1px solid ${alpha('#10B981', 0.15)}`,
  marginBottom: '20px'
}));

const ModalActions = styled(DialogActions)(({ theme }) => ({
  padding: '24px 32px',
  background: alpha('#10B981', 0.02),
  borderTop: `1px solid ${alpha('#10B981', 0.08)}`,
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
    flexDirection: 'column-reverse',
    '& > *': {
      width: '100%'
    }
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.24)',
  minWidth: '120px',
  '&:hover': {
    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    boxShadow: '0 6px 24px rgba(16, 185, 129, 0.32)',
  },
  '&:disabled': {
    background: alpha('#10B981', 0.3),
    color: alpha('#ffffff', 0.7),
    boxShadow: 'none'
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  borderColor: alpha('#10B981', 0.3),
  color: '#10B981',
  minWidth: '100px',
  '&:hover': {
    borderColor: '#10B981',
    background: alpha('#10B981', 0.05),
  }
}));

// ================ COMPONENTE PRINCIPAL ================
const QuoteDesignModal = ({
  isOpen,
  onClose,
  onSubmitQuote,
  design
}) => {
  const theme = useTheme();
  
  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    price: '',
    productionDays: '3',
    adminNotes: '',
    complexity: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    designComplexity: 0,
    materials: 0,
    labor: 0,
    total: 0
  });

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (design && isOpen) {
      // Calcular precio base sugerido
      const basePrice = design.basePrice || design.product?.basePrice || 0;
      const complexityMultiplier = {
        'low': 1.2,
        'medium': 1.5,
        'high': 2.0
      }[design.complexity] || 1.5;
      
      const elementsCount = design.elementsCount || 0;
      const elementsCost = elementsCount * 5; // $5 por elemento adicional
      
      const suggestedPrice = Math.round((basePrice * complexityMultiplier + elementsCost) * 100) / 100;
      
      setQuoteData({
        price: suggestedPrice.toString(),
        productionDays: design.complexity === 'high' ? '5' : design.complexity === 'medium' ? '3' : '2',
        adminNotes: '',
        complexity: design.complexity || 'medium'
      });

      setPriceBreakdown({
        basePrice: basePrice,
        designComplexity: Math.round((basePrice * (complexityMultiplier - 1)) * 100) / 100,
        materials: elementsCost,
        labor: Math.round((basePrice * 0.3) * 100) / 100,
        total: suggestedPrice
      });
    }
  }, [design, isOpen]);

  // Recalcular cuando cambie el precio
  useEffect(() => {
    const price = parseFloat(quoteData.price) || 0;
    if (price > 0 && design) {
      const basePrice = design.basePrice || design.product?.basePrice || 0;
      const remaining = price - basePrice;
      
      setPriceBreakdown({
        basePrice: basePrice,
        designComplexity: Math.round((remaining * 0.4) * 100) / 100,
        materials: Math.round((remaining * 0.3) * 100) / 100,
        labor: Math.round((remaining * 0.3) * 100) / 100,
        total: price
      });
    }
  }, [quoteData.price, design]);

  // ==================== VALIDACIONES ====================
  const validateForm = () => {
    const newErrors = {};
    
    if (!quoteData.price || parseFloat(quoteData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor que 0';
    }
    
    if (!quoteData.productionDays || parseInt(quoteData.productionDays) < 1) {
      newErrors.productionDays = 'Los días de producción deben ser al menos 1';
    }
    
    if (parseInt(quoteData.productionDays) > 30) {
      newErrors.productionDays = 'Los días de producción no pueden exceder 30';
    }
    
    setErrors(newErrors);
    
    // Mostrar errores con SweetAlert si hay validaciones fallidas
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n');
      Swal.fire({
        title: '⚠️ Datos Inválidos',
        text: errorMessages,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F59E0B'
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // ==================== MANEJADORES ====================
  const handleInputChange = (field, value) => {
    setQuoteData(prev => ({
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
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const finalQuoteData = {
        price: parseFloat(quoteData.price),
        productionDays: parseInt(quoteData.productionDays),
        adminNotes: quoteData.adminNotes.trim()
      };
      
      await onSubmitQuote(finalQuoteData);
    } catch (error) {
      console.error('Error submitting quote:', error);
      Swal.fire({
        title: '❌ Error al Enviar Cotización',
        text: error.message || 'No se pudo enviar la cotización. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const addToPrice = (amount) => {
    const currentPrice = parseFloat(quoteData.price) || 0;
    const newPrice = currentPrice + amount;
    handleInputChange('price', newPrice.toFixed(2));
  };

  // ==================== DATOS CALCULADOS ====================
  const formattedPrice = quoteData.price ? 
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(quoteData.price)) : '$0.00';

  // ==================== RENDER ====================
  if (!design) return null;

  return (
    <StyledDialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
    >
      <ModalHeader>
        <HeaderTitle>
          <Money size={24} weight="duotone" />
          Cotizar Diseño
        </HeaderTitle>
        <CloseButton onClick={handleClose} disabled={loading}>
          <X size={20} weight="bold" />
        </CloseButton>
      </ModalHeader>

      <ModalContent>
        {/* Información del diseño */}
        <SectionCard>
          <SectionTitle component="div">
  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Palette size={16} weight="bold" />
    <span>Informacion del diseño</span>
  </Box>
</SectionTitle>
          
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Nombre</InfoLabel>
              <InfoValue>{design.name}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Cliente</InfoLabel>
              <InfoValue>{design.clientName}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Producto</InfoLabel>
              <InfoValue>{design.productName}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Elementos</InfoLabel>
              <InfoValue>{design.elementsCount} elemento{design.elementsCount !== 1 ? 's' : ''}</InfoValue>
            </InfoItem>
          </InfoGrid>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: 2 }}>
            <InfoLabel sx={{ mb: 0 }}>Complejidad:</InfoLabel>
            <ComplexityChip 
              complexity={design.complexity}
              label={`${design.complexity} complexity`}
              size="small"
            />
          </Box>

          {design.clientNotes && (
            <Box>
              <InfoLabel sx={{ mb: 1 }}>Notas del cliente:</InfoLabel>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  p: 2,
                  borderRadius: '8px',
                  background: alpha('#1F64BF', 0.05),
                  border: `1px solid ${alpha('#1F64BF', 0.1)}`
                }}
              >
                "{design.clientNotes}"
              </Typography>
            </Box>
          )}
        </SectionCard>

        {/* Calculadora de precio */}
        <SectionCard>
          <SectionTitle component="div">
  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Palette size={16} weight="bold" />
    <span>Cotizacion</span>
  </Box>
</SectionTitle>

          <CalculatorSection>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#059669' }}>
              💡 Calculadora rápida de precios
            </Typography>
            
            <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addToPrice(5)}
                sx={{ 
                  color: '#059669', 
                  borderColor: alpha('#059669', 0.3),
                  '&:hover': { borderColor: '#059669', background: alpha('#059669', 0.05) }
                }}
              >
                +$5
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addToPrice(10)}
                sx={{ 
                  color: '#059669', 
                  borderColor: alpha('#059669', 0.3),
                  '&:hover': { borderColor: '#059669', background: alpha('#059669', 0.05) }
                }}
              >
                +$10
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addToPrice(25)}
                sx={{ 
                  color: '#059669', 
                  borderColor: alpha('#059669', 0.3),
                  '&:hover': { borderColor: '#059669', background: alpha('#059669', 0.05) }
                }}
              >
                +$25
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addToPrice(50)}
                sx={{ 
                  color: '#059669', 
                  borderColor: alpha('#059669', 0.3),
                  '&:hover': { borderColor: '#059669', background: alpha('#059669', 0.05) }
                }}
              >
                +$50
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Desglose estimado: Base ${priceBreakdown.basePrice} + Diseño ${priceBreakdown.designComplexity} + Materiales ${priceBreakdown.materials} + Mano de obra ${priceBreakdown.labor}
            </Typography>
          </CalculatorSection>

          <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', md: 'row' } }}>
            <ModernTextField
              label="Precio total"
              type="number"
              value={quoteData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              error={!!errors.price}
              helperText={errors.price || 'Precio final a cobrar al cliente'}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ flex: 1 }}
            />

            <ModernTextField
              label="Días de producción"
              type="number"
              value={quoteData.productionDays}
              onChange={(e) => handleInputChange('productionDays', e.target.value)}
              error={!!errors.productionDays}
              helperText={errors.productionDays || 'Tiempo estimado para completar'}
              InputProps={{
                endAdornment: <InputAdornment position="end">días</InputAdornment>,
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          <ModernTextField
            label="Notas para el cliente (opcional)"
            value={quoteData.adminNotes}
            onChange={(e) => handleInputChange('adminNotes', e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Detalles sobre materiales, proceso, o instrucciones especiales..."
            sx={{ mt: 2 }}
          />
        </SectionCard>

        {/* Preview de la cotización */}
        <PriceDisplay>
          <PriceValue>{formattedPrice}</PriceValue>
          <PriceLabel>
            {quoteData.productionDays} día{parseInt(quoteData.productionDays) !== 1 ? 's' : ''} de producción
          </PriceLabel>
        </PriceDisplay>

        {parseFloat(quoteData.price) > 0 && (
          <Box sx={{ 
            p: 2, 
            borderRadius: '12px', 
            background: alpha('#F59E0B', 0.1),
            border: `1px solid ${alpha('#F59E0B', 0.2)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Warning size={20} color="#F59E0B" weight="fill" />
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#92400E' }}>
                Confirmar antes de enviar
              </Typography>
              <Typography variant="caption" sx={{ color: '#92400E' }}>
                Una vez enviada, la cotización será notificada al cliente por email. 
                Asegúrate de que el precio y tiempo sean correctos.
              </Typography>
            </Box>
          </Box>
        )}
      </ModalContent>

      <ModalActions>
        <SecondaryButton
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </SecondaryButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={loading || !quoteData.price || parseFloat(quoteData.price) <= 0}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} weight="bold" />}
        >
          {loading ? 'Enviando...' : 'Enviar Cotización'}
        </PrimaryButton>
      </ModalActions>
    </StyledDialog>
  );
};

// ==================== PROP TYPES ====================
QuoteDesignModal.defaultProps = {
  isOpen: false,
  design: null,
  onClose: () => {},
  onSubmitQuote: () => {}
};

export default QuoteDesignModal;