// src/components/CreateDesignModal/CreateDesignModal.jsx - DROPDOWNS ARREGLADOS
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  useTheme,
  Popper,
  Fade
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
import KonvaDesignViewer from '../KonvaDesignEditor/components/KonvaDesignViewer';

// ================ HOOK SIMPLIFICADO PARA SCROLL ================
const useScroll = () => {
  // ✅ SIMPLIFICADO: Solo retornar props vacías para mantener compatibilidad
  // El scroll funciona automáticamente con overflowY: 'auto'
  return {
    scrollProps: {}
  };
};

// ================ HOOK PARA PERSISTENCIA DE CANVAS ================
const useCanvasPersistence = () => {
  const [canvasData, setCanvasData] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const saveCanvasData = useCallback((data) => {
    console.log('💾 [CanvasPersistence] Guardando datos del canvas:', data);
    setCanvasData(data);
  }, []);

  const loadCanvasData = useCallback(() => {
    console.log('📂 [CanvasPersistence] Cargando datos del canvas:', canvasData);
    return canvasData;
  }, [canvasData]);

  // ✅ NUEVO: Función para obtener datos actuales sin dependencias
  const getCurrentCanvasData = useCallback(() => {
    return canvasData;
  }, [canvasData]);

  const openEditor = useCallback((initialData = null) => {
    console.log('🎨 [CanvasPersistence] Abriendo editor con datos:', initialData);
    if (initialData) {
      setCanvasData(initialData);
    }
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    console.log('❌ [CanvasPersistence] Cerrando editor');
    setIsEditorOpen(false);
  }, []);

  const openPreview = useCallback(() => {
    console.log('👁️ [CanvasPersistence] Abriendo vista previa');
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    console.log('❌ [CanvasPersistence] Cerrando vista previa');
    setIsPreviewOpen(false);
  }, []);

  return {
    canvasData,
    isEditorOpen,
    isPreviewOpen,
    saveCanvasData,
    loadCanvasData,
    getCurrentCanvasData,
    openEditor,
    closeEditor,
    openPreview,
    closePreview
  };
};

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
      
      // ✅ CORRECCIÓN: Validación unificada del texto (consistente con ValidationService)
      if (element.type === 'text') {
        const textContent = element.text || element.konvaAttrs?.text || '';
        if (!textContent || textContent.trim() === '') {
          errors.push(`Elemento de texto ${index + 1}: texto vacío`);
        }
      }
      
      if (element.type === 'image') {
        // Validar que tenga al menos una fuente de imagen
        const hasImageUrl = element.konvaAttrs?.imageUrl || element.imageUrl;
        const hasImage = element.konvaAttrs?.image || element.image;
        const hasSrc = element.src;
        
        if (!hasImageUrl && !hasImage && !hasSrc) {
          errors.push(`Elemento de imagen ${index + 1}: URL de imagen no definida`);
        }
      }
      
      // Validaciones para formas básicas
      if (element.type === 'rect' || element.type === 'circle') {
        if (element.konvaAttrs?.width === 0 || element.konvaAttrs?.height === 0) {
          errors.push(`Elemento de forma ${index + 1}: dimensiones inválidas`);
        }
      }
      
      // Validaciones para formas con puntos
      if (element.type === 'triangle' || element.type === 'star' || element.type === 'customShape' || element.type === 'line') {
        if (!element.konvaAttrs?.points || element.konvaAttrs.points.length === 0) {
          errors.push(`Elemento de forma ${index + 1}: puntos no definidos`);
        } else if (element.konvaAttrs.points.length < 6) {
          errors.push(`Elemento de forma ${index + 1}: debe tener al menos 3 puntos (6 coordenadas)`);
        }
      }
    });
    
    // Validación para datos del canvas (nuevo formato)
    if (elements && elements.canvas) {
      const canvasObjects = elements.canvas.objects || [];
      if (canvasObjects.length === 0) {
        errors.push('El canvas no contiene elementos');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ================ CUSTOM POPPER PARA DROPDOWNS SIN ANIMACIONES ================
const CustomPopper = styled(Popper)(({ theme }) => ({
  zIndex: 99999, // Z-index más alto
  '& *': {
    transition: 'none !important',
    animation: 'none !important',
    transform: 'none !important',
  },
  '& .MuiPaper-root': {
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.16)',
    border: `1px solid ${alpha('#1F64BF', 0.12)}`,
    marginTop: '4px',
    maxHeight: '300px',
    overflow: 'auto',
    transition: 'none !important',
    animation: 'none !important',
    transform: 'none !important',
    '& *': {
      transition: 'none !important',
      animation: 'none !important',
      transform: 'none !important',
    },
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha('#1F64BF', 0.3),
      borderRadius: '3px',
      '&:hover': {
        background: alpha('#1F64BF', 0.5),
      },
    },
  }
}));

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  zIndex: 1500, // Z-index alto para estar por encima del navbar
  '& .MuiDialog-paper': {
    borderRadius: '40px', // Más redondeado
    background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)',
    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(24px)',
    border: 'none', // Quitado el borde blanco
    maxWidth: '1400px',
    width: '95vw',
    maxHeight: '92vh',
    margin: '24px',
    overflow: 'hidden',
    animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1501, // Z-index alto en el paper
  },
  '& .MuiBackdrop-root': {
    zIndex: 1499 // Backdrop con z-index alto
  },
  '@keyframes modalSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.95) translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1) translateY(0)',
    },
  },
}));

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  padding: '32px 40px',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  borderRadius: '40px 40px 0 0', // Más redondeado
  overflow: 'hidden',
  border: 'none', // Quitado el borde blanco
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(50px, -50px)',
    animation: 'float 6s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(-30px, 30px)',
    animation: 'float 8s ease-in-out infinite reverse',
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translate(50px, -50px) scale(1)',
    },
    '50%': {
      transform: 'translate(60px, -40px) scale(1.1)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '24px 32px',
  }
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 800,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  zIndex: 2,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  letterSpacing: '-0.02em',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const CloseButton = styled(IconButton)({
  color: 'white',
  background: 'rgba(255, 255, 255, 0.15)',
  width: '52px',
  height: '52px',
  borderRadius: '18px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 2,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    transform: 'scale(1.1) translateY(-3px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'scale(0.95) translateY(-1px)',
  },
});

const ModalContent = styled(DialogContent)(({ theme }) => ({
  padding: '40px',
  background: 'linear-gradient(135deg, #FAFBFC 0%, #F8F9FA 100%)',
  borderRadius: '0 0 40px 40px', // Más redondeado
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  minHeight: 0, // ✅ AÑADIDO: Permitir que el contenido se colapse
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(31, 100, 191, 0.3) 50%, transparent 100%)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '32px 24px',
  }
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  padding: '24px',
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
  '& .MuiStep-root': {
    '& .MuiStepLabel-root': {
      '& .MuiStepLabel-label': {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#1F64BF',
        letterSpacing: '-0.01em',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&.Mui-active': {
          color: '#1F64BF',
          fontWeight: 800,
          transform: 'scale(1.02)',
        },
        '&.Mui-completed': {
          color: '#040DBF',
          fontWeight: 700,
        }
      }
    }
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '32px',
    padding: '20px',
    '& .MuiStepLabel-label': {
      fontSize: '0.8rem !important'
    }
  }
}));

const StepContent = styled(Box)({
  minHeight: '400px',
  maxHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  padding: '24px',
  background: 'rgba(255, 255, 255, 0.6)',
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
  overflowY: 'auto',
  overflowX: 'hidden',
  flex: '1',
  // ✅ MEJORADO: Scrollbar personalizado más robusto
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(31, 100, 191, 0.4)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(31, 100, 191, 0.6)',
    },
  },
  // ✅ MEJORADO: Scroll suave
  scrollBehavior: 'smooth',
  // ✅ MEJORADO: Mejor rendimiento
  willChange: 'scroll-position',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
  },
});

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: '32px',
  borderRadius: '24px',
  border: '1px solid rgba(31, 100, 191, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(242, 242, 242, 0.9) 100%)',
  boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
  backdropFilter: 'blur(20px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #1F64BF 0%, #040DBF 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    boxShadow: '0 16px 48px rgba(31, 100, 191, 0.15)',
    transform: 'translateY(-4px) scale(1.01)',
    '&::before': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '24px',
  }
}));

const SectionTitle = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#1F64BF',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  letterSpacing: '-0.02em',
  textShadow: '0 2px 4px rgba(31, 100, 191, 0.1)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #1F64BF 0%, #040DBF 100%)',
    borderRadius: '2px',
  },
});

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(31, 100, 191, 0.1)',
    paddingTop: '16px', // Espacio adicional para evitar solapamiento
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(31, 100, 191, 0.3)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(31, 100, 191, 0.1)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 4px rgba(31, 100, 191, 0.15)',
      transform: 'translateY(-2px)',
    },
    '& fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    }
  },
  '& .MuiInputLabel-root': {
    color: '#1F64BF',
    fontWeight: 600,
    marginTop: '8px', // Espacio adicional para evitar solapamiento
    '&.Mui-focused': {
      color: '#1F64BF',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '0 8px',
      borderRadius: '4px',
    }
  }
}));

// ================ DROPDOWN PERSONALIZADO SIN MUI (COMO TestDropDown) ================
const CustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  loading = false, 
  placeholder = "Seleccionar...",
  getOptionLabel = (option) => option.name || option,
  renderOption = null,
  error = false,
  helperText = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option => {
    const label = getOptionLabel(option);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    onChange(option);
    setSearchTerm(getOptionLabel(option));
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit'
      }}
    >
      {/* Input personalizado */}
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '16px 50px 16px 16px', // Aumentado padding derecho para la flecha más grande
          border: `1px solid ${error ? '#d32f2f' : 'rgba(31, 100, 191, 0.1)'}`,
          borderRadius: '16px',
          fontSize: '16px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          fontFamily: 'inherit',
          fontWeight: '500',
          color: '#1F64BF',
          '&:focus': {
            borderColor: '#1F64BF',
            boxShadow: '0 0 0 4px rgba(31, 100, 191, 0.15)',
          }
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1F64BF';
          e.target.style.boxShadow = '0 0 0 4px rgba(31, 100, 191, 0.15)';
          e.target.style.transform = 'translateY(-2px)';
          setIsOpen(true);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#d32f2f' : 'rgba(31, 100, 191, 0.1)';
          e.target.style.boxShadow = 'none';
          e.target.style.transform = 'translateY(0)';
        }}
      />

      {/* Icono de flecha */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          right: '16px',
          top: '40%', // Movido más arriba
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent', // Más grande
          borderRight: '8px solid transparent', // Más grande
          borderTop: '8px solid #1F64BF', // Más grande y con color de la paleta
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(isOpen && {
            transform: 'translateY(-50%) rotate(180deg)'
          })
        }}
      />

      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            right: '50px', // Ajustado para la flecha más grande
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #1F64BF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}

      {/* Dropdown list - SIN ANIMACIONES */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            zIndex: 99999,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(31, 100, 191, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(31, 100, 191, 0.15)',
            maxHeight: '200px', // Reducido de 300px a 200px
            overflowY: 'auto',
            marginTop: '8px',
            // SIN ANIMACIONES - APARECE INSTANTÁNEAMENTE
            transition: 'none !important',
            transform: 'none !important',
            animation: 'none !important',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{
              padding: '16px',
              color: '#666',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {loading ? 'Cargando...' : 'No hay resultados'}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.id || option._id || index}
                onClick={() => handleOptionClick(option)}
                style={{
                  padding: '12px 16px', // Reducido padding para más compacto
                  cursor: 'pointer',
                  borderBottom: index < filteredOptions.length - 1 ? '1px solid rgba(31, 100, 191, 0.1)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '12px',
                  margin: '2px 8px', // Reducido margin
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(31, 100, 191, 0.08)';
                  e.target.style.transform = 'translateX(4px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(31, 100, 191, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {renderOption ? renderOption(option) : (
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {getOptionLabel(option)}
                    </div>
                    {option.email && (
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {option.email}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: error ? '#d32f2f' : '#1F64BF',
          fontWeight: '500',
          letterSpacing: '-0.01em',
          opacity: 0.8,
        }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

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
  borderRadius: '16px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 700,
  textTransform: 'none',
  minWidth: '140px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
  ...(buttonVariant === 'contained' ? {
    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
    color: 'white',
    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '&:hover': {
      background: 'linear-gradient(135deg, #032CA6 0%, #040DBF 100%)',
      boxShadow: '0 12px 40px rgba(31, 100, 191, 0.4)',
      transform: 'translateY(-3px) scale(1.02)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(0.98)',
    },
  } : {
    border: '2px solid #1F64BF',
    color: '#1F64BF',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    '&:hover': {
      background: 'rgba(31, 100, 191, 0.1)',
      borderColor: '#032CA6',
      color: '#032CA6',
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 8px 24px rgba(31, 100, 191, 0.2)',
    },
    '&:active': {
      transform: 'translateY(0) scale(0.98)',
    },
  })
}));

const CrystalIconButton = styled(IconButton)({
  background: 'rgba(31, 100, 191, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(31, 100, 191, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    background: 'rgba(31, 100, 191, 0.2)',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 20px rgba(31, 100, 191, 0.3)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0) scale(0.95)',
  },
});

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

  // ==================== CANVAS PERSISTENCE HOOK ====================
  const {
    canvasData,
    isEditorOpen,
    isPreviewOpen,
    saveCanvasData,
    loadCanvasData,
    getCurrentCanvasData,
    openEditor,
    closeEditor,
    openPreview,
    closePreview
  } = useCanvasPersistence();

  // ==================== EFECTOS ====================
  // Agregar CSS para spinner de loading
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (editMode && designToEdit) {
      const editData = {
        name: designToEdit.name || '',
        userId: designToEdit.user?.id || designToEdit.user?._id || '',
        productId: designToEdit.product?.id || designToEdit.product?._id || '',
        elements: designToEdit.elements || [],
        productOptions: designToEdit.productOptions || [],
        clientNotes: designToEdit.clientNotes || '',
        mode: designToEdit.metadata?.mode || 'simple',
        productColorFilter: designToEdit.productColorFilter || null
      };
      
      setDesignData(editData);
      setDesignElements(designToEdit.elements || []);
      
      // ✅ NUEVO: Guardar datos del diseño en canvasData para el editor
      const canvasDataForEdit = {
        elements: designToEdit.elements || [],
        productColorFilter: designToEdit.productColorFilter || null,
        canvasData: designToEdit.canvasData || null,
        metadata: designToEdit.metadata || {}
      };
      
      console.log('🔄 [CreateDesignModal] Preparando datos para reedición:', canvasDataForEdit);
      saveCanvasData(canvasDataForEdit);
      
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
      
      // ✅ NUEVO: Limpiar canvasData para modo creación
      saveCanvasData(null);
    }
    
    setActiveStep(0);
    setErrors({});
    setShowEditor(false);
    setShowPreview(false);
  }, [editMode, designToEdit, isOpen, saveCanvasData]);

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
      Swal.fire({
        title: '⚠️ Producto Requerido',
        text: 'Debe seleccionar un producto antes de abrir el editor',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F59E0B'
      });
      setErrors({ productId: 'Debe seleccionar un producto primero' });
      return;
    }
    
    // ✅ CORREGIDO: Usar datos persistidos si existen, sino usar elementos actuales
    const savedData = loadCanvasData();
    const initialData = savedData || { elements: designElements };
    
    console.log('🎨 [CreateDesignModal] Abriendo editor con:', {
      tieneDataGuardado: !!savedData,
      elementosEnData: savedData?.elements?.length || 0,
      elementosEnEstado: designElements.length,
      filtroColor: savedData?.productColorFilter || null
    });
    
    openEditor(initialData);
  }, [designData.productId, designElements, loadCanvasData, openEditor]);

  const handleCloseEditor = useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  const handleSaveDesign = useCallback((designDataFromEditor) => {
    // El editor ya envía los elementos en formato correcto
    const elements = designDataFromEditor.elements || [];
    const productColorFilter = designDataFromEditor.productColorFilter;
    const canvasData = designDataFromEditor.canvasData;
    
    // ✅ MEJORADO: Persistir datos del canvas
    saveCanvasData(designDataFromEditor);
    
    // Validar elementos
    const validation = DesignService.validateElementsForSubmission(elements);
    if (!validation.isValid) {
      Swal.fire({
        title: '❌ Elementos Inválidos',
        html: `
          <p>Los elementos del diseño tienen errores:</p>
          <ul style="text-align: left; margin: 10px 0;">
            ${validation.errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444'
      });
      setErrors({ elements: validation.errors.join('; ') });
      return;
    }

    // Actualizar estado con los datos del editor
    const finalDesignData = {
      ...designData,
      elements: elements,
      canvasData: canvasData,
      productColorFilter: productColorFilter || null,
      metadata: designDataFromEditor.metadata || {}
    };


    setDesignData(finalDesignData);
    setDesignElements(elements);
    closeEditor(); // ✅ CORREGIDO: Usar closeEditor() en lugar de setShowEditor(false)
    setErrors(prev => ({ ...prev, elements: undefined }));
    
    if (activeStep === 1) {
      setActiveStep(2);
    }
  }, [activeStep, designData, closeEditor]);

  const handlePreviewDesign = useCallback(() => {
    // ✅ CORREGIDO: Verificar que haya un diseño guardado
    const savedDesign = loadCanvasData();
    if (!savedDesign || !savedDesign.elements || savedDesign.elements.length === 0) {
      Swal.fire({
        title: '⚠️ Diseño Vacío',
        text: 'Debe guardar el diseño primero antes de previsualizarlo',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F59E0B'
      });
      setErrors({ elements: 'Debe guardar el diseño primero' });
      return;
    }
    // ✅ CORREGIDO: Usar el diseño guardado para la vista previa
    openPreview();
  }, [loadCanvasData, openPreview]);

  const handleClosePreview = useCallback(() => {
    closePreview();
  }, [closePreview]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(2)) return;
    
    try {
      setLoading(true);
      setErrors({}); // Limpiar errores previos
      
      const finalDesignData = {
        ...designData,
        elements: designElements,
        productColorFilter: designData.productColorFilter || null
      };
      
      console.log('📤 [CreateDesignModal] Enviando diseño:', finalDesignData);
      
      // Validar que el producto esté activo
      const selectedProduct = products.find(p => p.id === designData.productId || p._id === designData.productId);
      if (!selectedProduct) {
        console.error('❌ [CreateDesignModal] Producto no encontrado');
        Swal.fire({
          title: '❌ Producto No Encontrado',
          text: 'El producto seleccionado no existe o fue eliminado',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444'
        });
        setErrors({ productId: 'Producto no encontrado' });
        setLoading(false);
        return;
      }
      
      if (!selectedProduct.isActive) {
        console.error('❌ [CreateDesignModal] Producto inactivo:', selectedProduct.name);
        Swal.fire({
          title: '⚠️ Producto Desactivado',
          text: `El producto "${selectedProduct.name}" está desactivado y no se puede usar para crear diseños`,
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#F59E0B'
        });
        setErrors({ productId: 'Este producto está desactivado y no se puede usar para crear diseños' });
        setLoading(false);
        return;
      }
      
      // Validación de elementos antes de enviar
      const validation = DesignService.validateElementsForSubmission(designElements);
      if (!validation.isValid) {
        console.error('❌ [CreateDesignModal] Validación fallida:', validation.errors);
        setErrors({ elements: validation.errors.join('; ') });
        setLoading(false); // Importante: detener loading
        
        // Mostrar error con SweetAlert2
        Swal.fire({
          title: '❌ Elementos Inválidos',
          html: validation.errors.map(error => `<div>• ${error}</div>`).join(''),
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444'
        });
        return;
      }

      await onCreateDesign(finalDesignData);
      console.log('✅ [CreateDesignModal] Diseño creado exitosamente');
    } catch (error) {
      console.error('❌ [CreateDesignModal] Error submitting design:', error);
      setErrors({ submit: error.message || 'Error al crear el diseño' });
    } finally {
      setLoading(false); // Asegurar que siempre se detenga el loading
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

  // ==================== SCROLL HOOK ====================
  const { scrollProps } = useScroll();

  // ==================== DATOS MEMOIZADOS PARA VISTA PREVIA ====================
  const previewDesign = useMemo(() => {
    if (!isPreviewOpen) return null;
    
    const canvasData = loadCanvasData();
    return {
      elements: canvasData?.elements || designElements,
      productColorFilter: canvasData?.productColorFilter || null,
      metadata: canvasData?.metadata || {}
    };
  }, [isPreviewOpen, canvasData, designElements]);

  // ==================== RENDER STEPS ====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box
            sx={{
              minHeight: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              // ✅ Scrollbar personalizado
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(31, 100, 191, 0.4)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(31, 100, 191, 0.6)',
                },
              },
              scrollBehavior: 'smooth',
            }}
          >
            {/* ✅ Título simplificado */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '24px'
            }}>
              <Palette size={16} weight="bold" />
              <Typography variant="h6" fontWeight={600} color="#1F64BF">
                Información básica
              </Typography>
            </Box>
            
            {/* ✅ Formulario simplificado */}
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

              <CustomDropdown
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={selectedUser}
                onChange={(option) => {
                  handleInputChange('userId', option?.id || option?._id || '');
                }}
                loading={loadingUsers}
                placeholder="Buscar cliente por nombre o email"
                error={!!errors.userId}
                helperText={errors.userId || 'Buscar cliente por nombre o email'}
                renderOption={(option) => (
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {option.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {option.email}
                    </div>
                  </div>
                )}
              />

              <CustomDropdown
                options={products}
                getOptionLabel={(option) => option.name}
                value={selectedProduct}
                onChange={(option) => {
                  handleInputChange('productId', option?.id || option?._id || '');
                }}
                loading={loadingProducts}
                placeholder="Seleccionar producto base para personalizar"
                error={!!errors.productId}
                helperText={errors.productId || 'Seleccionar producto base para personalizar'}
                renderOption={(option) => (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    opacity: option.isActive ? 1 : 0.6
                  }}>
                    {(option.mainImage || option.images?.main) && (
                      <img
                        src={option.mainImage || option.images?.main}
                        alt={option.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {option.name}
                        {!option.isActive && (
                          <span style={{
                            fontSize: '12px',
                            color: '#f44336',
                            fontWeight: '500',
                            background: '#ffebee',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            INACTIVO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {option.formattedPrice || `${option.basePrice}` || 'Precio no disponible'}
                      </div>
                    </div>
                  </div>
                )}
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
          </Box>
        );

      case 1:
        return (
          <StepContent {...scrollProps}>
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
                        <CrystalIconButton
                          size="small"
                          onClick={handlePreviewDesign}
                        >
                          <Eye size={16} weight="bold" />
                        </CrystalIconButton>
                        <CrystalIconButton
                          size="small"
                          onClick={handleOpenEditor}
                        >
                          <PencilSimple size={16} weight="bold" />
                        </CrystalIconButton>
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
          <StepContent {...scrollProps}>
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
        disableEnforceFocus
        disableAutoFocus
        disableScrollLock={false}
        keepMounted={false}
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

      {/* ✅ EDITOR: Solo para edición */}
      {isEditorOpen && selectedProduct && (
        <>
          <KonvaDesignEditor
            isOpen={isEditorOpen}
            onClose={handleCloseEditor}
            product={selectedProduct}
            initialDesign={(() => {
              const savedData = getCurrentCanvasData();
              const fallbackData = { elements: designElements };
              return savedData || fallbackData;
            })()}
            onSave={handleSaveDesign}
            onBack={handleCloseEditor}
          />
        </>
      )}

      {/* ✅ VISTA PREVIA: Usar KonvaDesignViewer para vista previa */}
      {isPreviewOpen && selectedProduct && previewDesign && (
        <KonvaDesignViewer
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          design={previewDesign}
          product={selectedProduct}
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