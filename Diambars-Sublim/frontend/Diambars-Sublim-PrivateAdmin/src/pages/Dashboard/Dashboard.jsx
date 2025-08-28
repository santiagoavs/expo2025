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
  Divider
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
  Target
} from '@phosphor-icons/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import Swal from 'sweetalert2';
// import Navbar from '../components/NavBar/NavBar'; // Descomenta cuando tengas el componente

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

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

// Stats Cards
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

// Main Grid
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

// Activity Cards
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

const ActivityCard = styled(ModernCard)({
  padding: '20px',
  marginBottom: '16px',
});

const ActivityHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ActivityContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ActivityIcon = styled(Box)(({ type }) => {
  const colors = {
    success: '#032CA6',
    warning: '#040DBF',
    info: '#1F64BF',
    error: '#010326',
  };

  return {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: alpha(colors[type] || colors.info, 0.1),
    color: colors[type] || colors.info,
  };
});

// ================ COMPONENTE PRINCIPAL ================
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Configurar SweetAlert2
  useEffect(() => {
    if (typeof Swal !== 'undefined') {
      Swal.mixin({
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        },
        backdrop: 'rgba(0,0,0,0.7)',
        allowOutsideClick: true,
        allowEscapeKey: true
      });
    }
  }, []);

  // Paleta de colores del proyecto ACTUALIZADA
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
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: colors.gray
        }
      },
      y: {
        grid: {
          color: alpha(colors.primary, 0.1),
          lineWidth: 1
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: colors.gray
        }
      }
    }
  };

  // Datos para las gráficas
  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    datasets: [
      {
        label: 'Ingresos 2024',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000],
        borderColor: colors.primary,
        backgroundColor: alpha(colors.primary, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: colors.white,
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Ingresos 2023',
        data: [8000, 14000, 12000, 18000, 16000, 22000, 20000, 24000],
        borderColor: colors.secondary,
        backgroundColor: alpha(colors.secondary, 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.secondary,
        pointBorderColor: colors.white,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const salesData = {
    labels: ['Camisetas', 'Hoodies', 'Tazas', 'Gorras', 'Bolsas'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.dark,
        alpha(colors.primary, 0.6)
      ],
      borderWidth: 0,
      hoverBorderWidth: 3,
      hoverBorderColor: colors.white
    }]
  };

  const growthData = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Nuevos Usuarios',
      data: [12, 19, 15, 25, 22, 18, 24],
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const performanceData = {
    labels: ['Ventas', 'Marketing', 'Soporte', 'Calidad', 'Entrega', 'Satisfacción'],
    datasets: [{
      label: 'Este Mes',
      data: [85, 78, 92, 88, 90, 86],
      backgroundColor: alpha(colors.primary, 0.2),
      borderColor: colors.primary,
      borderWidth: 3,
      pointBackgroundColor: colors.primary,
      pointBorderColor: colors.white,
      pointBorderWidth: 2,
      pointRadius: 6,
    }, {
      label: 'Mes Anterior',
      data: [75, 70, 85, 82, 85, 80],
      backgroundColor: alpha(colors.secondary, 0.15),
      borderColor: colors.secondary,
      borderWidth: 2,
      pointBackgroundColor: colors.secondary,
      pointBorderColor: colors.white,
      pointBorderWidth: 2,
      pointRadius: 5,
    }]
  };

  const ordersTimelineData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [{
      label: 'Pedidos por Hora',
      data: [2, 1, 3, 8, 15, 12, 18, 9],
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

  // Opciones específicas
  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: colors.dark,
        titleColor: colors.white,
        bodyColor: colors.white,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: alpha(colors.primary, 0.1)
        },
        angleLines: {
          color: alpha(colors.primary, 0.1)
        },
        pointLabels: {
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          },
          color: colors.dark
        },
        ticks: {
          display: false
        }
      }
    }
  };

  // Datos mock para estadísticas
  const stats = [
    {
      id: 'products',
      title: 'Total Productos',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Package,
      variant: 'primary'
    },
    {
      id: 'users',
      title: 'Usuarios Activos',
      value: '1,843',
      change: '+8%',
      trend: 'up',
      icon: Users,
      variant: 'success'
    },
    {
      id: 'orders',
      title: 'Pedidos Hoy',
      value: '64',
      change: '+23%',
      trend: 'up',
      icon: ShoppingCart,
      variant: 'warning'
    },
    {
      id: 'revenue',
      title: 'Ingresos Mes',
      value: '$15,420',
      change: '+15%',
      trend: 'up',
      icon: ChartLine,
      variant: 'info'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      title: 'Nuevo pedido completado',
      description: 'Orden #1234 - Camiseta personalizada',
      time: '5 min',
    },
    {
      id: 2,
      type: 'info',
      icon: User,
      title: 'Nuevo usuario registrado',
      description: 'María García se unió al sistema',
      time: '12 min',
    },
    {
      id: 3,
      type: 'warning',
      icon: Warning,
      title: 'Stock bajo',
      description: 'Camisetas blancas talla M (5 restantes)',
      time: '1 hora',
    },
    {
      id: 4,
      type: 'success',
      icon: Package,
      title: 'Producto actualizado',
      description: 'Nuevo diseño añadido al catálogo',
      time: '2 horas',
    }
  ];

  // Funciones de manejo
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
        Swal.fire({
          title: '📊 Analíticas',
          text: 'Abriendo panel de estadísticas...',
          icon: 'info',
          confirmButtonColor: colors.primary,
          timer: 1500,
          showConfirmButton: false
        });
        break;
      default:
        break;
    }
  };

  const handleViewAllActivity = () => {
    Swal.fire({
      title: 'Actividad Completa',
      text: 'Cargando historial completo de actividades...',
      icon: 'info',
      confirmButtonColor: colors.primary,
      timer: 1200,
      showConfirmButton: false
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

  return (
    <PageContainer>
      {/* <Navbar /> */}
      
      <ContentWrapper>
        {/* Welcome Card */}
        <WelcomeCard>
          <WelcomeContent>
            <WelcomeInfo>
              <WelcomeTitle>
                {getGreeting()} Administrador
              </WelcomeTitle>
              <WelcomeSubtitle>
                Bienvenido al panel de control de Diambars Sublimado
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
                startIcon={<ChartLine size={18} />}
                onClick={() => handleQuickAction('view_analytics')}
              >
                Ver Analíticas
              </QuickActionButton>
            </QuickActionsContainer>
          </WelcomeContent>
        </WelcomeCard>

        {/* Stats Cards */}
        <StatsGrid>
          {stats.map((stat) => (
            <StatCard key={stat.id} variant={stat.variant}>
              <StatHeader>
                <Box>
                  <StatValue>
                    {stat.value}
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
                  {stat.change} este mes
                </Typography>
              </StatTrend>
            </StatCard>
          ))}
        </StatsGrid>

        <MainGrid>
          {/* Recent Activity */}
          <ActivitySection>
            <SectionTitle>
              <Bell size={24} weight="duotone" />
              Actividad Reciente
            </SectionTitle>
            
            {recentActivity.map((activity) => (
              <ActivityCard key={activity.id}>
                <ActivityHeader>
                  <ActivityContent>
                    <ActivityIcon type={activity.type}>
                      <activity.icon size={20} weight="duotone" />
                    </ActivityIcon>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.gray }}>
                        {activity.description}
                      </Typography>
                    </Box>
                  </ActivityContent>
                  <Chip 
                    label={activity.time}
                    size="small"
                    sx={{ 
                      background: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600
                    }}
                  />
                </ActivityHeader>
              </ActivityCard>
            ))}
            
            <Button
              fullWidth
              sx={{
                mt: 2,
                color: colors.primary,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                borderRadius: '12px',
                '&:hover': {
                  background: alpha(colors.primary, 0.05),
                }
              }}
              endIcon={<ArrowRight size={16} />}
              onClick={handleViewAllActivity}
            >
              Ver toda la actividad
            </Button>
          </ActivitySection>

          {/* Quick Stats */}
          <Box>
            <ModernCard sx={{ p: 3, mb: 3 }}>
              <SectionTitle sx={{ mb: 2, fontSize: '1.25rem' }}>
                <Target size={20} weight="duotone" />
                Resumen Rápido
              </SectionTitle>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Meta Mensual
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600 }}>
                    78%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={78}
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
                    Productos Populares
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray }}>
                    Camisetas personalizadas lideran
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
                    Horario Pico
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray }}>
                    10:00 AM - 2:00 PM más activo
                  </Typography>
                </Box>
              </Box>
            </ModernCard>
          </Box>
        </MainGrid>

        {/* Charts Section */}
        <ActivitySection>
          <SectionTitle>
            <ChartLine size={24} weight="duotone" />
            Analíticas y Estadísticas
          </SectionTitle>
          
          <Grid container spacing={3}>
            {/* Revenue Chart */}
            <Grid item xs={12} lg={8}>
              <ModernCard sx={{ p: 3, height: '400px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                    Ingresos Mensuales
                  </Typography>
                  <Chip 
                    label="$186,420 total"
                    sx={{ 
                      background: colors.accent,
                      color: colors.white,
                      fontWeight: 600
                    }}
                  />
                </Box>
                <Box sx={{ height: '320px', position: 'relative' }}>
                  <Line data={revenueData} options={chartOptions} />
                </Box>
              </ModernCard>
            </Grid>

            {/* Sales Doughnut */}
            <Grid item xs={12} lg={4}>
              <ModernCard sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, mb: 2 }}>
                  Productos Más Vendidos
                </Typography>
                <Box sx={{ height: '320px', position: 'relative' }}>
                  <Doughnut data={salesData} options={salesOptions} />
                </Box>
              </ModernCard>
            </Grid>

            {/* Growth Chart */}
            <Grid item xs={12} lg={6}>
              <ModernCard sx={{ p: 3, height: '350px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                    Nuevos Usuarios (Semana)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendUp size={16} weight="bold" style={{ color: colors.accent }} />
                    <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600 }}>
                      +24% vs semana anterior
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ height: '270px', position: 'relative' }}>
                  <Bar 
                    data={growthData} 
                    options={{
                      ...chartOptions, 
                      plugins: {
                        ...chartOptions.plugins, 
                        legend: { display: false }
                      }
                    }} 
                  />
                </Box>
              </ModernCard>
            </Grid>

            {/* Performance Radar */}
            <Grid item xs={12} lg={6}>
              <ModernCard sx={{ p: 3, height: '350px' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, mb: 2 }}>
                  Rendimiento por Área
                </Typography>
                <Box sx={{ height: '270px', position: 'relative' }}>
                  <Radar data={performanceData} options={radarOptions} />
                </Box>
              </ModernCard>
            </Grid>

            {/* Orders Timeline */}
            <Grid item xs={12}>
              <ModernCard sx={{ p: 3, height: '300px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark }}>
                    Pedidos por Hora (Últimas 24h)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip 
                      label="64 pedidos hoy"
                      size="small"
                      sx={{ 
                        background: colors.primary,
                        color: colors.white,
                        fontWeight: 600
                      }}
                    />
                    <Chip 
                      label="Pico: 18:00"
                      size="small"
                      sx={{ 
                        background: colors.accent,
                        color: colors.white,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ height: '220px', position: 'relative' }}>
                  <Line 
                    data={ordersTimelineData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: { display: false }
                      }
                    }} 
                  />
                </Box>
              </ModernCard>
            </Grid>
          </Grid>
        </ActivitySection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Dashboard;