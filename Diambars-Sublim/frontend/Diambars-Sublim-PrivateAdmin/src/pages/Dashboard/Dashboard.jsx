import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Paper,
  styled,
  alpha,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChartLine,
  Package,
  Users,
  ShoppingCart,
  TrendUp,
  Bell,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  User,
  CheckCircle,
  Warning,
  Coffee,
  Lightning,
  Target,
  Gear,
  Eye,
  EyeSlash,
  ChartPie,
  ChartBar,
  ChartLineUp,
  Pulse,
  X
} from '@phosphor-icons/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar, Radar, Pie, PolarArea } from 'react-chartjs-2';
import Swal from 'sweetalert2';

// Importar hooks reales
import useProducts from '../../hooks/useProducts';
import useUsers from '../../hooks/useUsers';
import useEmployees from '../../hooks/useEmployees';
import useDesigns from '../../hooks/useDesigns';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// ================ TIPOS DE GRÁFICAS DISPONIBLES ================
const CHART_TYPES = {
  PRODUCTS_OVERVIEW: {
    id: 'products_overview',
    name: 'Productos',
    icon: Package,
    type: 'doughnut',
    description: 'Estado de productos (activos/inactivos)'
  },
  USER_STATS: {
    id: 'user_stats',
    name: 'Usuarios',
    icon: Users,
    type: 'bar',
    description: 'Usuarios por estado y rol'
  },
  EMPLOYEE_DISTRIBUTION: {
    id: 'employee_distribution',
    name: 'Empleados',
    icon: User,
    type: 'pie',
    description: 'Empleados por rol'
  },
  DESIGN_STATUS: {
    id: 'design_status',
    name: 'Diseños',
    icon: ChartPie,
    type: 'polarArea',
    description: 'Diseños por estado'
  }
};

// ================ ESTILOS STYLED COMPONENTS OPTIMIZADOS ================
const PageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  background: '#FFFFFF',
  width: '100%',
  overflowX: 'hidden'
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%', // Cambiado a 100% para usar todo el ancho disponible
  margin: '0 auto',
  padding: '100px 24px 20px', // Más padding lateral en PC
  
  [theme.breakpoints.up('sm')]: {
    padding: '110px 28px 24px',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '120px 32px 28px',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '120px 40px 32px', // Más padding en pantallas grandes
    maxWidth: '100%', // Asegurar que use todo el ancho
  },
  
  [theme.breakpoints.up('xl')]: {
    padding: '120px 48px 40px', // Aún más padding en pantallas extra grandes
  }
}));

const ModernCard = styled(Paper)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  
  '&:hover': {
    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

const WelcomeCard = styled(ModernCard)(({ theme }) => ({
  padding: '20px',
  marginBottom: '20px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: '#FFFFFF',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '120px',
    height: '120px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(40px, -40px)',
  },
  
  [theme.breakpoints.up('sm')]: {
    padding: '24px',
    marginBottom: '24px',
    
    '&::before': {
      width: '150px',
      height: '150px',
    }
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '28px',
    marginBottom: '28px',
    
    '&::before': {
      width: '180px',
      height: '180px',
    }
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '32px',
    
    '&::before': {
      width: '200px',
      height: '200px',
    }
  }
}));

const WelcomeContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  
  [theme.breakpoints.up('md')]: {
    gap: '24px',
  },
  
  [theme.breakpoints.up('lg')]: {
    gap: '32px', // Más espacio en PC
  }
}));

const WelcomeInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: '4px',
  color: '#FFFFFF',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '2.25rem', // Título más grande en PC
  }
}));

const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  opacity: 0.9,
  marginBottom: '12px',
  color: '#FFFFFF',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.95rem',
    marginBottom: '16px',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '1rem',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '1.1rem', // Subtítulo más grande en PC
  }
}));

const QuickActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    width: 'auto',
  },
  
  [theme.breakpoints.up('md')]: {
    gap: '12px',
  },
  
  [theme.breakpoints.up('lg')]: {
    gap: '16px', // Más espacio entre botones en PC
  }
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  color: '#FFFFFF',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  minWidth: 'auto',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
  },
  
  [theme.breakpoints.up('sm')]: {
    padding: '8px 16px',
    fontSize: '0.875rem',
    borderRadius: '10px',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '10px 20px',
    borderRadius: '12px',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '12px 24px', // Botones más grandes en PC
    fontSize: '0.95rem',
  }
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  marginBottom: '24px',
  
  [theme.breakpoints.up('sm')]: {
    marginBottom: '28px',
  },
  
  [theme.breakpoints.up('md')]: {
    marginBottom: '32px',
  },
  
  [theme.breakpoints.up('lg')]: {
    marginBottom: '36px', // Más espacio en PC
  }
}));

const StatCard = styled(ModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: '#FFFFFF',
    },
    success: {
      background: 'linear-gradient(135deg, #032CA6 0%, #040DBF 100%)',
      color: '#FFFFFF',
    },
    warning: {
      background: 'linear-gradient(135deg, #040DBF 0%, #010326 100%)',
      color: '#FFFFFF',
    },
    info: {
      background: 'linear-gradient(135deg, #010326 0%, #1F64BF 100%)',
      color: '#FFFFFF',
    },
    default: {
      background: '#FFFFFF',
      color: '#010326',
    }
  };

  const selectedVariant = variants[variant] || variants.default;

  return {
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '120px',
    ...selectedVariant,
    
    '&::before': variant !== 'default' ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '80px',
      height: '80px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(25px, -25px)',
    } : {},
    
    [theme.breakpoints.up('sm')]: {
      padding: '20px',
      minHeight: '140px',
      
      '&::before': variant !== 'default' ? {
        width: '100px',
        height: '100px',
      } : {},
    },
    
    [theme.breakpoints.up('md')]: {
      padding: '24px',
      minHeight: '160px',
    },
    
    [theme.breakpoints.up('lg')]: {
      padding: '28px', // Más padding en PC
      minHeight: '180px', // Cards más altas en PC
      
      '&::before': variant !== 'default' ? {
        width: '120px',
        height: '120px',
        transform: 'translate(30px, -30px)',
      } : {},
    }
  };
});

const StatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '12px',
  flex: 1,
}));

const StatIconContainer = styled(Box)(({ theme, variant }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant !== 'default' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant !== 'default' ? '#FFFFFF' : '#1F64BF',
  flexShrink: 0,
  
  [theme.breakpoints.up('sm')]: {
    width: '48px',
    height: '48px',
  },
  
  [theme.breakpoints.up('md')]: {
    borderRadius: '12px',
  },
  
  [theme.breakpoints.up('lg')]: {
    width: '56px', // Iconos más grandes en PC
    height: '56px',
  }
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: '4px',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '2.5rem', // Valores más grandes en PC
  }
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 500,
  opacity: 0.8,
  lineHeight: 1.2,
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '1rem', // Texto más grande en PC
  }
}));

const StatTrend = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '8px',
  padding: '4px 8px',
  borderRadius: '6px',
  background: 'rgba(255, 255, 255, 0.15)',
  width: 'fit-content',
  fontSize: '0.75rem',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
  },
  
  [theme.breakpoints.up('lg')]: {
    marginTop: '12px', // Más espacio en PC
    padding: '6px 12px', // Más padding en PC
  }
}));

const MainGrid = styled(Grid)(({ theme }) => ({
  marginBottom: '24px',
  
  [theme.breakpoints.up('sm')]: {
    marginBottom: '28px',
  },
  
  [theme.breakpoints.up('md')]: {
    marginBottom: '32px',
  },
  
  [theme.breakpoints.up('lg')]: {
    marginBottom: '36px', // Más espacio en PC
  }
}));

const ActivitySection = styled(Box)(({ theme }) => ({
  marginBottom: '24px',
  
  [theme.breakpoints.up('sm')]: {
    marginBottom: '28px',
  },
  
  [theme.breakpoints.up('md')]: {
    marginBottom: '32px',
  },
  
  [theme.breakpoints.up('lg')]: {
    marginBottom: '36px', // Más espacio en PC
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.35rem',
    marginBottom: '16px',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '1.5rem',
    gap: '8px',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '1.75rem', // Títulos más grandes en PC
    marginBottom: '20px',
  }
}));

const ChartControlsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '20px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '20px 24px',
    borderRadius: '12px',
    marginBottom: '28px',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '24px 32px', // Más padding en PC
    marginBottom: '32px',
  }
}));

const ChartCard = styled(ModernCard)(({ theme, visible }) => ({
  padding: '16px',
  height: '320px',
  position: 'relative',
  display: visible ? 'flex' : 'none',
  flexDirection: 'column',
  
  [theme.breakpoints.up('sm')]: {
    padding: '20px',
    height: '350px',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '24px',
    height: '380px',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '28px', // Más padding en PC
    height: '420px', // Gráficas más altas en PC
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '250px',
  position: 'relative',
  flex: 1,
  
  [theme.breakpoints.up('sm')]: {
    height: '280px',
  },
  
  [theme.breakpoints.up('md')]: {
    height: '300px',
  },
  
  [theme.breakpoints.up('lg')]: {
    height: '340px', // Contenedor más alto en PC
  }
}));

const ChartsGrid = styled(Grid)(({ theme }) => ({
  minHeight: '300px',
}));

// ================ COMPONENTE PRINCIPAL ================
const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados para gráficas dinámicas
  const [visibleCharts, setVisibleCharts] = useState({
    products_overview: true,
    user_stats: true,
    employee_distribution: true,
    design_status: false
  });
  
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Hooks de datos reales
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    getProductStats,
    fetchProducts 
  } = useProducts();
  
  const { 
    users, 
    loading: usersLoading, 
    error: usersError, 
    getUserStats,
    fetchUsers 
  } = useUsers();
  
  const { 
    employees, 
    loading: employeesLoading, 
    error: employeesError, 
    getEmployeeStats,
    fetchEmployees 
  } = useEmployees();
  
  const { 
    designs, 
    loading: designsLoading, 
    error: designsError, 
    getDesignStats,
    fetchDesigns 
  } = useDesigns();

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Auto-refresh de datos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de datos del dashboard');
      fetchProducts();
      fetchUsers();
      fetchEmployees();
      fetchDesigns();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchProducts, fetchUsers, fetchEmployees, fetchDesigns]);

  // Paleta de colores del proyecto
  const colors = {
    white: '#FFFFFF',
    primary: '#1F64BF',
    secondary: '#032CA6', 
    accent: '#040DBF',
    dark: '#010326',
    gray: '#64748b',
  };

  // Configuración base para gráficas - responsive
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: isMobile ? 10 : 15,
          font: {
            family: 'Inter',
            size: isMobile ? 10 : 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: colors.dark,
        titleColor: colors.white,
        bodyColor: colors.white,
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter',
          size: isMobile ? 12 : 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: isMobile ? 10 : 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(colors.primary, 0.1)
        },
        ticks: {
          color: colors.gray,
          font: {
            size: isMobile ? 9 : 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colors.gray,
          font: {
            size: isMobile ? 9 : 11
          }
        }
      }
    }
  });

  // ================ FUNCIONES DE DATOS ================
  const getDashboardStats = () => {
    const productStats = getProductStats();
    const userStats = getUserStats();
    const employeeStats = getEmployeeStats();
    const designStats = getDesignStats();

    return [
      {
        id: 'products',
        title: 'Total Productos',
        value: productStats.total.toString(),
        change: productStats.active > 0 ? `${Math.round((productStats.active/productStats.total)*100)}% activos` : 'Sin productos',
        trend: 'up',
        icon: Package,
        variant: 'primary',
        loading: productsLoading
      },
      {
        id: 'users',
        title: 'Usuarios Totales',
        value: userStats.total.toString(),
        change: userStats.active > 0 ? `${userStats.active} activos` : 'Sin usuarios activos',
        trend: 'up',
        icon: Users,
        variant: 'success',
        loading: usersLoading
      },
      {
        id: 'employees',
        title: 'Personal Activo',
        value: employeeStats.active.toString(),
        change: `${employeeStats.total} total`,
        trend: 'up',
        icon: User,
        variant: 'warning',
        loading: employeesLoading
      },
      {
        id: 'designs',
        title: 'Diseños Pendientes',
        value: designStats.pending.toString(),
        change: `${designStats.total} total`,
        trend: designStats.pending > 0 ? 'up' : 'stable',
        icon: ChartLine,
        variant: 'info',
        loading: designsLoading
      }
    ];
  };

  // Generadores de datos
  const getProductsOverviewData = () => {
    const stats = getProductStats();
    return {
      labels: ['Activos', 'Inactivos'],
      datasets: [{
        data: [stats.active, stats.inactive],
        backgroundColor: [colors.primary, colors.gray],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: colors.white
      }]
    };
  };

  const getUserStatsData = () => {
    const stats = getUserStats();
    return {
      labels: ['Activos', 'Inactivos', 'Administradores', 'Premium', 'Clientes'],
      datasets: [{
        label: 'Usuarios',
        data: [stats.active, stats.inactive, stats.admins, stats.premium, stats.customers],
        backgroundColor: [
          colors.primary,
          colors.gray,
          colors.accent,
          colors.secondary,
          alpha(colors.primary, 0.6)
        ],
        borderColor: colors.white,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  };

  const getEmployeeDistributionData = () => {
    const stats = getEmployeeStats();
    const roles = stats.roles || {};
    
    return {
      labels: ['Administradores', 'Gerentes', 'Empleados', 'Delivery', 'Producción'],
      datasets: [{
        data: [
          roles.admins || 0,
          roles.managers || 0,
          roles.employees || 0,
          roles.delivery || 0,
          roles.production || 0
        ],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.accent,
          colors.dark,
          alpha(colors.primary, 0.6)
        ],
        borderWidth: 0
      }]
    };
  };

  const getDesignStatusData = () => {
    const stats = getDesignStats();
    return {
      labels: ['Pendientes', 'Cotizados', 'Aprobados', 'Rechazados', 'Completados', 'Borradores'],
      datasets: [{
        data: [stats.pending, stats.quoted, stats.approved, stats.rejected, stats.completed, stats.drafts],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.accent,
          colors.gray,
          colors.dark,
          alpha(colors.primary, 0.4)
        ],
        borderWidth: 1,
        borderColor: colors.white
      }]
    };
  };

  // ================ COMPONENTE DE CONFIGURACIÓN DE GRÁFICAS ================
  const ChartSettingsDialog = () => (
    <Dialog 
      open={chartSettingsOpen} 
      onClose={() => setChartSettingsOpen(false)}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '12px',
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontSize: isMobile ? '1.1rem' : '1.25rem',
        padding: isMobile ? '16px' : '24px 24px 16px'
      }}>
        <Gear size={isMobile ? 20 : 24} />
        Configuración de Gráficas
        <Box sx={{ flex: 1 }} />
        <IconButton 
          onClick={() => setChartSettingsOpen(false)}
          size={isMobile ? 'small' : 'medium'}
        >
          <X size={isMobile ? 18 : 20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        padding: isMobile ? '8px 16px' : '16px 24px'
      }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontSize: isMobile ? '1rem' : '1.1rem'
          }}>
            Gráficas Visibles
          </Typography>
          
          {Object.values(CHART_TYPES).map((chart) => (
            <FormControlLabel
              key={chart.id}
              control={
                <Switch
                  checked={visibleCharts[chart.id]}
                  onChange={(e) => setVisibleCharts(prev => ({
                    ...prev,
                    [chart.id]: e.target.checked
                  }))}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <chart.icon size={isMobile ? 18 : 20} />
                  <Box>
                    <Typography variant="body1" sx={{ 
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      {chart.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontSize: isMobile ? '0.75rem' : '0.8rem'
                    }}>
                      {chart.description}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ width: '100%', mb: 1 }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            }
            label={
              <Typography sx={{ 
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}>
                Actualización Automática
              </Typography>
            }
            sx={{ mb: 2 }}
          />
          
          {autoRefresh && (
            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
              <InputLabel>Intervalo</InputLabel>
              <Select
                value={refreshInterval}
                label="Intervalo"
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <MenuItem value={15}>15 segundos</MenuItem>
                <MenuItem value={30}>30 segundos</MenuItem>
                <MenuItem value={60}>1 minuto</MenuItem>
                <MenuItem value={300}>5 minutos</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        padding: isMobile ? '8px 16px 16px' : '8px 24px 16px'
      }}>
        <Button 
          onClick={() => setChartSettingsOpen(false)}
          fullWidth={isMobile}
          size={isMobile ? 'large' : 'medium'}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ================ FUNCIONES DE MANEJO ================
  const handleQuickAction = (action) => {
    switch (action) {
      case 'create_product':
        Swal.fire({
          title: '¡Crear Producto!',
          text: 'Redirigiendo a la creación de productos...',
          icon: 'info',
          confirmButtonColor: colors.primary,
          timer: 1500,
          showConfirmButton: false
        });
        break;
      case 'view_analytics':
        setChartSettingsOpen(true);
        break;
      default:
        break;
    }
  };

  const handleRefreshAll = () => {
    fetchProducts();
    fetchUsers();
    fetchEmployees();
    fetchDesigns();
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Datos actualizados',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  // Contar gráficas visibles
  const visibleChartsCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Welcome Card */}
        <WelcomeCard>
          <WelcomeContent>
            <WelcomeInfo>
              <WelcomeTitle>
                {getGreeting()} Administrador
              </WelcomeTitle>
              <WelcomeSubtitle>
                Panel de control de Diambars Sublimado - {visibleChartsCount} gráfica{visibleChartsCount !== 1 ? 's' : ''} activa{visibleChartsCount !== 1 ? 's' : ''}
              </WelcomeSubtitle>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                opacity: 0.8,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={14} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={14} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {currentTime.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                {autoRefresh && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Pulse size={14} />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      Auto: {refreshInterval}s
                    </Typography>
                  </Box>
                )}
              </Box>
            </WelcomeInfo>
            
            <QuickActionsContainer>
              <QuickActionButton
                startIcon={<Plus size={16} />}
                onClick={() => handleQuickAction('create_product')}
              >
                {isMobile ? 'Crear' : 'Crear Producto'}
              </QuickActionButton>
              <QuickActionButton
                startIcon={<Gear size={16} />}
                onClick={() => handleQuickAction('view_analytics')}
              >
                {isMobile ? 'Configurar' : 'Configurar Gráficas'}
              </QuickActionButton>
            </QuickActionsContainer>
          </WelcomeContent>
        </WelcomeCard>

        {/* Stats Cards */}
        <StatsGrid container spacing={2}>
          {getDashboardStats().map((stat) => (
            <Grid item xs={6} sm={6} md={3} key={stat.id}>
              <StatCard variant={stat.variant}>
                <StatHeader>
                  <Box sx={{ flex: 1 }}>
                    <StatValue>
                      {stat.loading ? (
                        <CircularProgress 
                          size={20} 
                          color="inherit" 
                        />
                      ) : (
                        stat.value
                      )}
                    </StatValue>
                    <StatLabel>
                      {stat.title}
                    </StatLabel>
                  </Box>
                  <StatIconContainer variant={stat.variant}>
                    <stat.icon size={isMobile ? 20 : 24} weight="duotone" />
                  </StatIconContainer>
                </StatHeader>
                <StatTrend trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {stat.change}
                  </Typography>
                </StatTrend>
              </StatCard>
            </Grid>
          ))}
        </StatsGrid>

        {/* Main Grid - Info Cards */}
        <MainGrid container spacing={2}>
          {/* Resumen rápido con errores */}
          <Grid item xs={12} md={8}>
            <ModernCard sx={{ p: 2, height: '100%' }}>
              <SectionTitle>
                <Target size={20} weight="duotone" />
                Estado del Sistema
              </SectionTitle>
              
              {(productsError || usersError || employeesError || designsError) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    Algunos servicios tienen problemas:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.75rem' }}>
                    {productsError && <li>Productos: {productsError}</li>}
                    {usersError && <li>Usuarios: {usersError}</li>}
                    {employeesError && <li>Empleados: {employeesError}</li>}
                    {designsError && <li>Diseños: {designsError}</li>}
                  </ul>
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    Servicios Operativos
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600, fontSize: '0.8rem' }}>
                    {4 - [productsError, usersError, employeesError, designsError].filter(Boolean).length}/4
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(4 - [productsError, usersError, employeesError, designsError].filter(Boolean).length) * 25}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(colors.accent, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.accent,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: alpha(colors.accent, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.accent
                }}>
                  <Lightning size={18} weight="duotone" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.8rem' }}>
                    Productos más Populares
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray, fontSize: '0.75rem' }}>
                    {getProductStats().topProducts?.[0]?.name || 'Sin datos disponibles'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary
                }}>
                  <Coffee size={18} weight="duotone" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.8rem' }}>
                    Última Actualización
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray, fontSize: '0.75rem' }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </ModernCard>
          </Grid>

          {/* Controles de gráficas */}
          <Grid item xs={12} md={4}>
            <ModernCard sx={{ p: 2, height: '100%' }}>
              <SectionTitle>
                <ChartLine size={20} weight="duotone" />
                Control de Gráficas
              </SectionTitle>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<Gear size={16} />}
                  onClick={() => setChartSettingsOpen(true)}
                  size="small"
                  fullWidth
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: colors.secondary,
                      backgroundColor: alpha(colors.primary, 0.05),
                    }
                  }}
                >
                  Configurar Gráficas
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ArrowRight size={16} />}
                  onClick={handleRefreshAll}
                  size="small"
                  fullWidth
                  sx={{
                    borderColor: colors.secondary,
                    color: colors.secondary,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: colors.accent,
                      backgroundColor: alpha(colors.secondary, 0.05),
                    }
                  }}
                >
                  Actualizar Datos
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                    Gráficas Activas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(CHART_TYPES)
                      .filter(([id]) => visibleCharts[id])
                      .map(([id, chart]) => (
                        <Chip
                          key={id}
                          icon={<chart.icon size={14} />}
                          label={isMobile ? chart.name.split(' ')[0] : chart.name}
                          size="small"
                          sx={{
                            background: alpha(colors.primary, 0.1),
                            color: colors.primary,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '24px'
                          }}
                        />
                      ))
                    }
                  </Box>
                </Box>
              </Box>
            </ModernCard>
          </Grid>
        </MainGrid>

        {/* Charts Section */}
        <ActivitySection>
          <ChartControlsBar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <SectionTitle sx={{ mb: 0, fontSize: '1.1rem' }}>
                <ChartLine size={20} weight="duotone" />
                {isMobile ? 'Analíticas' : 'Analíticas Dinámicas'}
              </SectionTitle>
              
              <Chip
                label={`${visibleChartsCount} activa${visibleChartsCount !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  background: colors.accent,
                  color: colors.white,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: '24px'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {autoRefresh && !isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Pulse size={14} style={{ color: colors.accent }} />
                  <Typography variant="body2" sx={{ color: colors.accent, fontSize: '0.8rem' }}>
                    Auto: {refreshInterval}s
                  </Typography>
                </Box>
              )}
              
              <Tooltip title="Configurar gráficas">
                <IconButton
                  onClick={() => setChartSettingsOpen(true)}
                  size="small"
                  sx={{ 
                    color: colors.primary,
                    '&:hover': { backgroundColor: alpha(colors.primary, 0.1) }
                  }}
                >
                  <Gear size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          </ChartControlsBar>
          
          {/* Contenedor de gráficas dinámicas */}
          <ChartsGrid container spacing={2}>
            {visibleChartsCount === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 4,
                  px: 2
                }}>
                  <EyeSlash size={40} style={{ color: colors.gray, marginBottom: '12px' }} />
                  <Typography variant="h6" sx={{ color: colors.dark, mb: 1, fontSize: '1.1rem' }}>
                    No hay gráficas seleccionadas
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray, mb: 2, fontSize: '0.8rem' }}>
                    Selecciona al menos una gráfica para visualizar los datos
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Gear size={16} />}
                    onClick={() => setChartSettingsOpen(true)}
                    size="small"
                    sx={{
                      backgroundColor: colors.primary,
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: colors.secondary,
                      }
                    }}
                  >
                    Configurar Gráficas
                  </Button>
                </Box>
              </Grid>
            ) : (
              <>
                {/* Vista General de Productos */}
                {visibleCharts.products_overview && (
                  <Grid item xs={12} sm={6} lg={3}>
                    <ChartCard visible={true}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Package size={18} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                            Productos
                          </Typography>
                        </Box>
                        {productsLoading && <CircularProgress size={16} />}
                      </Box>
                      <ChartContainer>
                        {productsError ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                            <Warning size={24} style={{ color: colors.gray, marginBottom: '8px' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Error al cargar datos
                            </Typography>
                          </Box>
                        ) : (
                          <Doughnut data={getProductsOverviewData()} options={getChartOptions()} />
                        )}
                      </ChartContainer>
                    </ChartCard>
                  </Grid>
                )}

                {/* Estadísticas de Usuarios */}
                {visibleCharts.user_stats && (
                  <Grid item xs={12} sm={6} lg={3}>
                    <ChartCard visible={true}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Users size={18} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                            Usuarios
                          </Typography>
                        </Box>
                        {usersLoading && <CircularProgress size={16} />}
                      </Box>
                      <ChartContainer>
                        {usersError ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                            <Warning size={24} style={{ color: colors.gray, marginBottom: '8px' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Error al cargar datos
                            </Typography>
                          </Box>
                        ) : (
                          <Bar data={getUserStatsData()} options={getChartOptions()} />
                        )}
                      </ChartContainer>
                    </ChartCard>
                  </Grid>
                )}

                {/* Distribución de Empleados */}
                {visibleCharts.employee_distribution && (
                  <Grid item xs={12} sm={6} lg={3}>
                    <ChartCard visible={true}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <User size={18} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                            Empleados
                          </Typography>
                        </Box>
                        {employeesLoading && <CircularProgress size={16} />}
                      </Box>
                      <ChartContainer>
                        {employeesError ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                            <Warning size={24} style={{ color: colors.gray, marginBottom: '8px' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Error al cargar datos
                            </Typography>
                          </Box>
                        ) : (
                          <Pie data={getEmployeeDistributionData()} options={getChartOptions()} />
                        )}
                      </ChartContainer>
                    </ChartCard>
                  </Grid>
                )}

                {/* Estados de Diseños */}
                {visibleCharts.design_status && (
                  <Grid item xs={12} sm={6} lg={3}>
                    <ChartCard visible={true}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ChartPie size={18} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                            Diseños
                          </Typography>
                        </Box>
                        {designsLoading && <CircularProgress size={16} />}
                      </Box>
                      <ChartContainer>
                        {designsError ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                            <Warning size={24} style={{ color: colors.gray, marginBottom: '8px' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Error al cargar datos
                            </Typography>
                          </Box>
                        ) : (
                          <PolarArea data={getDesignStatusData()} options={getChartOptions()} />
                        )}
                      </ChartContainer>
                    </ChartCard>
                  </Grid>
                )}
              </>
            )}
          </ChartsGrid>
        </ActivitySection>

        {/* Dialog de configuración */}
        <ChartSettingsDialog />
      </ContentWrapper>
    </PageContainer>
  );
};

export default Dashboard;