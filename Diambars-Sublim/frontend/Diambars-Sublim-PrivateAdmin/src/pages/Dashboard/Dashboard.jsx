import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Chip, Paper, alpha, Divider, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Switch, FormControlLabel, useTheme, useMediaQuery, styled } from '@mui/material';
import { ChartLine, Package, Users, TrendUp, Clock, ArrowRight, User, Coffee, Lightning, Target, Gear, EyeSlash, ChartPie, X } from '@phosphor-icons/react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, Filler, RadialLinearScale } from 'chart.js';
import { Doughnut, Bar, Pie, PolarArea } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, ArcElement, Filler, RadialLinearScale);

const CHART_TYPES = {
  PRODUCTS_OVERVIEW: { id: 'products_overview', name: 'Productos', icon: Package, description: 'Estado de productos' },
  USER_STATS: { id: 'user_stats', name: 'Usuarios', icon: Users, description: 'Usuarios por estado' },
  EMPLOYEE_DISTRIBUTION: { id: 'employee_distribution', name: 'Empleados', icon: User, description: 'Empleados por rol' },
  DESIGN_STATUS: { id: 'design_status', name: 'Diseños', icon: ChartPie, description: 'Diseños por estado' }
};

const mockData = {
  products: { total: 45, active: 38, inactive: 7 },
  users: { total: 156, active: 142, inactive: 14, admins: 5, premium: 23, customers: 128 },
  employees: { total: 12, active: 10, roles: { admins: 2, managers: 3, employees: 4, delivery: 2, production: 1 } },
  designs: { total: 28, pending: 7, quoted: 8, approved: 10, rejected: 2, completed: 1, drafts: 0 }
};

// ================ KEYFRAMES PARA ANIMACIÓN DE MÁRMOL ================ 
const marbleFlowKeyframes = `
@keyframes marbleFlow {
  0% {
    transform: translate(2%, 2%) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(-8%, -8%) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translate(-15%, 8%) rotate(-3deg) scale(1.08);
  }
  75% {
    transform: translate(-8%, -5%) rotate(2deg) scale(1.05);
  }
  100% {
    transform: translate(2%, 2%) rotate(0deg) scale(1);
  }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = marbleFlowKeyframes;
  document.head.appendChild(styleSheet);
}

// ================ STYLED COMPONENTS ================ 
const DashboardPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
});

const DashboardContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  padding: '80px 12px 20px',
  fontFamily: "'Mona Sans'",
  boxSizing: 'border-box',
  
  [theme.breakpoints.up('sm')]: {
    padding: '100px 16px 24px',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: '110px 20px 32px',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: '120px 24px 40px',
  }
}));

const ModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.04)',
  transition: 'all 0.3s ease',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  
  [theme.breakpoints.up('md')]: {
    borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  }
}));

const DashboardStatCard = styled(ModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(25, 83, 158, 0.3)',
      marbleVeins: 'rgba(3, 44, 166, 0.5)',
      marbleHighlight: 'rgba(123, 164, 221, 0.6)',
      marbleDark: 'rgba(1, 21, 63, 0.25)',
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(13, 75, 54, 0.3)',
      marbleVeins: 'rgba(9, 138, 97, 0.5)',
      marbleHighlight: 'rgba(86, 236, 181, 0.6)',
      marbleDark: 'rgba(2, 77, 55, 0.25)',
    },
    warning: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(245, 158, 11, 0.3)',
      marbleVeins: 'rgba(217, 119, 6, 0.5)',
      marbleHighlight: 'rgba(251, 191, 36, 0.6)',
      marbleDark: 'rgba(180, 83, 9, 0.25)',
    },
    danger: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(239, 68, 68, 0.3)',
      marbleVeins: 'rgba(220, 38, 38, 0.5)',
      marbleHighlight: 'rgba(248, 113, 113, 0.6)',
      marbleDark: 'rgba(185, 28, 28, 0.25)',
    },
    secondary: {
      background: 'white',
      color: '#010326',
      marbleBase: 'rgba(31, 100, 191, 0.08)',
      marbleVeins: 'rgba(3, 44, 166, 0.15)',
      marbleHighlight: 'rgba(100, 150, 220, 0.25)',
      marbleDark: 'rgba(31, 100, 191, 0.05)',
    }
  };

  const selectedVariant = variants[variant] || variants.secondary;
  const isColoredVariant = ['primary', 'success', 'warning', 'danger'].includes(variant);

  return {
    padding: '16px',
    width: '100%',
    minHeight: '100px',
    maxHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    ...selectedVariant,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      opacity: 0,
      transition: 'opacity 0.5s ease',
      pointerEvents: 'none',
      zIndex: 0,
      background: `
        radial-gradient(ellipse at 15% 30%, ${selectedVariant.marbleHighlight} 0%, transparent 40%),
        radial-gradient(ellipse at 85% 20%, ${selectedVariant.marbleVeins} 0%, transparent 45%),
        radial-gradient(ellipse at 50% 80%, ${selectedVariant.marbleBase} 0%, transparent 50%),
        radial-gradient(ellipse at 70% 50%, ${selectedVariant.marbleHighlight} 0%, transparent 35%),
        radial-gradient(ellipse at 30% 70%, ${selectedVariant.marbleVeins} 0%, transparent 40%),
        radial-gradient(ellipse at 90% 90%, ${selectedVariant.marbleBase} 0%, transparent 45%),
        radial-gradient(ellipse at 10% 90%, ${selectedVariant.marbleDark} 0%, transparent 30%),
        linear-gradient(125deg, 
          ${selectedVariant.marbleBase} 0%, 
          transparent 25%, 
          ${selectedVariant.marbleVeins} 50%, 
          transparent 75%, 
          ${selectedVariant.marbleHighlight} 100%
        )
      `,
      backgroundSize: '100% 100%',
      animation: 'marbleFlow 10s ease-in-out infinite',
      filter: 'blur(2px)',
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: isColoredVariant 
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
      transition: 'left 0.6s ease',
      zIndex: 1,
      pointerEvents: 'none',
    },

    '&:hover': {
      transform: 'translateY(-2px) scale(1.01)',
      boxShadow: '0 8px 24px rgba(1, 3, 38, 0.1)',
      '&::before': {
        opacity: 1,
      },
      '&::after': {
        left: '100%',
      }
    },

    '&:active': {
      transform: 'translateY(0)',
      transition: 'transform 0.1s ease-out',
    },

    '& > *': {
      position: 'relative',
      zIndex: 2,
    },

    [theme.breakpoints.up('sm')]: {
      padding: '18px',
      minHeight: '120px',
    },
    [theme.breakpoints.up('md')]: {
      padding: '20px',
      minHeight: '140px',
    }
  };
});

const DashboardStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '12px',
  width: '100%',
  gap: '8px',
});

const DashboardStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: ['primary', 'success', 'warning', 'danger'].includes(variant)
    ? 'rgba(255, 255, 255, 0.15)' 
    : alpha('#1F64BF', 0.08),
  backdropFilter: 'blur(8px)',
  color: ['primary', 'success', 'warning', 'danger'].includes(variant) ? 'white' : '#1F64BF',
  flexShrink: 0,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  position: 'relative',
  zIndex: 2,
  
  [theme.breakpoints.up('sm')]: {
    width: '40px',
    height: '40px',
  },
  [theme.breakpoints.up('md')]: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
  }
}));

const DashboardStatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: '4px',
  letterSpacing: '0.5px',
  color: ['primary', 'success', 'warning', 'danger'].includes(variant) ? 'white' : '#010326',
  fontFamily: "'Mona Sans'",
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.7rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.9rem',
    marginBottom: '8px',
  }
}));

const DashboardStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  opacity: ['primary', 'success', 'warning', 'danger'].includes(variant) ? 0.9 : 0.7,
  color: ['primary', 'success', 'warning', 'danger'].includes(variant) ? 'white' : '#032CA6',
  lineHeight: 1.3,
  letterSpacing: '0.3px',
  fontFamily: "'Mona Sans'",
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '0.85rem',
  }
}));

const DashboardStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '6px',
  padding: '3px 6px',
  borderRadius: '6px',
  background: ['primary', 'success', 'warning', 'danger'].includes(variant) ? 'rgba(255, 255, 255, 0.15)' : trend === 'up' ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
  width: 'fit-content',
}));

const DashboardStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  color: ['primary', 'success', 'warning', 'danger'].includes(variant)
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  fontFamily: "'Mona Sans'",
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.75rem',
  }
}));

const DashboardHeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '20px',
  
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '24px',
  },
  
  [theme.breakpoints.up('md')]: {
    gap: '24px',
    marginBottom: '32px',
  }
}));

const DashboardTitleSection = styled(Box)({
  flex: 1,
});

const DashboardMainTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '1.4rem',
  fontWeight: '700',
  color: '#010326',
  margin: '0 0 6px 0',
  background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  lineHeight: 1.2,
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
    gap: '12px',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
    gap: '16px',
    marginBottom: '8px',
  }
}));

const DashboardSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: '#64748b',
  margin: '0 0 8px 0',
  fontWeight: '500',
  lineHeight: 1.4,
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.9rem',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '1rem',
    marginBottom: '12px',
  }
}));

const DashboardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexShrink: 0,
  
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-end',
    gap: '12px',
  }
}));

const DashboardButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: '#FFFFFF',
      border: `2px solid ${alpha('#1F64BF', 0.25)}`,
    },
    secondary: {
      background: 'white',
      color: '#032CA6',
      border: `2px solid ${alpha('#032CA6', 0.2)}`,
    }
  };

  const selectedVariant = variants[variant] || variants.primary;

  return {
    background: selectedVariant.background,
    color: selectedVariant.color,
    border: selectedVariant.border,
    borderRadius: '10px',
    padding: '8px 12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    minWidth: 'auto',
    width: '100%',
    minHeight: '40px',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(4, 13, 191, 0.15)',
    },

    [theme.breakpoints.up('sm')]: {
      padding: '10px 16px',
      fontSize: '0.875rem',
      width: 'auto',
      minHeight: '44px',
    },
    
    [theme.breakpoints.up('md')]: {
      padding: '12px 20px',
      fontSize: '0.9rem',
      borderRadius: '12px',
      minHeight: '48px',
    }
  };
});

const DashboardStatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
  marginBottom: '20px',
  
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  }
}));

const DashboardContentGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '20px',
  
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    gap: '24px',
    marginBottom: '32px',
  }
}));

const ChartsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
  width: '100%',
  
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  }
}));

const ChartContainer = styled(ModernCard)(({ theme }) => ({
  padding: '16px',
  height: '300px',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '0',
  
  [theme.breakpoints.up('sm')]: {
    height: '320px',
    padding: '18px',
  },
  
  [theme.breakpoints.up('md')]: {
    height: '350px',
    padding: '20px',
  }
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  opacity: 0.7,
  color: '#64748b',
  fontSize: '0.8rem',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
    gap: '8px',
  }
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleCharts, setVisibleCharts] = useState({ 
    products_overview: true, 
    user_stats: true, 
    employee_distribution: true, 
    design_status: false 
  });
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const colors = { primary: '#1F64BF', secondary: '#032CA6', accent: '#040DBF', dark: '#010326', gray: '#64748b' };

  const getChartOptions = () => ({ 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { 
        display: true, 
        position: 'top', 
        labels: { 
          usePointStyle: true, 
          padding: isMobile ? 6 : 12, 
          font: { 
            size: isMobile ? 8 : 10, 
            weight: '600' 
          } 
        } 
      } 
    } 
  });

  const getDashboardStats = () => [
    { id: 'products', title: 'Total Productos', value: mockData.products.total.toString(), change: `${Math.round((mockData.products.active/mockData.products.total)*100)}% activos`, icon: Package, variant: 'primary', trend: 'up' },
    { id: 'users', title: 'Usuarios Totales', value: mockData.users.total.toString(), change: `${mockData.users.active} activos`, icon: Users, variant: 'success', trend: 'up' },
    { id: 'employees', title: 'Personal Activo', value: mockData.employees.active.toString(), change: `${mockData.employees.total} total`, icon: User, variant: 'warning', trend: 'up' },
    { id: 'designs', title: 'Diseños Pendientes', value: mockData.designs.pending.toString(), change: `${mockData.designs.total} total`, icon: ChartLine, variant: 'danger', trend: 'down' }
  ];

  const formatTime = (date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const getGreeting = () => { 
    const hour = currentTime.getHours(); 
    if (hour < 12) return 'Buenos días'; 
    if (hour < 18) return 'Buenas tardes'; 
    return 'Buenas noches'; 
  };
  
  const visibleChartsCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <DashboardPageContainer>
      <DashboardContentWrapper>
        
        {/* Header */}
        <DashboardHeaderSection>
          <DashboardTitleSection>
            <DashboardMainTitle>
              <Target size={isMobile ? 24 : 28} weight="duotone" />
              {getGreeting()} Administrador
            </DashboardMainTitle>
            <DashboardSubtitle>
              Panel de control - {visibleChartsCount} gráfica{visibleChartsCount !== 1 ? 's' : ''} activa{visibleChartsCount !== 1 ? 's' : ''}
            </DashboardSubtitle>
            <TimeDisplay>
              <Clock size={isMobile ? 14 : 16} />
              <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{formatTime(currentTime)}</Typography>
            </TimeDisplay>
          </DashboardTitleSection>

          <DashboardActions>
            <DashboardButton 
              variant="primary"
              startIcon={<Gear size={isMobile ? 16 : 18} />} 
              onClick={() => setChartSettingsOpen(true)}
            >
              {isMobile ? 'Configurar' : 'Configurar Gráficas'}
            </DashboardButton>
          </DashboardActions>
        </DashboardHeaderSection>

        {/* Cards de estadísticas */}
        <DashboardStatsGrid>
          {getDashboardStats().map((stat) => (
            <DashboardStatCard key={stat.id} variant={stat.variant}>
              <DashboardStatHeader>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <DashboardStatValue variant={stat.variant}>{stat.value}</DashboardStatValue>
                  <DashboardStatLabel variant={stat.variant}>{stat.title}</DashboardStatLabel>
                </Box>
                <DashboardStatIconContainer variant={stat.variant}>
                  <stat.icon size={isMobile ? 18 : 20} weight="duotone" />
                </DashboardStatIconContainer>
              </DashboardStatHeader>
              <DashboardStatChange variant={stat.variant} trend={stat.trend}>
                <TrendUp size={isMobile ? 10 : 12} weight="bold" />
                <DashboardStatTrendText variant={stat.variant} trend={stat.trend}>
                  {stat.change}
                </DashboardStatTrendText>
              </DashboardStatChange>
            </DashboardStatCard>
          ))}
        </DashboardStatsGrid>

        {/* Contenido principal */}
        <DashboardContentGrid>
          {/* Estado del Sistema */}
          <ModernCard sx={{ padding: isMobile ? 2 : 3, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 2, marginBottom: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                width: isMobile ? 40 : 48, 
                height: isMobile ? 40 : 48, 
                borderRadius: isMobile ? '10px' : '12px', 
                background: alpha('#1F64BF', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1F64BF' 
              }}>
                <Target size={isMobile ? 20 : 24} weight="duotone" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: isMobile ? '1rem' : '1.25rem' }}>
                Estado del Sistema
              </Typography>
            </Box>
            
            <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Servicios Operativos</Typography>
                <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>4/4</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: alpha(colors.accent, 0.1), 
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: colors.accent, 
                    borderRadius: 3 
                  } 
                }} 
              />
            </Box>
            
            <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, mb: isMobile ? 1.5 : 2 }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                borderRadius: '8px', 
                background: alpha(colors.accent, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: colors.accent 
              }}>
                <Lightning size={isMobile ? 16 : 18} weight="duotone" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Productos más Populares</Typography>
                <Typography variant="body2" sx={{ color: colors.gray, fontSize: isMobile ? '0.7rem' : '0.75rem' }}>Camiseta Básica</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                borderRadius: '8px', 
                background: alpha(colors.primary, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: colors.primary 
              }}>
                <Coffee size={isMobile ? 16 : 18} weight="duotone" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Última Actualización</Typography>
                <Typography variant="body2" sx={{ color: colors.gray, fontSize: isMobile ? '0.7rem' : '0.75rem' }}>{formatTime(currentTime)}</Typography>
              </Box>
            </Box>
          </ModernCard>

          {/* Control de Gráficas */}
          <ModernCard sx={{ 
            padding: isMobile ? 2 : 3, 
            width: '100%', 
            [theme.breakpoints.up('md')]: {
              width: '300px',
              flexShrink: 0,
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 2, marginBottom: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                width: isMobile ? 40 : 48, 
                height: isMobile ? 40 : 48, 
                borderRadius: isMobile ? '10px' : '12px', 
                background: alpha('#1F64BF', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1F64BF' 
              }}>
                <ChartLine size={isMobile ? 20 : 24} weight="duotone" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: isMobile ? '1rem' : '1.25rem' }}>
                Control de Gráficas
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: isMobile ? 2 : 3 }}>
              <DashboardButton 
                variant="secondary"
                startIcon={<Gear size={isMobile ? 14 : 16} />} 
                onClick={() => setChartSettingsOpen(true)} 
                fullWidth
              >
                Configurar Gráficas
              </DashboardButton>
              <DashboardButton 
                variant="secondary"
                startIcon={<ArrowRight size={isMobile ? 14 : 16} />} 
                fullWidth
              >
                Actualizar Datos
              </DashboardButton>
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                Gráficas Activas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.entries(CHART_TYPES).filter(([id]) => visibleCharts[id]).map(([id, chart]) => (
                  <Chip 
                    key={id} 
                    icon={<chart.icon size={isMobile ? 12 : 14} />} 
                    label={isMobile ? chart.name.substring(0, 3) : chart.name} 
                    size="small" 
                    sx={{ 
                      background: alpha(colors.primary, 0.1), 
                      color: colors.primary, 
                      fontWeight: 600, 
                      fontSize: isMobile ? '0.65rem' : '0.7rem', 
                      height: '24px',
                      '& .MuiChip-icon': {
                        marginLeft: '4px',
                        marginRight: '2px'
                      }
                    }} 
                  />
                ))}
              </Box>
            </Box>
          </ModernCard>
        </DashboardContentGrid>

        {/* Sección de gráficas */}
        <ModernCard sx={{ padding: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1, 
            marginBottom: isMobile ? 2 : 3, 
            padding: isMobile ? 1.5 : 2, 
            background: '#f8fafc', 
            borderRadius: '10px', 
            border: `1px solid ${alpha('#1F64BF', 0.1)}` 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  padding: 1, 
                  borderRadius: '8px', 
                  backgroundColor: alpha('#1F64BF', 0.1), 
                  color: '#1F64BF' 
                }}>
                  <ChartLine size={isMobile ? 18 : 20} weight="duotone" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                  Analíticas Dinámicas
                </Typography>
                <Chip 
                  label={`${visibleChartsCount}`} 
                  size="small" 
                  sx={{ 
                    background: colors.accent, 
                    color: '#fff', 
                    fontWeight: 600, 
                    fontSize: '0.7rem', 
                    height: '20px',
                    minWidth: '20px'
                  }} 
                />
              </Box>
              
              <Tooltip title="Configurar gráficas">
                <IconButton 
                  onClick={() => setChartSettingsOpen(true)} 
                  size="small" 
                  sx={{ 
                    color: colors.primary, 
                    '&:hover': { 
                      backgroundColor: alpha(colors.primary, 0.1) 
                    } 
                  }}
                >
                  <Gear size={isMobile ? 16 : 18} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {visibleChartsCount === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 6 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: alpha('#1F64BF', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem', 
                color: '#1F64BF' 
              }}>
                <EyeSlash size={isMobile ? 24 : 32} weight="duotone" />
              </Box>
              <Typography variant="h6" sx={{ color: colors.dark, mb: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                No hay gráficas seleccionadas
              </Typography>
              <Typography variant="body2" sx={{ color: colors.gray, mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                Selecciona al menos una gráfica para visualizar los datos
              </Typography>
              <DashboardButton 
                variant="primary"
                startIcon={<Gear size={isMobile ? 14 : 16} />} 
                onClick={() => setChartSettingsOpen(true)}
              >
                Configurar Gráficas
              </DashboardButton>
            </Box>
          ) : (
            <ChartsGrid>
              {visibleCharts.products_overview && (
                <ChartContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Package size={isMobile ? 14 : 16} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      Productos
                    </Typography>
                  </Box>
                  <Box sx={{ height: isMobile ? '220px' : '250px', position: 'relative', flex: 1 }}>
                    <Doughnut 
                      data={{ 
                        labels: ['Activos', 'Inactivos'], 
                        datasets: [{ 
                          data: [mockData.products.active, mockData.products.inactive], 
                          backgroundColor: [colors.primary, colors.gray], 
                          borderWidth: 0 
                        }] 
                      }} 
                      options={getChartOptions()} 
                    />
                  </Box>
                </ChartContainer>
              )}
              
              {visibleCharts.user_stats && (
                <ChartContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Users size={isMobile ? 14 : 16} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      Usuarios
                    </Typography>
                  </Box>
                  <Box sx={{ height: isMobile ? '220px' : '250px', position: 'relative', flex: 1 }}>
                    <Bar 
                      data={{ 
                        labels: ['Activos', 'Inactivos', 'Admins', 'Premium', 'Clientes'], 
                        datasets: [{ 
                          label: 'Usuarios', 
                          data: [mockData.users.active, mockData.users.inactive, mockData.users.admins, mockData.users.premium, mockData.users.customers], 
                          backgroundColor: [colors.primary, colors.gray, colors.accent, colors.secondary, alpha(colors.primary, 0.6)], 
                          borderRadius: 6 
                        }] 
                      }} 
                      options={getChartOptions()} 
                    />
                  </Box>
                </ChartContainer>
              )}
              
              {visibleCharts.employee_distribution && (
                <ChartContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <User size={isMobile ? 14 : 16} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      Empleados
                    </Typography>
                  </Box>
                  <Box sx={{ height: isMobile ? '220px' : '250px', position: 'relative', flex: 1 }}>
                    <Pie 
                      data={{ 
                        labels: ['Admins', 'Gerentes', 'Empleados', 'Delivery', 'Producción'], 
                        datasets: [{ 
                          data: [
                            mockData.employees.roles.admins, 
                            mockData.employees.roles.managers, 
                            mockData.employees.roles.employees, 
                            mockData.employees.roles.delivery, 
                            mockData.employees.roles.production
                          ], 
                          backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.dark, alpha(colors.primary, 0.6)] 
                        }] 
                      }} 
                      options={getChartOptions()} 
                    />
                  </Box>
                </ChartContainer>
              )}
              
              {visibleCharts.design_status && (
                <ChartContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ChartPie size={isMobile ? 14 : 16} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      Diseños
                    </Typography>
                  </Box>
                  <Box sx={{ height: isMobile ? '220px' : '250px', position: 'relative', flex: 1 }}>
                    <PolarArea 
                      data={{ 
                        labels: ['Pendientes', 'Cotizados', 'Aprobados', 'Rechazados', 'Completados', 'Borradores'], 
                        datasets: [{ 
                          data: [
                            mockData.designs.pending, 
                            mockData.designs.quoted, 
                            mockData.designs.approved, 
                            mockData.designs.rejected, 
                            mockData.designs.completed, 
                            mockData.designs.drafts
                          ], 
                          backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.gray, colors.dark, alpha(colors.primary, 0.4)] 
                        }] 
                      }} 
                      options={getChartOptions()} 
                    />
                  </Box>
                </ChartContainer>
              )}
            </ChartsGrid>
          )}
        </ModernCard>

        {/* Modal de configuración */}
        <Dialog 
          open={chartSettingsOpen} 
          onClose={() => setChartSettingsOpen(false)} 
          maxWidth="sm" 
          fullWidth 
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              margin: isMobile ? 0 : '32px',
              width: '100%',
              maxHeight: isMobile ? '100%' : 'calc(100% - 64px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            padding: isMobile ? 2 : 3,
            borderBottom: `1px solid ${alpha('#1F64BF', 0.1)}`
          }}>
            <Gear size={isMobile ? 20 : 24} />
            <Typography variant="h6" sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Configuración de Gráficas
            </Typography>
            <Box sx={{ flex: 1 }} />
            <IconButton 
              onClick={() => setChartSettingsOpen(false)} 
              size={isMobile ? "small" : "medium"}
              sx={{ 
                color: colors.gray,
                '&:hover': {
                  backgroundColor: alpha(colors.gray, 0.1)
                }
              }}
            >
              <X size={isMobile ? 18 : 20} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ padding: isMobile ? 2 : 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                Gráficas Visibles
              </Typography>
              {Object.values(CHART_TYPES).map((chart) => (
                <FormControlLabel 
                  key={chart.id}
                  control={
                    <Switch 
                      checked={visibleCharts[chart.id]} 
                      onChange={(e) => setVisibleCharts(prev => ({ ...prev, [chart.id]: e.target.checked }))} 
                      color="primary" 
                      size={isMobile ? "small" : "medium"}
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <chart.icon size={isMobile ? 18 : 20} />
                      <Box>
                        <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>{chart.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}>{chart.description}</Typography>
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
                    size={isMobile ? "small" : "medium"}
                  />
                } 
                label={
                  <Typography sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                    Actualización Automática
                  </Typography>
                } 
                sx={{ mb: 2 }} 
              />
              {autoRefresh && (
                <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                  <InputLabel sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Intervalo</InputLabel>
                  <Select 
                    value={refreshInterval} 
                    label="Intervalo" 
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                  >
                    <MenuItem value={15} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>15 segundos</MenuItem>
                    <MenuItem value={30} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>30 segundos</MenuItem>
                    <MenuItem value={60} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>1 minuto</MenuItem>
                    <MenuItem value={300} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>5 minutos</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ padding: isMobile ? 2 : 3, borderTop: `1px solid ${alpha('#1F64BF', 0.1)}` }}>
            <Button 
              onClick={() => setChartSettingsOpen(false)} 
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                minWidth: 'auto',
                padding: isMobile ? '6px 12px' : '8px 16px'
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContentWrapper>
    </DashboardPageContainer>
  );
};

export default Dashboard;