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
  FormControlLabel
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
    name: 'Vista General de Productos',
    icon: Package,
    type: 'doughnut',
    description: 'Estado de productos (activos/inactivos)'
  },
  USER_STATS: {
    id: 'user_stats',
    name: 'Estadísticas de Usuarios',
    icon: Users,
    type: 'bar',
    description: 'Usuarios por estado y rol'
  },
  EMPLOYEE_DISTRIBUTION: {
    id: 'employee_distribution',
    name: 'Distribución de Empleados',
    icon: User,
    type: 'pie',
    description: 'Empleados por rol'
  },
  DESIGN_STATUS: {
    id: 'design_status',
    name: 'Estados de Diseños',
    icon: ChartPie,
    type: 'polarArea',
    description: 'Diseños por estado de cotización'
  },
  PRODUCTS_PERFORMANCE: {
    id: 'products_performance',
    name: 'Rendimiento de Productos',
    icon: TrendUp,
    type: 'line',
    description: 'Productos más vistos y vendidos'
  },
  DESIGN_TRENDS: {
    id: 'design_trends',
    name: 'Tendencias de Diseños',
    icon: ChartLineUp,
    type: 'line',
    description: 'Evolución de cotizaciones por tiempo'
  }
};

// ================ ESTILOS STYLED COMPONENTS ================
const PageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  background: '#FFFFFF',
  width: '100%',
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1920px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '24px',
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
  background: '#FFFFFF',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const WelcomeCard = styled(ModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
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
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(60px, -60px)',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  }
}));

const WelcomeContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  }
}));

const WelcomeInfo = styled(Box)({
  flex: 1,
});

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '8px',
  color: '#FFFFFF',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  }
}));

const WelcomeSubtitle = styled(Typography)({
  fontSize: '1rem',
  opacity: 0.9,
  marginBottom: '16px',
  color: '#FFFFFF',
});

const QuickActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    '& button': {
      width: '100%',
    }
  }
}));

const QuickActionButton = styled(Button)({
  background: 'rgba(255, 255, 255, 0.2)',
  color: '#FFFFFF',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  padding: '10px 20px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
  }
});

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginBottom: '32px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
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
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    ...selectedVariant,
    '&::before': variant !== 'default' ? {
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
    [theme.breakpoints.down('md')]: {
      padding: '20px',
    }
  };
});

const StatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const StatIconContainer = styled(Box)(({ variant }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant !== 'default' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant !== 'default' ? '#FFFFFF' : '#1F64BF',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: '4px',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  }
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  opacity: 0.8,
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  }
}));

const StatTrend = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '8px',
  padding: '4px 8px',
  borderRadius: '6px',
  background: 'rgba(255, 255, 255, 0.15)',
  width: 'fit-content',
});

const MainGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '32px',
  marginBottom: '32px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
    gap: '24px',
  }
}));

const ActivitySection = styled(Box)({
  marginBottom: '32px',
});

const SectionTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ChartControlsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  padding: '16px 24px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'stretch',
  }
}));

const ChartCard = styled(ModernCard)(({ theme, visible }) => ({
  padding: '24px',
  height: '450px',
  position: 'relative',
  display: visible ? 'block' : 'none',
  [theme.breakpoints.down('md')]: {
    height: '400px',
    padding: '20px',
  }
}));

// ================ COMPONENTE PRINCIPAL ================
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados para gráficas dinámicas
  const [visibleCharts, setVisibleCharts] = useState({
    products_overview: true,
    user_stats: true,
    employee_distribution: true,
    design_status: false,
    products_performance: false,
    design_trends: false
  });
  
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
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

  // Configuración base para gráficas
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter',
            size: 12,
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
        cornerRadius: 12,
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        }
      }
    }
  };

  // ================ FUNCIONES DE DATOS ================

  // Obtener estadísticas principales del dashboard
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

  // ================ GENERADORES DE DATOS PARA GRÁFICAS ================

  // Vista general de productos
  const getProductsOverviewData = () => {
    const stats = getProductStats();
    return {
      labels: ['Productos Activos', 'Productos Inactivos'],
      datasets: [{
        data: [stats.active, stats.inactive],
        backgroundColor: [colors.primary, colors.gray],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: colors.white
      }]
    };
  };

  // Estadísticas de usuarios
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
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  // Distribución de empleados
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

  // Estados de diseños
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
        borderWidth: 2,
        borderColor: colors.white
      }]
    };
  };

  // Rendimiento de productos (simulado - los hooks reales no tienen datos históricos)
  const getProductsPerformanceData = () => {
    const stats = getProductStats();
    const topProducts = stats.topProducts || [];
    
    return {
      labels: topProducts.slice(0, 5).map(p => p.name || `Producto ${p.id}`),
      datasets: [
        {
          label: 'Vistas',
          data: topProducts.slice(0, 5).map(p => p.totalViews || Math.floor(Math.random() * 100)),
          borderColor: colors.primary,
          backgroundColor: alpha(colors.primary, 0.1),
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Pedidos',
          data: topProducts.slice(0, 5).map(p => p.totalOrders || Math.floor(Math.random() * 20)),
          borderColor: colors.secondary,
          backgroundColor: alpha(colors.secondary, 0.1),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  // Tendencias de diseños (simulado)
  const getDesignTrendsData = () => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6-i));
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    });

    return {
      labels: last7Days,
      datasets: [{
        label: 'Nuevos Diseños',
        data: Array.from({length: 7}, () => Math.floor(Math.random() * 10) + 1),
        borderColor: colors.accent,
        backgroundColor: alpha(colors.accent, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.accent,
        pointBorderColor: colors.white,
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
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
      style={{ zIndex: 9999 }} // Z-index alto para estar por encima del editor
      PaperProps={{
        sx: {
          zIndex: 10000 // Z-index adicional en el paper
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gear size={24} />
        Configuración de Gráficas
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={() => setChartSettingsOpen(false)}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
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
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <chart.icon size={20} />
                  <Box>
                    <Typography variant="body1">{chart.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
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
              />
            }
            label="Actualización Automática"
            sx={{ mb: 2 }}
          />
          
          {autoRefresh && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Intervalo de Actualización</InputLabel>
              <Select
                value={refreshInterval}
                label="Intervalo de Actualización"
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
      
      <DialogActions>
        <Button onClick={() => setChartSettingsOpen(false)}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={16} />
                  <Typography variant="body2">
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={16} />
                  <Typography variant="body2">
                    {currentTime.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                {autoRefresh && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Pulse size={16} />
                    <Typography variant="body2">
                      Auto-refresh: {refreshInterval}s
                    </Typography>
                  </Box>
                )}
              </Box>
            </WelcomeInfo>
            
            <QuickActionsContainer>
              <QuickActionButton
                startIcon={<Plus size={18} />}
                onClick={() => handleQuickAction('create_product')}
              >
                Crear Producto
              </QuickActionButton>
              <QuickActionButton
                startIcon={<Gear size={18} />}
                onClick={() => handleQuickAction('view_analytics')}
              >
                Configurar Gráficas
              </QuickActionButton>
            </QuickActionsContainer>
          </WelcomeContent>
        </WelcomeCard>

        {/* Stats Cards */}
        <StatsGrid>
          {getDashboardStats().map((stat) => (
            <StatCard key={stat.id} variant={stat.variant}>
              <StatHeader>
                <Box>
                  <StatValue>
                    {stat.loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      stat.value
                    )}
                  </StatValue>
                  <StatLabel>
                    {stat.title}
                  </StatLabel>
                </Box>
                <StatIconContainer variant={stat.variant}>
                  <stat.icon size={24} weight="duotone" />
                </StatIconContainer>
              </StatHeader>
              <StatTrend trend={stat.trend}>
                <TrendUp size={12} weight="bold" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {stat.change}
                </Typography>
              </StatTrend>
            </StatCard>
          ))}
        </StatsGrid>

        <MainGrid>
          {/* Resumen rápido con errores */}
          <Box>
            <ModernCard sx={{ p: 3, mb: 3 }}>
              <SectionTitle sx={{ mb: 2, fontSize: '1.25rem' }}>
                <Target size={20} weight="duotone" />
                Estado del Sistema
              </SectionTitle>
              
              {/* Mostrar errores si los hay */}
              {(productsError || usersError || employeesError || designsError) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Algunos servicios tienen problemas:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {productsError && <li>Productos: {productsError}</li>}
                    {usersError && <li>Usuarios: {usersError}</li>}
                    {employeesError && <li>Empleados: {employeesError}</li>}
                    {designsError && <li>Diseños: {designsError}</li>}
                  </ul>
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Servicios Operativos
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600 }}>
                    {4 - [productsError, usersError, employeesError, designsError].filter(Boolean).length}/4
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(4 - [productsError, usersError, employeesError, designsError].filter(Boolean).length) * 25}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(colors.accent, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.accent,
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: alpha(colors.accent, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.accent
                }}>
                  <Lightning size={20} weight="duotone" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark }}>
                    Productos más Populares
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray }}>
                    {getProductStats().topProducts?.[0]?.name || 'Sin datos disponibles'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary
                }}>
                  <Coffee size={20} weight="duotone" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark }}>
                    Última Actualización
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </ModernCard>
          </Box>

          {/* Controles de gráficas */}
          <Box>
            <ModernCard sx={{ p: 3 }}>
              <SectionTitle sx={{ mb: 2, fontSize: '1.25rem' }}>
                <ChartLine size={20} weight="duotone" />
                Control de Gráficas
              </SectionTitle>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Gear size={18} />}
                  onClick={() => setChartSettingsOpen(true)}
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
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
                  startIcon={<ArrowRight size={18} />}
                  onClick={handleRefreshAll}
                  sx={{
                    borderColor: colors.secondary,
                    color: colors.secondary,
                    '&:hover': {
                      borderColor: colors.accent,
                      backgroundColor: alpha(colors.secondary, 0.05),
                    }
                  }}
                >
                  Actualizar Datos
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Gráficas Activas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(CHART_TYPES)
                      .filter(([id]) => visibleCharts[id])
                      .map(([id, chart]) => (
                        <Chip
                          key={id}
                          icon={<chart.icon size={16} />}
                          label={chart.name}
                          size="small"
                          sx={{
                            background: alpha(colors.primary, 0.1),
                            color: colors.primary,
                            fontWeight: 600
                          }}
                        />
                      ))
                    }
                  </Box>
                </Box>
              </Box>
            </ModernCard>
          </Box>
        </MainGrid>

        {/* Charts Section */}
        <ActivitySection>
          <ChartControlsBar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SectionTitle sx={{ mb: 0 }}>
                <ChartLine size={24} weight="duotone" />
                Analíticas Dinámicas
              </SectionTitle>
              
              <Chip
                label={`${visibleChartsCount} activa${visibleChartsCount !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  background: colors.accent,
                  color: colors.white,
                  fontWeight: 600
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {autoRefresh && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Pulse size={16} style={{ color: colors.accent }} />
                  <Typography variant="body2" sx={{ color: colors.accent }}>
                    Auto-refresh cada {refreshInterval}s
                  </Typography>
                </Box>
              )}
              
              <Tooltip title="Configurar gráficas">
                <IconButton
                  onClick={() => setChartSettingsOpen(true)}
                  sx={{ 
                    color: colors.primary,
                    '&:hover': { backgroundColor: alpha(colors.primary, 0.1) }
                  }}
                >
                  <Gear size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </ChartControlsBar>
          
          {/* Contenedor de gráficas dinámicas */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              md: 'repeat(2, 1fr)',
              lg: visibleChartsCount <= 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
            }, 
            gap: 3,
            minHeight: visibleChartsCount === 0 ? '300px' : 'auto'
          }}>
            {visibleChartsCount === 0 ? (
              <Box sx={{ 
                gridColumn: '1 / -1',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                py: 6
              }}>
                <EyeSlash size={48} style={{ color: colors.gray, marginBottom: '16px' }} />
                <Typography variant="h6" sx={{ color: colors.dark, mb: 1 }}>
                  No hay gráficas seleccionadas
                </Typography>
                <Typography variant="body2" sx={{ color: colors.gray, mb: 3 }}>
                  Selecciona al menos una gráfica para visualizar los datos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Gear size={18} />}
                  onClick={() => setChartSettingsOpen(true)}
                  sx={{
                    backgroundColor: colors.primary,
                    '&:hover': {
                      backgroundColor: colors.secondary,
                    }
                  }}
                >
                  Configurar Gráficas
                </Button>
              </Box>
            ) : (
              <>
                {/* Vista General de Productos */}
                <ChartCard visible={visibleCharts.products_overview}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Package size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Productos
                      </Typography>
                    </Box>
                    {productsLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {productsError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar datos de productos
                        </Typography>
                      </Box>
                    ) : (
                      <Doughnut data={getProductsOverviewData()} options={chartOptions} />
                    )}
                  </Box>
                </ChartCard>

                {/* Estadísticas de Usuarios */}
                <ChartCard visible={visibleCharts.user_stats}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Usuarios
                      </Typography>
                    </Box>
                    {usersLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {usersError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar datos de usuarios
                        </Typography>
                      </Box>
                    ) : (
                      <Bar 
                        data={getUserStatsData()} 
                        options={{
                          ...chartOptions,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: alpha(colors.primary, 0.1)
                              },
                              ticks: {
                                color: colors.gray
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                color: colors.gray
                              }
                            }
                          }
                        }} 
                      />
                    )}
                  </Box>
                </ChartCard>

                {/* Distribución de Empleados */}
                <ChartCard visible={visibleCharts.employee_distribution}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Empleados por Rol
                      </Typography>
                    </Box>
                    {employeesLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {employeesError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar datos de empleados
                        </Typography>
                      </Box>
                    ) : (
                      <Pie data={getEmployeeDistributionData()} options={chartOptions} />
                    )}
                  </Box>
                </ChartCard>

                {/* Estados de Diseños */}
                <ChartCard visible={visibleCharts.design_status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ChartPie size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Estados de Diseños
                      </Typography>
                    </Box>
                    {designsLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {designsError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar datos de diseños
                        </Typography>
                      </Box>
                    ) : (
                      <PolarArea data={getDesignStatusData()} options={chartOptions} />
                    )}
                  </Box>
                </ChartCard>

                {/* Rendimiento de Productos */}
                <ChartCard visible={visibleCharts.products_performance}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendUp size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Rendimiento de Productos
                      </Typography>
                    </Box>
                    {productsLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {productsError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar datos de rendimiento
                        </Typography>
                      </Box>
                    ) : (
                      <Line 
                        data={getProductsPerformanceData()} 
                        options={{
                          ...chartOptions,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: alpha(colors.primary, 0.1)
                              },
                              ticks: {
                                color: colors.gray
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                color: colors.gray
                              }
                            }
                          }
                        }} 
                      />
                    )}
                  </Box>
                </ChartCard>

                {/* Tendencias de Diseños */}
                <ChartCard visible={visibleCharts.design_trends}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ChartLineUp size={20} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                        Tendencias de Diseños
                      </Typography>
                    </Box>
                    {designsLoading && <CircularProgress size={20} />}
                  </Box>
                  <Box sx={{ height: '350px', position: 'relative' }}>
                    {designsError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                        <Warning size={32} style={{ color: colors.gray, marginBottom: '8px' }} />
                        <Typography variant="body2" color="text.secondary">
                          Error al cargar tendencias
                        </Typography>
                      </Box>
                    ) : (
                      <Line 
                        data={getDesignTrendsData()} 
                        options={{
                          ...chartOptions,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: alpha(colors.primary, 0.1)
                              },
                              ticks: {
                                color: colors.gray
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                color: colors.gray
                              }
                            }
                          }
                        }} 
                      />
                    )}
                  </Box>
                </ChartCard>
              </>
            )}
          </Box>
        </ActivitySection>

        {/* Dialog de configuración */}
        <ChartSettingsDialog />
      </ContentWrapper>
    </PageContainer>
  );
};

export default Dashboard;