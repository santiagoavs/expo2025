// src/pages/DesignManagement/DesignManagement.jsx - PANEL ADMINISTRATIVO COMPLETO DE DISEÑOS
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Palette,
  Eye,
  TrendUp,
  Plus,
  Funnel,
  MagnifyingGlass,
  ArrowsClockwise,
  GridNine,
  Broom,
  Users,
  Clock,
  CheckCircle,
  Money,
  Package,
  Warning,
  XCircle,
  ChartLine,
  Calendar,
  FileText,
  Download,
  SortAscending,
  SortDescending,
  PencilSimple
} from '@phosphor-icons/react';

// Importar componentes personalizados  
import DesignCard from '../../components/DesignCard/DesignCard';
import CreateDesignModal from '../../components/CreateDesignModal/CreateDesignModal';
import QuoteDesignModal from '../../components/QuoteDesignModal/QuoteDesignModal';
import KonvaDesignViewer from '../../components/KonvaDesignViewer/KonvaDesignViewer';

// Importar hooks personalizados
import useDesigns from '../../hooks/useDesigns';
import useProducts from '../../hooks/useProducts';
import useUsers from '../../hooks/useUsers';

// ================ ESTILOS MODERNOS ================
const DesignPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const DesignContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '24px',
  paddingRight: '24px',
  minHeight: 'calc(100vh - 120px)',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1400px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1200px',
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

// Header Section
const DesignHeaderSection = styled(ModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const DesignHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const DesignHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
  }
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: '#010326',
  marginBottom: '8px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
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
    width: '100%',
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
  '&:disabled': {
    background: alpha('#1F64BF', 0.3),
    color: alpha('#ffffff', 0.7),
    boxShadow: 'none',
    transform: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 16px',
    justifyContent: 'center',
  }
}));

const SecondaryActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 20px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  borderColor: alpha('#1F64BF', 0.3),
  color: '#1F64BF',
  minWidth: '120px',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    background: alpha('#1F64BF', 0.05),
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 16px',
    justifyContent: 'center',
  }
}));

// Estadísticas
const StatsContainer = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
  width: '100%',
}));

const StatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(4, 1fr)',
  [theme.breakpoints.down(1400)]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
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
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
    },
    warning: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
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
    minHeight: '140px',
    maxHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'pointer',
    ...selectedVariant,
    '&::before': (variant === 'primary' || variant === 'success' || variant === 'warning') ? {
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
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
    },
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
  background: (variant === 'primary' || variant === 'success' || variant === 'warning')
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#1F64BF',
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
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#010326',
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
  opacity: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 0.9 : 0.7,
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#032CA6',
  lineHeight: 1.3,
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const StatTrend = styled(Box)(({ variant, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: 'auto',
  fontSize: '0.75rem',
  opacity: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 0.9 : 0.8,
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#059669',
  fontWeight: 500,
}));

// Controles y filtros
const DesignControlsSection = styled(ModernCard)(({ theme }) => ({
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

const DesignControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
}));

const DesignSearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
  }
}));

const DesignModernTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8F9FA',
    transition: 'all 0.3s ease',
    border: 'none',
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
    },
    '& input': {
      color: '#010326',
      '&::placeholder': {
        color: '#032CA6',
        opacity: 0.7,
      }
    }
  }
}));

const DesignFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  width: '100%',
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

const DesignFilterControl = styled(FormControl)(({ theme }) => ({
  minWidth: '140px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8F9FA',
    height: '40px',
    fontSize: '0.875rem',
    border: 'none',
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
    },
    '& .MuiSelect-select': {
      color: '#010326',
    }
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '120px',
  }
}));

const DesignSortControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '12px',
  backgroundColor: '#F8F9FA',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(1, 3, 38, 0.08)',
  }
}));

// Lista de diseños
const DesignsSection = styled(Box)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
  width: '100%',
});

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%',
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

const DesignsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '24px',
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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

const LoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '20px',
});

const ErrorAlert = styled(ModernCard)(({ theme }) => ({
  padding: '20px',
  marginBottom: '24px',
  background: alpha('#EF4444', 0.05),
  border: `1px solid ${alpha('#EF4444', 0.2)}`,
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '40px',
  gap: '16px',
  flexDirection: 'row',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '12px',
  }
}));

// ================ COMPONENTE PRINCIPAL ================
const DesignManagement = () => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    designs,
    loading,
    error,
    pagination,
    filters,
    fetchDesigns,
    createDesignForClient,
    getDesignById,
    cloneDesign,
    submitQuote,
    changeDesignStatus,
    cancelDesign,
    getDesignStats,
    updateFilters,
    clearFilters,
    hasDesigns,
    isEmpty,
    refetch
  } = useDesigns();

  const {
    products,
    loading: loadingProducts,
    fetchProducts
  } = useProducts();

  const {
    users,
    loading: loadingUsers,
    fetchUsers
  } = useUsers();

  // ==================== ESTADOS LOCALES ====================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingDesign, setEditingDesign] = useState(null);
  const [quotingDesign, setQuotingDesign] = useState(null);
  const [viewingDesign, setViewingDesign] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ==================== EFECTOS ====================
  
  // Actualizar filtros cuando cambien los valores locales
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({
        search: searchQuery,
        status: selectedStatus,
        product: selectedProduct,
        user: selectedUser,
        sort: sortOption,
        order: sortOrder
      });
    }, 300); // Debounce para búsqueda

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedStatus, selectedProduct, selectedUser, sortOption, sortOrder, updateFilters]);

  // Cargar datos iniciales
  useEffect(() => {
    if (products.length === 0 && !loadingProducts) {
      fetchProducts();
    }
    if (users.length === 0 && !loadingUsers) {
      fetchUsers();
    }
  }, [products.length, users.length, loadingProducts, loadingUsers, fetchProducts, fetchUsers]);

  // ==================== ESTADÍSTICAS CALCULADAS ====================
  const stats = useMemo(() => {
    const designStats = getDesignStats();
    
    return [
      {
        id: 'total-designs',
        title: "Total de Diseños",
        value: designStats.total,
        change: "+15% este mes",
        trend: "up",
        icon: Palette,
        variant: "primary",
        onClick: () => handleFilterByStatus('')
      },
      {
        id: 'pending-designs',
        title: "Pendientes de Cotizar",
        value: designStats.pending,
        change: designStats.pending > 0 ? `${designStats.pending} requieren atención` : 'Al día',
        trend: designStats.pending > 0 ? "warning" : "up",
        icon: Clock,
        variant: designStats.pending > 0 ? "warning" : "secondary",
        onClick: () => handleFilterByStatus('pending')
      },
      {
        id: 'approved-designs',
        title: "Diseños Aprobados",
        value: designStats.approved,
        change: `${designStats.conversionRate.toFixed(1)}% tasa de conversión`,
        trend: "up",
        icon: CheckCircle,
        variant: "success",
        onClick: () => handleFilterByStatus('approved')
      },
      {
        id: 'total-revenue',
        title: "Ingresos por Diseños",
        value: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(designStats.totalRevenue),
        change: "Solo diseños aprobados",
        trend: "up",
        icon: Money,
        variant: "secondary",
        onClick: () => handleFilterByStatus('approved')
      }
    ];
  }, [getDesignStats]);

  // ==================== MANEJADORES DE FILTROS ====================
  
  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedProduct('');
    setSelectedUser('');
    setSortOption('createdAt');
    setSortOrder('desc');
    clearFilters();
  };

  // ==================== MANEJADORES DE ACCIONES ====================
  
  const handleCreateDesign = () => {
    setEditingDesign(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingDesign(null);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setQuotingDesign(null);
  };

  const handleCloseViewerModal = () => {
    setShowViewerModal(false);
    setViewingDesign(null);
  };

  const handleDesignCreated = async (designData) => {
    try {
      setActionLoading(true);
      await createDesignForClient(designData);
      setShowCreateModal(false);
      setEditingDesign(null);

      await Swal.fire({
        title: '¡Diseño creado exitosamente!',
        text: 'El diseño se ha enviado para cotización',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        }
      });
    } catch (error) {
      console.error('Error en handleDesignCreated:', error);
      await Swal.fire({
        title: 'Error al crear diseño',
        text: error.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDesign = async (designId) => {
    try {
      setActionLoading(true);
      const design = await getDesignById(designId);
      if (design) {
        // Encontrar el producto correspondiente para el visor
        const product = products.find(p => p.id === design.productId || p._id === design.productId);
        
        setViewingDesign({
          ...design,
          product: product || design.product
        });
        setShowViewerModal(true);
      }
    } catch (error) {
      console.error('Error obteniendo diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDesign = async (designId) => {
    try {
      setActionLoading(true);
      const designData = await getDesignById(designId);
      if (designData) {
        // Verificar que el diseño se puede editar
        if (!designData.canEdit) {
          Swal.fire({
            title: 'No se puede editar',
            text: 'Este diseño no se puede editar en su estado actual',
            icon: 'warning',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }
        
        setEditingDesign(designData);
        setShowCreateModal(true);
      }
    } catch (error) {
      console.error('Error cargando diseño para editar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño para editar',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloneDesign = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      const designName = design?.name || 'este diseño';
      
      const { value: name } = await Swal.fire({
        title: 'Clonar diseño',
        text: `¿Cómo quieres llamar la copia de "${designName}"?`,
        input: 'text',
        inputValue: `Copia de ${designName}`,
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Clonar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
          }
        }
      });

      if (name) {
        setActionLoading(true);
        await cloneDesign(designId, { name: name.trim() });
      }
    } catch (error) {
      console.error('Error clonando diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo clonar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteDesign = async (designId) => {
    try {
      setActionLoading(true);
      const designData = await getDesignById(designId);
      if (designData) {
        // Verificar que el diseño se puede cotizar
        if (designData.status !== 'pending') {
          const statusMessages = {
            'quoted': 'Este diseño ya ha sido cotizado anteriormente',
            'approved': 'Este diseño ya fue aprobado por el cliente',
            'rejected': 'Este diseño fue rechazado por el cliente',
            'completed': 'Este diseño ya fue completado',
            'archived': 'Este diseño está archivado'
          };
          
          Swal.fire({
            title: 'No se puede cotizar',
            text: statusMessages[designData.status] || 'Este diseño no se puede cotizar en su estado actual',
            icon: 'warning',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }
        
        setQuotingDesign(designData);
        setShowQuoteModal(true);
      }
    } catch (error) {
      console.error('Error cargando diseño para cotizar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño para cotizar',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteSubmitted = async (quoteData) => {
    try {
      if (quotingDesign) {
        setActionLoading(true);
        await submitQuote(quotingDesign.id, quoteData);
        setShowQuoteModal(false);
        setQuotingDesign(null);
      }
    } catch (error) {
      console.error('Error en handleQuoteSubmitted:', error);
      // Mostrar error específico al usuario
      await Swal.fire({
        title: 'Error al cotizar',
        text: error.message || 'No se pudo enviar la cotización',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      if (!design) return;

      const statusOptions = [
        { value: 'draft', text: 'Borrador', disabled: false },
        { value: 'pending', text: 'Pendiente', disabled: false },
        { value: 'quoted', text: 'Cotizado', disabled: design.status === 'draft' },
        { value: 'approved', text: 'Aprobado', disabled: design.status !== 'quoted' },
        { value: 'rejected', text: 'Rechazado', disabled: design.status !== 'quoted' },
        { value: 'completed', text: 'Completado', disabled: design.status !== 'approved' },
        { value: 'archived', text: 'Archivado', disabled: false }
      ].filter(option => option.value !== design.status);

      const { value: formValues } = await Swal.fire({
        title: 'Cambiar estado del diseño',
        html: `
          <div style="text-align: left; padding: 16px;">
            <p style="margin-bottom: 16px; color: #374151;">
              <strong>Estado actual:</strong> <span style="color: #1F64BF;">${design.statusText}</span>
            </p>
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Nuevo estado:
              </label>
              <select id="swal-status" class="swal2-input" style="margin-bottom: 0;">
                <option value="">Seleccionar nuevo estado</option>
                ${statusOptions.map(option => 
                  `<option value="${option.value}" ${option.disabled ? 'disabled' : ''}>
                    ${option.text}${option.disabled ? ' (No disponible)' : ''}
                  </option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Notas del cambio (opcional):
              </label>
              <textarea id="swal-notes" class="swal2-textarea" placeholder="Explica el motivo del cambio de estado..." style="height: 80px;"></textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Cambiar estado',
        cancelButtonText: 'Cancelar',
        width: 500,
        preConfirm: () => {
          const status = document.getElementById('swal-status').value;
          const notes = document.getElementById('swal-notes').value;
          
          if (!status) {
            Swal.showValidationMessage('Debes seleccionar un estado');
            return false;
          }
          
          return { status, notes: notes.trim() };
        }
      });

      if (formValues) {
        setActionLoading(true);
        await changeDesignStatus(designId, formValues.status, formValues.notes);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar el estado del diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      const designName = design?.name || 'este diseño';
      
      const { isConfirmed, value: reason } = await Swal.fire({
        title: '¿Cancelar diseño?',
        html: `
          <div style="text-align: left; padding: 16px;">
            <p style="margin-bottom: 16px; color: #374151;">
              ¿Estás seguro de que quieres cancelar <strong>"${designName}"</strong>?
            </p>
            <p style="margin-bottom: 16px; color: #6B7280; font-size: 0.875rem;">
              Esta acción no se puede deshacer. El diseño se marcará como cancelado.
            </p>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Motivo de cancelación:
              </label>
              <textarea id="swal-reason" class="swal2-textarea" placeholder="Explica por qué se cancela este diseño..." style="height: 80px;"></textarea>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cancelar diseño',
        cancelButtonText: 'No cancelar',
        width: 500,
        preConfirm: () => {
          const reason = document.getElementById('swal-reason').value;
          return reason.trim() || 'Cancelado por administrador';
        }
      });

      if (isConfirmed) {
        setActionLoading(true);
        await cancelDesign(designId, reason);
      }
    } catch (error) {
      console.error('Error cancelando diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cancelar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== MANEJADORES DE PAGINACIÓN ====================
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchDesigns({ page: newPage });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // ==================== MANEJADORES DE EXPORTACIÓN ====================
  
  const handleExportData = async () => {
    try {
      const { value: format } = await Swal.fire({
        title: 'Exportar datos',
        text: 'Selecciona el formato de exportación',
        input: 'select',
        inputOptions: {
          'csv': 'Archivo CSV',
          'pdf': 'Reporte PDF',
          'excel': 'Archivo Excel'
        },
        inputPlaceholder: 'Seleccionar formato',
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Exportar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar un formato';
          }
        }
      });

      if (format) {
        // Aquí implementarías la lógica de exportación según el formato
        Swal.fire({
          title: 'Exportando...',
          text: `Generando archivo ${format.toUpperCase()}`,
          icon: 'info',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        
        // Simulación de exportación
        setTimeout(() => {
          Swal.fire({
            title: 'Exportación completada',
            text: 'El archivo se ha descargado exitosamente',
            icon: 'success',
            confirmButtonColor: '#1F64BF'
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error exportando datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar los datos',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // ==================== RENDER DE LOADING INICIAL ====================
  
  if (loading && !hasDesigns && designs.length === 0) {
    return (
      <DesignPageContainer>
        <DesignContentWrapper>
          <LoadingContainer>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography variant="h6" sx={{ color: '#010326', fontWeight: 600 }}>
              Cargando gestión de diseños...
            </Typography>
            <Typography variant="body2" sx={{ color: '#032CA6', opacity: 0.8 }}>
              Preparando tu panel administrativo
            </Typography>
          </LoadingContainer>
        </DesignContentWrapper>
      </DesignPageContainer>
    );
  }

  // ==================== RENDER PRINCIPAL ====================
  
  return (
    <DesignPageContainer>
      
      <DesignContentWrapper>
        {/* Header Principal */}
        <DesignHeaderSection>
          <DesignHeaderContent>
            <DesignHeaderInfo>
              <MainTitle>
                <Palette size={32} weight="duotone" />
                Gestión de Diseños
              </MainTitle>
              <MainDescription>
                Administra diseños personalizados, cotizaciones y flujo de aprobación de clientes
              </MainDescription>
            </DesignHeaderInfo>
            
            <HeaderActions>
              <SecondaryActionButton
                variant="outlined"
                onClick={handleRefresh}
                disabled={loading || actionLoading}
                startIcon={loading ? <CircularProgress size={16} /> : <ArrowsClockwise size={18} weight="bold" />}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </SecondaryActionButton>
              
              <SecondaryActionButton
                variant="outlined"
                onClick={handleExportData}
                disabled={!hasDesigns || loading}
                startIcon={<Download size={18} weight="bold" />}
              >
                Exportar
              </SecondaryActionButton>
              
              <PrimaryActionButton
                onClick={handleCreateDesign}
                disabled={loading || actionLoading}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nuevo Diseño
              </PrimaryActionButton>
            </HeaderActions>
          </DesignHeaderContent>
        </DesignHeaderSection>

        {/* Alerta de Error */}
        {error && (
          <ErrorAlert>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Warning size={24} weight="fill" color="#EF4444" />
              <Box>
                <Typography sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}>
                  Error en la carga de datos
                </Typography>
                <Typography sx={{ color: '#DC2626', fontSize: '0.8rem', opacity: 0.8 }}>
                  {error}
                </Typography>
              </Box>
            </Box>
            <Button 
              size="small" 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                color: '#EF4444',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 'auto'
              }}
            >
              Reintentar
            </Button>
          </ErrorAlert>
        )}

        {/* Estadísticas Interactivas */}
        <StatsContainer>
          <StatsGrid>
            {stats.map((stat) => (
              <StatCard 
                key={stat.id} 
                variant={stat.variant}
                onClick={stat.onClick}
              >
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
                <StatTrend variant={stat.variant}>
                  <TrendUp size={12} weight="bold" />
                  {stat.change}
                </StatTrend>
              </StatCard>
            ))}
          </StatsGrid>
        </StatsContainer>

        {/* Controles de búsqueda y filtros */}
        <DesignControlsSection>
          <DesignControlsContent>
            {/* Barra de búsqueda principal */}
            <DesignSearchSection>
              <DesignModernTextField
                placeholder="Buscar diseños por nombre, cliente o producto..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={20} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <DesignSortControl onClick={handleSortChange}>
                <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500 }}>
                  Fecha
                </Typography>
                {sortOrder === 'desc' ? (
                  <SortDescending size={16} weight="bold" color="#032CA6" />
                ) : (
                  <SortAscending size={16} weight="bold" color="#032CA6" />
                )}
              </DesignSortControl>
            </DesignSearchSection>

            {/* Filtros avanzados */}
            <DesignFiltersSection>
              <DesignFilterControl size="small">
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <Funnel size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="draft">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PencilSimple size={14} />
                      Borradores
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} />
                      Pendientes
                    </Box>
                  </MenuItem>
                  <MenuItem value="quoted">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Money size={14} />
                      Cotizados
                    </Box>
                  </MenuItem>
                  <MenuItem value="approved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} />
                      Aprobados
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={14} />
                      Rechazados
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} />
                      Completados
                    </Box>
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={14} />
                      Cancelados
                    </Box>
                  </MenuItem>
                </Select>
              </DesignFilterControl>

              <DesignFilterControl size="small">
                <Select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  displayEmpty
                  disabled={loadingProducts}
                  startAdornment={
                    <InputAdornment position="start">
                      <Package size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    {loadingProducts ? 'Cargando productos...' : 'Todos los productos'}
                  </MenuItem>
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.mainImage && (
                          <Box
                            component="img"
                            src={product.mainImage}
                            alt=""
                            sx={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <Typography variant="body2" noWrap>
                          {product.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </DesignFilterControl>

              <DesignFilterControl size="small">
                <Select
                  value={selectedUser}
                  onChange={handleUserChange}
                  displayEmpty
                  disabled={loadingUsers}
                  startAdornment={
                    <InputAdornment position="start">
                      <Users size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    {loadingUsers ? 'Cargando clientes...' : 'Todos los clientes'}
                  </MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <Typography variant="body2" noWrap>
                        {user.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </DesignFilterControl>

              {/* Botón para limpiar filtros */}
              {(searchQuery || selectedStatus || selectedProduct || selectedUser) && (
                <Tooltip title="Limpiar todos los filtros">
                  <Button
                    onClick={handleClearFilters}
                    startIcon={<Broom size={16} weight="bold" />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#EF4444',
                      backgroundColor: alpha('#EF4444', 0.1),
                      padding: '8px 16px',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: alpha('#EF4444', 0.15),
                      }
                    }}
                  >
                    Limpiar
                  </Button>
                </Tooltip>
              )}
            </DesignFiltersSection>
          </DesignControlsContent>
        </DesignControlsSection>

        {/* Lista de Diseños */}
        <DesignsSection>
          <SectionHeader>
            <SectionTitle component="div">
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    gap: 1
  }}>
    <GridNine size={24} weight="duotone" />
    <Box component="span">Diseños</Box>
    
    <Badge 
      badgeContent={designs.length}
      color="primary"
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: '#1F64BF',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
          minWidth: '20px',
          height: '20px'
        }
      }}
    >
      <Box component="span" sx={{ width: 0 }} /> {/* Elemento invisible para el Badge */}
    </Badge>
    
    {pagination.totalDesigns !== designs.length && (
      <Chip 
        label={`de ${pagination.totalDesigns} total`}
        size="small"
        sx={{
          background: alpha('#1F64BF', 0.1),
          color: '#032CA6',
          fontWeight: 500,
          ml: 1,
          fontSize: '0.75rem'
        }}
      />
    )}
  </Box>
</SectionTitle>

            {/* Información de resultados */}
            {hasDesigns && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant="body2" sx={{ color: '#032CA6', opacity: 0.8 }}>
                  {loading ? 'Actualizando...' : `${designs.length} resultado${designs.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            )}
          </SectionHeader>

          {/* Grid de diseños o estado vacío */}
          {designs.length > 0 ? (
            <>
              <DesignsGrid>
                {designs.map((design) => (
                  <DesignCard
                    key={design.id}
                    id={design.id}
                    name={design.name}
                    status={design.status}
                    clientName={design.clientName}
                    clientEmail={design.clientEmail}
                    productName={design.productName}
                    productImage={design.productImage}
                    previewImage={design.previewImage}
                    price={design.price}
                    formattedPrice={design.formattedPrice}
                    createdDate={design.createdDate}
                    updatedDate={design.updatedDate}
                    elementsCount={design.elementsCount}
                    complexity={design.complexity}
                    canEdit={design.canEdit}
                    canQuote={design.canQuote}
                    canApprove={design.canApprove}
                    daysAgo={design.daysAgo}
                    onView={handleViewDesign}
                    onEdit={handleEditDesign}
                    onClone={handleCloneDesign}
                    onDelete={handleDeleteDesign}
                    onQuote={handleQuoteDesign}
                    onChangeStatus={handleChangeStatus}
                    loading={actionLoading}
                  />
                ))}
              </DesignsGrid>

              {/* Controles de paginación */}
              {pagination.totalPages > 1 && (
                <PaginationContainer>
                  <Button
                    variant="outlined"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: '120px',
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
                    py: 1.5,
                    minWidth: '120px',
                    textAlign: 'center',
                    background: alpha('#1F64BF', 0.05)
                  }}>
                    <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 600 }}>
                      Página {pagination.currentPage} de {pagination.totalPages}
                    </Typography>
                  </ModernCard>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: '120px',
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
                </PaginationContainer>
              )}
            </>
          ) : (
            /* Estado vacío mejorado */
            <EmptyState>
              <EmptyStateIcon>
                <Palette size={40} weight="duotone" />
              </EmptyStateIcon>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#010326', 
                mb: 2,
                textAlign: 'center'
              }}>
                {searchQuery || selectedStatus || selectedProduct || selectedUser
                  ? 'No hay diseños que coincidan con los filtros' 
                  : 'No hay diseños creados aún'
                }
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#032CA6', 
                mb: 4,
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: 1.6
              }}>
                {searchQuery || selectedStatus || selectedProduct || selectedUser
                  ? 'Intenta ajustar los filtros de búsqueda o crear un nuevo diseño personalizado'
                  : 'Comienza creando tu primer diseño personalizado para un cliente. Usa nuestro editor visual para crear diseños únicos.'
                }
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px'
              }}>
                <PrimaryActionButton
                  onClick={handleCreateDesign}
                  disabled={loading || actionLoading}
                  startIcon={<Plus size={18} weight="bold" />}
                  sx={{
                    minWidth: { xs: '100%', sm: '140px' }
                  }}
                >
                  Crear Diseño
                </PrimaryActionButton>
                
                {(searchQuery || selectedStatus || selectedProduct || selectedUser) && (
                  <SecondaryActionButton
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<Broom size={18} weight="bold" />}
                    sx={{
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Limpiar Filtros
                  </SecondaryActionButton>
                )}
              </Box>

              {/* Sugerencias de acción */}
              {!hasDesigns && !loading && (
                <Box sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: alpha('#1F64BF', 0.05),
                  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
                  maxWidth: '500px'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#1F64BF', 
                    fontWeight: 600, 
                    mb: 2,
                    textAlign: 'center'
                  }}>
                    💡 Primeros pasos
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1 }}>
                      • Selecciona un cliente y producto base
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1 }}>
                      • Usa el editor visual para crear elementos
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1 }}>
                      • Envía cotización al cliente
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6' }}>
                      • Gestiona aprobaciones y producción
                    </Typography>
                  </Box>
                </Box>
              )}
            </EmptyState>
          )}
        </DesignsSection>

        {/* Indicador de carga durante actualizaciones */}
        {loading && hasDesigns && (
          <Box sx={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 4px 20px rgba(1, 3, 38, 0.15)',
            border: `1px solid ${alpha('#1F64BF', 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CircularProgress size={20} sx={{ color: '#1F64BF' }} />
            <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500 }}>
              Actualizando diseños...
            </Typography>
          </Box>
        )}
      </DesignContentWrapper>

      {/* ==================== MODALES ==================== */}

      {/* Modal de creación/edición de diseño */}
      {showCreateModal && (
        <CreateDesignModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onCreateDesign={handleDesignCreated}
          editMode={!!editingDesign}
          designToEdit={editingDesign}
          products={products}
          users={users}
          loadingProducts={loadingProducts}
          loadingUsers={loadingUsers}
        />
      )}

      {/* Modal de cotización */}
      {showQuoteModal && quotingDesign && (
        <QuoteDesignModal
          isOpen={showQuoteModal}
          onClose={handleCloseQuoteModal}
          onSubmitQuote={handleQuoteSubmitted}
          design={quotingDesign}
        />
      )}

      {/* Modal de visualización de diseño */}
      {showViewerModal && viewingDesign && (
        <KonvaDesignViewer
          isOpen={showViewerModal}
          onClose={handleCloseViewerModal}
          design={viewingDesign}
          product={viewingDesign.product}
          showInfo={true}
          enableDownload={true}
          enableZoom={true}
        />
      )}
    </DesignPageContainer>
  );
};

// ==================== EXPORT ==================== 
export default DesignManagement;