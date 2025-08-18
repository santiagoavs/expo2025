import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Badge,
  Skeleton
} from '@mui/material';
import {
  Package,
  Eye,
  ShoppingCart,
  TrendUp,
  Plus,
  Funnel,
  MagnifyingGlass,
  ArrowsClockwise,
  GridNine,
  Broom,
  Star,
  ChartLine
} from '@phosphor-icons/react';

import Navbar from '../../components/NavBar/NavBar';
import ProductCard from '../../components/ProductCard/ProductCard';
import CreateProductModal from '../../components/CreateProductModal/CreateProductModal';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '2000';
    }
  }
});

// ================ ESTILOS MODERNOS RESPONSIVE ================
const PageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  background: 'white',
  width: '100%',
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1920px', // Máximo ancho permitido para pantallas grandes
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '24px', // Reducido para mejor uso del espacio
  paddingRight: '24px',
  minHeight: 'calc(100vh - 120px)',
  [theme.breakpoints.down('lg')]: {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '110px',
    paddingLeft: '18px',
    paddingRight: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '100px',
    paddingLeft: '16px',
    paddingRight: '16px',
  }
}));

const ModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const HeaderSection = styled(ModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%', // Asegurar que ocupe todo el ancho
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '24px',
  width: '100%', // Asegurar ancho completo
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const HeaderInfo = styled(Box)({
  flex: 1,
  width: '100%', // Asegurar ancho completo
});

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: '#010326',
  marginBottom: '8px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const MainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#032CA6',
  fontWeight: 400,
  lineHeight: 1.5,
  opacity: 0.9,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-end',
    gap: '10px',
    width: '100%', // Asegurar ancho completo
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    gap: '8px',
    '& > *': {
      width: '100%',
    }
  }
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: '140px',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 16px',
    justifyContent: 'center',
  }
}));

const SecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '48px',
  height: '48px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
  '&:hover': {
    background: alpha('#1F64BF', 0.12),
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: '48px',
    borderRadius: '12px',
  }
}));

// CONTENEDOR UNIFICADO corregido
const UnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%', // Usar todo el ancho disponible
  margin: '0 auto',
}));

const StatsContainer = styled(UnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS MEJORADO - SOLUCIÓN AL SOLAPAMIENTO
const StatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '20px',
  // Grid responsivo mejorado
  gridTemplateColumns: 'repeat(4, 1fr)', // Desktop - 4 columnas iguales
  [theme.breakpoints.down(1400)]: { // Pantallas grandes pero no ultra wide
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
  },
  [theme.breakpoints.down('lg')]: { // Tablets grandes (≥992px) 
    gridTemplateColumns: 'repeat(2, 1fr)', // 2x2 grid para tablets
    gap: '16px',
  },
  [theme.breakpoints.down('md')]: { // Tablets pequeñas (≥768px)
    gridTemplateColumns: 'repeat(2, 1fr)', // Mantener 2x2
    gap: '14px',
  },
  [theme.breakpoints.down('sm')]: { // Móviles grandes (≥600px)
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columnas en móviles grandes
    gap: '12px',
  },
  [theme.breakpoints.down(480)]: { // Móviles pequeños
    gridTemplateColumns: '1fr', // 1 columna para móviles muy pequeños
    gap: '10px',
  }
}));

const StatCard = styled(ModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'white',
      color: '#010326',
    }
  };

  const selectedVariant = variants[variant] || variants.secondary;

  return {
    padding: '24px',
    width: '100%',
    minHeight: '140px', // Altura mínima consistente
    maxHeight: 'auto', // Permitir crecimiento si es necesario
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Distribución uniforme del contenido
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box', // Incluir padding en el cálculo del width
    ...selectedVariant,
    '&::before': variant === 'primary' ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    } : {},
    [theme.breakpoints.down('lg')]: {
      padding: '20px',
      minHeight: '130px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '18px',
      minHeight: '120px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
      minHeight: '110px',
    }
  };
});

const StatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '12px',
  width: '100%',
});

const StatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant === 'primary' ? 'white' : '#1F64BF',
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    width: '40px',
    height: '40px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '36px',
    height: '36px',
  }
}));

const StatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '4px',
  color: variant === 'primary' ? 'white' : '#010326',
  [theme.breakpoints.down('lg')]: {
    fontSize: '1.8rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.6rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.4rem',
  }
}));

const StatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  opacity: variant === 'primary' ? 0.9 : 0.7,
  color: variant === 'primary' ? 'white' : '#032CA6',
  lineHeight: 1.3,
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const StatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: 'auto', // Empujar hacia abajo
  padding: '4px 8px',
  borderRadius: '6px',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : trend === 'up' 
      ? alpha('#10B981', 0.1) 
      : alpha('#EF4444', 0.1),
  width: 'fit-content',
}));

const StatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: variant === 'primary' 
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  }
}));

const ControlsSection = styled(ModernCard)(({ theme }) => ({
  padding: '24px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: '20px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '18px',
    marginBottom: '20px',
  }
}));

const ControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '14px',
  }
}));

const SearchSection = styled(Box)(({ theme }) => ({
  flex: 1,
  maxWidth: '500px',
  width: '100%', // Asegurar ancho completo
  [theme.breakpoints.down('md')]: {
    maxWidth: 'none',
  }
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    transition: 'all 0.3s ease',
    width: '100%', // Asegurar ancho completo
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(1, 3, 38, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 4px 16px rgba(31, 100, 191, 0.12)',
    }
  }
}));

const FiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  width: '100%', // Asegurar ancho completo
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    gap: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    gap: '8px',
    '& > *': {
      minWidth: 'fit-content',
    }
  }
}));

const FilterChip = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  borderRadius: '8px',
  background: active ? alpha('#1F64BF', 0.1) : '#F2F2F2',
  border: `1px solid ${active ? alpha('#1F64BF', 0.2) : 'transparent'}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: active ? '#1F64BF' : '#032CA6',
  '&:hover': {
    background: active ? alpha('#1F64BF', 0.15) : 'white',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '6px 10px',
    fontSize: '0.8rem',
  }
}));

const ProductsSection = styled(UnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%', // Asegurar ancho completo
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '12px',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const ProductsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '24px',
  width: '100%',
  // Grid responsivo para productos mejorado
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Desktop
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '14px',
  }
}));

const EmptyState = styled(ModernCard)(({ theme }) => ({
  padding: '80px 40px',
  textAlign: 'center',
  background: 'white',
  border: `2px dashed ${alpha('#1F64BF', 0.2)}`,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: '60px 30px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '40px 20px',
  }
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: alpha('#1F64BF', 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  color: '#1F64BF',
  [theme.breakpoints.down('sm')]: {
    width: '60px',
    height: '60px',
    marginBottom: '16px',
  }
}));

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '12px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const EmptyStateDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#032CA6',
  marginBottom: '32px',
  maxWidth: '400px',
  margin: '0 auto 32px',
  lineHeight: 1.5,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: '24px',
    maxWidth: '300px',
  }
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '20px',
});

const LoadingOverlay = styled(ModernCard)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '20px',
  marginBottom: '24px',
  background: alpha('#1F64BF', 0.04),
});

// ================ COMPONENTE PRINCIPAL ================
const CatalogManagement = () => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,
    updateProductStats,
    getProductStats,
    updateFilters,
    clearFilters,
    createSampleProducts,
    hasProducts,
    isEmpty
  } = useProducts();

  const {
    categories,
    loading: loadingCategories,
    error: categoriesError
  } = useCategories();

  // ==================== ESTADOS LOCALES ====================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // ==================== EFECTOS ====================
  useEffect(() => {
    updateFilters({
      search: searchQuery,
      isActive: selectedFilter === 'all' ? '' : selectedFilter === 'active',
      sort: sortOption,
      category: selectedCategory
    });
  }, [searchQuery, selectedFilter, sortOption, selectedCategory, updateFilters]);

  useEffect(() => {
    if (categoriesError) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No se pudieron cargar las categorías. Algunas funciones pueden estar limitadas.',
        icon: 'warning',
        confirmButtonColor: '#1F64BF',
      });
    }
  }, [categoriesError]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const productStats = getProductStats();
    
    return [
      {
        id: 'total-products',
        title: "Total de Productos",
        value: productStats.total,
        change: "+12% este mes",
        trend: "up",
        icon: Package,
        variant: "primary"
      },
      {
        id: 'active-products',
        title: "Productos Activos",
        value: productStats.active,
        change: `${productStats.active}/${productStats.total} activos`,
        trend: "up",
        icon: Eye,
        variant: "secondary"
      },
      {
        id: 'total-orders',
        title: "Pedidos Totales",
        value: productStats.totalOrders,
        change: "+8% vs mes anterior",
        trend: "up",
        icon: ShoppingCart,
        variant: "secondary"
      },
      {
        id: 'featured-products',
        title: "Productos Destacados",
        value: productStats.featured,
        change: "Productos premium",
        trend: "up",
        icon: Star,
        variant: "secondary"
      }
    ];
  }, [getProductStats]);

  // ==================== MANEJADORES ====================
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
  };

  const handleProductCreated = async (productData, mode = 'create') => {
    try {
      if (mode === 'edit' && editingProduct) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await createProduct(productData);
      }
      
      setShowCreateModal(false);
      setEditingProduct(null);

      await Swal.fire({
        title: '¡Éxito!',
        text: mode === 'edit' ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    } catch (error) {
      console.error('Error en handleProductCreated:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} el producto`,
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleEditProduct = async (productId) => {
    try {
      updateProductStats(productId, 'view');
      const productData = await getProductById(productId);
      if (productData) {
        setEditingProduct(productData);
        setShowCreateModal(true);
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el producto para editar',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const productName = product?.name || 'este producto';
      
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });

      if (isConfirmed) {
        await deleteProduct(productId, productName);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: {
            container: 'swal-overlay-custom',
            popup: 'swal-modal-custom'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleViewProduct = (productId) => {
    updateProductStats(productId, 'view');
    const product = products.find(p => p.id === productId);
    if (product) {
      Swal.fire({
        title: product.name,
        html: `
          <div style="text-align: left; padding: 20px; line-height: 1.6;">
            <div style="margin-bottom: 12px;"><strong>Precio:</strong> ${product.formattedPrice}</div>
            <div style="margin-bottom: 12px;"><strong>Categoría:</strong> ${product.categoryName}</div>
            <div style="margin-bottom: 12px;"><strong>Estado:</strong> ${product.statusText}</div>
            <div style="margin-bottom: 12px;"><strong>Pedidos:</strong> ${product.totalOrders}</div>
            <div style="margin-bottom: 12px;"><strong>Vistas:</strong> ${product.totalViews}</div>
            ${product.description ? `<div style="margin-top: 16px;"><strong>Descripción:</strong><br/><span style="color: #666;">${product.description}</span></div>` : ''}
          </div>
        `,
        imageUrl: product.mainImage,
        imageWidth: 300,
        imageHeight: 200,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#1F64BF',
        width: 600,
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortOption('newest');
    setSelectedCategory('');
    clearFilters();
  };

  const handleCreateSamples = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Crear productos de ejemplo?',
        text: 'Esto creará varios productos de ejemplo para testing',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });

      if (result.isConfirmed) {
        await createSampleProducts();
        await Swal.fire({
          title: '¡Productos creados!',
          text: 'Se han creado los productos de ejemplo exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: {
            container: 'swal-overlay-custom',
            popup: 'swal-modal-custom'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudieron crear los productos de ejemplo',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  // ==================== RENDER ====================
  if (loading && !hasProducts) {
    return (
      <PageContainer>
        <Navbar />
        <ContentWrapper>
          <LoadingContainer>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography variant="body1" sx={{ color: '#010326', fontWeight: 600 }}>
              Cargando catálogo de productos...
            </Typography>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar />
      
      <ContentWrapper>
        {/* Header Principal */}
        <HeaderSection>
          <HeaderContent>
            <HeaderInfo>
              <MainTitle>
                Gestión de Productos
              </MainTitle>
              <MainDescription>
                Administra tu catálogo de productos personalizados y plantillas
              </MainDescription>
            </HeaderInfo>
            
            <HeaderActions>
              <PrimaryActionButton
                onClick={handleCreateProduct}
                disabled={loading}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nuevo Producto
              </PrimaryActionButton>
              
              <SecondaryActionButton
                onClick={fetchProducts}
                disabled={loading}
                title="Refrescar productos"
              >
                <ArrowsClockwise size={20} weight="bold" />
              </SecondaryActionButton>
            </HeaderActions>
          </HeaderContent>
        </HeaderSection>

        {/* Mensajes de Error */}
        {error && (
          <ModernCard sx={{ 
            p: 3, 
            mb: 4,
            background: alpha('#dc2626', 0.05),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#dc2626', fontWeight: 500 }}>
                ⚠️ {error}
              </Typography>
              <Button 
                size="small" 
                onClick={fetchProducts}
                sx={{ 
                  color: '#dc2626',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Reintentar
              </Button>
            </Box>
          </ModernCard>
        )}

        {/* Estadísticas - Ahora alineadas con el contenido */}
        <StatsContainer>
          <StatsGrid>
            {stats.map((stat) => (
              <StatCard key={stat.id} variant={stat.variant}>
                <StatHeader>
                  <Box>
                    <StatValue variant={stat.variant}>
                      {stat.value}
                    </StatValue>
                    <StatLabel variant={stat.variant}>
                      {stat.title}
                    </StatLabel>
                  </Box>
                  <StatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </StatIconContainer>
                </StatHeader>
                <StatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <StatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </StatTrendText>
                </StatChange>
              </StatCard>
            ))}
          </StatsGrid>
        </StatsContainer>

        {/* Controles de búsqueda y filtros */}
        <ControlsSection>
          <ControlsContent>
            <SearchSection>
              <ModernTextField
                fullWidth
                placeholder="Buscar productos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={18} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchSection>

            <FiltersSection>
              <FilterChip 
                active={selectedFilter !== 'all'}
                onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'active' : 'all')}
              >
                <Funnel size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="inactive">Inactivos</MenuItem>
                  </Select>
                </FormControl>
              </FilterChip>

              <FilterChip active={selectedCategory !== ''}>
                <Package size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    displayEmpty
                    disabled={loadingCategories || categoriesError}
                    sx={{
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }
                    }}
                  >
                    <MenuItem value="">
                      {loadingCategories ? 'Cargando...' : 
                       categoriesError ? 'Error' : 
                       'Categorías'}
                    </MenuItem>
                    {!categoriesError && categories.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FilterChip>

              <FilterChip active={sortOption !== 'newest'}>
                <ChartLine size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    sx={{
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }
                    }}
                  >
                    <MenuItem value="newest">Más nuevos</MenuItem>
                    <MenuItem value="oldest">Más antiguos</MenuItem>
                    <MenuItem value="name_asc">A-Z</MenuItem>
                    <MenuItem value="name_desc">Z-A</MenuItem>
                    <MenuItem value="price_asc">Precio ↑</MenuItem>
                    <MenuItem value="price_desc">Precio ↓</MenuItem>
                  </Select>
                </FormControl>
              </FilterChip>

              {(searchQuery || selectedFilter !== 'all' || selectedCategory || sortOption !== 'newest') && (
                <Button
                  onClick={handleClearFilters}
                  startIcon={<Broom size={16} weight="bold" />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#032CA6',
                    backgroundColor: alpha('#032CA6', 0.1),
                    padding: '8px 12px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: alpha('#032CA6', 0.15),
                    }
                  }}
                >
                  Limpiar
                </Button>
              )}
            </FiltersSection>
          </ControlsContent>
        </ControlsSection>

        {/* Lista de Productos */}
        <ProductsSection>
          <SectionHeader>
            <SectionTitle>
              <GridNine size={24} weight="duotone" />
              Productos
              <Chip 
                label={`${products.length}${pagination.totalProducts !== products.length ? ` de ${pagination.totalProducts}` : ''}`}
                size="small"
                sx={{
                  background: alpha('#1F64BF', 0.1),
                  color: '#032CA6',
                  fontWeight: 600,
                  ml: 1
                }}
              />
            </SectionTitle>
          </SectionHeader>

          {/* Estado de carga durante refetch */}
          {loading && hasProducts && (
            <LoadingOverlay>
              <CircularProgress size={20} sx={{ color: '#1F64BF' }} />
              <Typography variant="body2" sx={{ color: '#1F64BF', fontWeight: 600 }}>
                Actualizando productos...
              </Typography>
            </LoadingOverlay>
          )}

          {/* Lista de productos */}
          {products.length > 0 ? (
            <>
              <ProductsGrid>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.mainImage}
                    price={product.basePrice}
                    status={product.isActive ? 'active' : 'inactive'}
                    category={product.categoryName}
                    sales={product.totalOrders}
                    createdAt={product.createdAt}
                    rank={product.isFeatured ? 1 : null}
                    isTopProduct={product.isFeatured}
                    onEdit={() => handleEditProduct(product.id)}
                    onDelete={() => handleDeleteProduct(product.id)}
                    onView={() => handleViewProduct(product.id)}
                  />
                ))}
              </ProductsGrid>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 5,
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => fetchProducts({ page: pagination.currentPage - 1 })}
                    disabled={!pagination.hasPrev || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: '#1F64BF',
                        backgroundColor: alpha('#1F64BF', 0.05),
                      },
                      '&:disabled': {
                        borderColor: alpha('#1F64BF', 0.1),
                        color: alpha('#1F64BF', 0.3),
                      }
                    }}
                  >
                    ← Anterior
                  </Button>
                  
                  <ModernCard sx={{ 
                    px: 3, 
                    py: 1,
                    minWidth: { xs: '100%', sm: 'auto' },
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 600 }}>
                      {pagination.currentPage} de {pagination.totalPages}
                    </Typography>
                  </ModernCard>
                  
                  <Button
                    variant="outlined"
                    onClick={() => fetchProducts({ page: pagination.currentPage + 1 })}
                    disabled={!pagination.hasNext || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: '#1F64BF',
                        backgroundColor: alpha('#1F64BF', 0.05),
                      },
                      '&:disabled': {
                        borderColor: alpha('#1F64BF', 0.1),
                        color: alpha('#1F64BF', 0.3),
                      }
                    }}
                  >
                    Siguiente →
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <Package size={40} weight="duotone" />
              </EmptyStateIcon>
              <EmptyStateTitle>
                {searchQuery || selectedFilter !== 'all' || selectedCategory 
                  ? 'No hay productos que coincidan' 
                  : 'No hay productos en el catálogo'
                }
              </EmptyStateTitle>
              <EmptyStateDescription>
                {searchQuery || selectedFilter !== 'all' || selectedCategory
                  ? 'Intenta ajustar los filtros de búsqueda o crear un nuevo producto para comenzar'
                  : 'Comienza creando tu primer producto personalizado para el catálogo'
                }
              </EmptyStateDescription>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
                <PrimaryActionButton
                  onClick={handleCreateProduct}
                  startIcon={<Plus size={18} weight="bold" />}
                  sx={{
                    minWidth: { xs: '100%', sm: '140px' }
                  }}
                >
                  Crear Producto
                </PrimaryActionButton>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="outlined"
                    onClick={handleCreateSamples}
                    startIcon={<span style={{ fontSize: '16px' }}>🧪</span>}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      padding: '12px 24px',
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: '#1F64BF',
                        backgroundColor: alpha('#1F64BF', 0.05),
                      }
                    }}
                  >
                    Crear Ejemplos
                  </Button>
                )}
              </Box>
            </EmptyState>
          )}
        </ProductsSection>
      </ContentWrapper>

      {/* Modal de creación/edición de producto */}
      {showCreateModal && (
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onCreateProduct={handleProductCreated}
          editMode={!!editingProduct}
          productToEdit={editingProduct}
        />
      )}
    </PageContainer>
  );
};

export default CatalogManagement;