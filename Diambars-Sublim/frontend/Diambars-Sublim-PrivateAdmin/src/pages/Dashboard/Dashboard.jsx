import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
          padding: isMobile ? 8 : isTablet ? 12 : 15,
          font: {
            family: 'Inter',
            size: isMobile ? 9 : isTablet ? 10 : 11,
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
          size: isMobile ? 11 : isTablet ? 12 : 13,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: isMobile ? 9 : isTablet ? 10 : 11
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
            size: isMobile ? 8 : isTablet ? 9 : 10
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
            size: isMobile ? 8 : isTablet ? 9 : 10
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
        gradient: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
        loading: productsLoading
      },
      {
        id: 'users',
        title: 'Usuarios Totales',
        value: userStats.total.toString(),
        change: userStats.active > 0 ? `${userStats.active} activos` : 'Sin usuarios activos',
        trend: 'up',
        icon: Users,
        color: '#10b981',
        loading: usersLoading
      },
      {
        id: 'employees',
        title: 'Personal Activo',
        value: employeeStats.active.toString(),
        change: `${employeeStats.total} total`,
        trend: 'up',
        icon: User,
        color: '#f59e0b',
        loading: employeesLoading
      },
      {
        id: 'designs',
        title: 'Diseños Pendientes',
        value: designStats.pending.toString(),
        change: `${designStats.total} total`,
        trend: designStats.pending > 0 ? 'up' : 'stable',
        icon: ChartLine,
        color: '#ef4444',
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

  if (productsLoading && usersLoading && employeesLoading && designsLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '120px',
        gap: 3
      }}>
        <Box sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #1F64BF',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />
        <Typography variant="h6" sx={{ color: '#010326', fontWeight: 600 }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '40px',
      paddingX: { xs: 2, sm: 3, md: 4 },
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header */}
        <Paper sx={{ 
          padding: { xs: 3, md: 5 },
          marginBottom: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
          color: '#FFFFFF',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
            transform: 'translateY(-1px)'
          },
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            position: 'relative',
            zIndex: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Target size={24} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: 1,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  {getGreeting()} Administrador
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500
                }}>
                  Panel de control de Diambars Sublimado - {visibleChartsCount} gráfica{visibleChartsCount !== 1 ? 's' : ''} activa{visibleChartsCount !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  opacity: 0.8,
                  flexWrap: 'wrap',
                  mt: 1
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
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                startIcon={<Gear size={18} />}
                onClick={() => handleQuickAction('view_analytics')}
                sx={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '16px',
                  padding: '12px 24px',
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
                  boxShadow: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                    transition: 'left 0.5s ease',
                    zIndex: 1,
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    transform: 'translateY(-1px) scale(1.02)',
                    boxShadow: 'none',
                    '&::before': {
                      left: '100%',
                    }
                  }
                }}
              >
                {isMobile ? 'Configurar' : 'Configurar Gráficas'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Estadísticas */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          marginBottom: 4
        }}>
          {getDashboardStats().map((stat, index) => (
            <Paper 
              key={stat.id}
              sx={{ 
                padding: 3,
                borderRadius: '16px',
                background: stat.gradient || 'white',
                color: stat.gradient ? 'white' : '#010326',
                border: stat.gradient ? 'none' : `1px solid ${alpha('#1F64BF', 0.08)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
                },
                '&::before': stat.gradient ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '70px',
                  height: '70px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(20px, -20px)',
                } : {}
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    marginBottom: 1,
                    color: stat.gradient ? 'white' : '#010326'
                  }}>
                    {stat.loading ? (
                      <CircularProgress 
                        size={24} 
                        color="inherit" 
                      />
                    ) : (
                      stat.value
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: stat.gradient ? 0.9 : 0.7,
                    color: stat.gradient ? 'white' : '#64748b',
                    fontWeight: 500
                  }}>
                    {stat.title}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: stat.gradient 
                      ? 'rgba(255, 255, 255, 0.15)'
                      : alpha(stat.color, 0.1),
                    width: 'fit-content',
                    fontSize: '0.75rem'
                  }}>
                    <TrendUp size={12} weight="bold" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: stat.gradient 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(stat.color, 0.1),
                  borderRadius: '12px',
                  padding: 1.5,
                  color: stat.gradient ? 'white' : stat.color,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: stat.gradient 
                      ? 'rgba(255, 255, 255, 0.3)'
                      : alpha(stat.color, 0.15)
                  }
                }}>
                  <stat.icon size={32} weight="duotone" />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Main Content Grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
          marginBottom: 4
        }}>
          {/* System Status Card */}
          <Paper sx={{ 
            padding: 3,
            borderRadius: '16px',
            background: 'white',
            border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
            '&:hover': {
              boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
              transform: 'translateY(-1px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginBottom: 3
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: alpha('#1F64BF', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F64BF'
              }}>
                <Target size={20} weight="duotone" />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#010326',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}>
                Estado del Sistema
              </Typography>
            </Box>
            
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
          </Paper>

          {/* Chart Controls Card */}
          <Paper sx={{ 
            padding: 3,
            borderRadius: '16px',
            background: 'white',
            border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
            '&:hover': {
              boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
              transform: 'translateY(-1px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginBottom: 3
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: alpha('#1F64BF', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F64BF'
              }}>
                <ChartLine size={20} weight="duotone" />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#010326',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}>
                Control de Gráficas
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<Gear size={16} />}
                onClick={() => setChartSettingsOpen(true)}
                fullWidth
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontSize: '0.8rem',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: colors.secondary,
                    backgroundColor: alpha(colors.primary, 0.05),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.2)'
                  }
                }}
              >
                Configurar Gráficas
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowRight size={16} />}
                onClick={handleRefreshAll}
                fullWidth
                sx={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  fontSize: '0.8rem',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: colors.accent,
                    backgroundColor: alpha(colors.secondary, 0.05),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(3, 44, 166, 0.2)'
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
                        label={chart.name}
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
          </Paper>
        </Box>

        {/* Charts Section */}
        <Paper sx={{ 
          padding: { xs: 2, sm: 3, md: 4 },
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
            transform: 'translateY(-1px)'
          }
        }}>
          {/* Chart Controls Bar */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            marginBottom: 3,
            padding: 2,
            background: '#f8fafc',
            borderRadius: '12px',
            border: `1px solid ${alpha('#1F64BF', 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  padding: 1,
                  borderRadius: '8px',
                  backgroundColor: alpha('#1F64BF', 0.1),
                  color: '#1F64BF'
                }}>
                  <ChartLine size={20} weight="duotone" />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#010326',
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  {isMobile ? 'Analíticas' : 'Analíticas Dinámicas'}
                </Typography>
              </Box>
              
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
          </Box>
          
          {/* Charts Container */}
          {visibleChartsCount === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              py: 8,
              px: 2
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha('#1F64BF', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                color: '#1F64BF'
              }}>
                <EyeSlash size={32} weight="duotone" />
              </Box>
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
                sx={{
                  backgroundColor: colors.primary,
                  fontSize: '0.8rem',
                  borderRadius: '12px',
                  textTransform: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: colors.secondary,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)'
                  }
                }}
              >
                Configurar Gráficas
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
              gap: 3
            }}>
              {/* Vista General de Productos */}
              {visibleCharts.products_overview && (
                <Paper sx={{ 
                  padding: 3,
                  borderRadius: '12px',
                  background: 'white',
                  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
                  height: { xs: '350px', sm: '380px', md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Package size={18} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                        Productos
                      </Typography>
                    </Box>
                    {productsLoading && <CircularProgress size={16} />}
                  </Box>
                  <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
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
                  </Box>
                </Paper>
              )}

              {/* Estadísticas de Usuarios */}
              {visibleCharts.user_stats && (
                <Paper sx={{ 
                  padding: 3,
                  borderRadius: '12px',
                  background: 'white',
                  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
                  height: { xs: '350px', sm: '380px', md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={18} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                        Usuarios
                      </Typography>
                    </Box>
                    {usersLoading && <CircularProgress size={16} />}
                  </Box>
                  <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
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
                  </Box>
                </Paper>
              )}

              {/* Distribución de Empleados */}
              {visibleCharts.employee_distribution && (
                <Paper sx={{ 
                  padding: 3,
                  borderRadius: '12px',
                  background: 'white',
                  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
                  height: { xs: '350px', sm: '380px', md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={18} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                        Empleados
                      </Typography>
                    </Box>
                    {employeesLoading && <CircularProgress size={16} />}
                  </Box>
                  <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
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
                  </Box>
                </Paper>
              )}

              {/* Estados de Diseños */}
              {visibleCharts.design_status && (
                <Paper sx={{ 
                  padding: 3,
                  borderRadius: '12px',
                  background: 'white',
                  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
                  height: { xs: '350px', sm: '380px', md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ChartPie size={18} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>
                        Diseños
                      </Typography>
                    </Box>
                    {designsLoading && <CircularProgress size={16} />}
                  </Box>
                  <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
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
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </Paper>

        {/* Dialog de configuración */}
        <ChartSettingsDialog />
      </Box>
    </Box>
  );
};

export default Dashboard;