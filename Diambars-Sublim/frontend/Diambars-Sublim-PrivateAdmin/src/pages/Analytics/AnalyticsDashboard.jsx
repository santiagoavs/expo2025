// src/pages/Analytics/AnalyticsDashboard.jsx - Página de estadísticas y reportes
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Chip, Paper, alpha, Divider, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Switch, FormControlLabel, useTheme, useMediaQuery, styled } from '@mui/material';
import { ChartLine, Package, Users, TrendUp, Clock, ArrowRight, User, Coffee, Lightning, Target, Gear, EyeSlash, ChartPie, X } from '@phosphor-icons/react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, Filler, RadialLinearScale } from 'chart.js';
import { Doughnut, Bar, Pie, PolarArea } from 'react-chartjs-2';
import { usePermissions } from '../../utils/permissions';

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
  employees: { total: 12, active: 10, roles: { admins: 2, managers: 3, employees: 4, delivery: 2 } },
  designs: { total: 28, pending: 7, quoted: 8, approved: 10, rejected: 2, completed: 1, drafts: 0 }
};

// ================ COMPONENTES ESTILIZADOS ================
const AnalyticsHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 50%, #040DBF 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    animation: 'float 20s ease-in-out infinite'
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' }
  }
}));

const DashboardStatCard = styled(Paper)(({ variant, theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: variant === 'primary' ? 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)' :
              variant === 'success' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
              variant === 'warning' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
              variant === 'danger' ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' :
              'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  }
}));

const DashboardStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  position: 'relative',
  zIndex: 1
});

const DashboardStatIconContainer = styled(Box)(({ variant }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  position: 'relative',
  zIndex: 1
}));

const DashboardStatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: '8px',
  fontFamily: "'Mona Sans'",
  background: 'linear-gradient(45deg, #ffffff 30%, rgba(255, 255, 255, 0.8) 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem',
  }
}));

const DashboardStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  opacity: 0.9,
  color: 'white',
  lineHeight: 1.3,
  letterSpacing: '0.3px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.75rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  }
}));

const DashboardStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '8px',
  padding: '4px 8px',
  borderRadius: '6px',
  background: 'rgba(255, 255, 255, 0.15)',
  width: 'fit-content',
  position: 'relative',
  zIndex: 1
}));

const DashboardStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'white',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  }
}));

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { hasPermission } = usePermissions();
  
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
          padding: isMobile ? 8 : 15, 
          font: { size: isMobile ? 9 : 11, weight: '600' } 
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
  const visibleChartsCount = Object.values(visibleCharts).filter(Boolean).length;

  // Verificar permisos
  if (!hasPermission('canViewReports')) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        paddingTop: '120px', 
        paddingBottom: '40px', 
        paddingX: { xs: 2, sm: 3, md: 4 }, 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper sx={{ 
          padding: 4, 
          borderRadius: '16px', 
          background: 'white', 
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          textAlign: 'center',
          maxWidth: 400
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: alpha('#EF4444', 0.1), 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2rem', 
            color: '#EF4444' 
          }}>
            <EyeSlash size={32} weight="duotone" />
          </Box>
          <Typography variant="h5" sx={{ color: '#010326', mb: 2, fontWeight: 600 }}>
            Acceso Restringido
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
            No tienes permisos para ver esta página. Solo administradores y gerentes pueden acceder a los reportes.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      paddingTop: '120px', 
      paddingBottom: '40px', 
      paddingX: { xs: 2, sm: 3, md: 4 }, 
      backgroundColor: '#ffffff' 
    }}>
      
      {/* Header */}
      <AnalyticsHeader sx={{ mb: 4 }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ChartLine size={24} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  marginBottom: 1, 
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  background: 'linear-gradient(45deg, #ffffff 30%, rgba(255, 255, 255, 0.8) 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                  Panel de estadísticas - {visibleChartsCount} gráfica{visibleChartsCount !== 1 ? 's' : ''} activa{visibleChartsCount !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.7, mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                  <Clock size={14} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Button 
              variant="outlined" 
              startIcon={<Gear size={18} />} 
              onClick={() => setChartSettingsOpen(true)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Configurar
            </Button>
          </Box>
        </Box>
      </AnalyticsHeader>

      {/* Cards de estadísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, marginBottom: 4 }}>
        {getDashboardStats().map((stat) => (
          <DashboardStatCard key={stat.id} variant={stat.variant}>
            <DashboardStatHeader>
              <Box sx={{ flex: 1 }}>
                <DashboardStatValue variant={stat.variant}>{stat.value}</DashboardStatValue>
                <DashboardStatLabel variant={stat.variant}>{stat.title}</DashboardStatLabel>
              </Box>
              <DashboardStatIconContainer variant={stat.variant}>
                <stat.icon size={20} weight="duotone" />
              </DashboardStatIconContainer>
            </DashboardStatHeader>
            <DashboardStatChange variant={stat.variant} trend={stat.trend}>
              <TrendUp size={11} weight="bold" />
              <DashboardStatTrendText variant={stat.variant} trend={stat.trend}>{stat.change}</DashboardStatTrendText>
            </DashboardStatChange>
          </DashboardStatCard>
        ))}
      </Box>

      {/* Sección de gráficas */}
      <Paper sx={{ 
        padding: { xs: 2, sm: 3, md: 4 }, 
        marginBottom: 4, 
        borderRadius: '16px', 
        background: 'white', 
        border: `1px solid ${alpha('#1F64BF', 0.08)}`, 
        boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)', 
        transition: 'all 0.3s ease', 
        '&:hover': { 
          boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', 
          transform: 'translateY(-1px)' 
        } 
      }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ padding: 1, borderRadius: '8px', backgroundColor: alpha('#1F64BF', 0.1), color: '#1F64BF' }}>
              <ChartLine size={20} weight="duotone" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: { xs: '1rem', md: '1.1rem' } }}>
              {isMobile ? 'Analíticas' : 'Analíticas Dinámicas'}
            </Typography>
            <Chip label={`${visibleChartsCount} activa${visibleChartsCount !== 1 ? 's' : ''}`} size="small" sx={{ background: colors.accent, color: '#fff', fontWeight: 600, fontSize: '0.7rem', height: '24px' }} />
          </Box>
          <Tooltip title="Configurar gráficas">
            <IconButton onClick={() => setChartSettingsOpen(true)} size="small" sx={{ color: colors.primary, '&:hover': { backgroundColor: alpha(colors.primary, 0.1) } }}>
              <Gear size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        {visibleChartsCount === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 8 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: alpha('#1F64BF', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#1F64BF' }}>
              <EyeSlash size={32} weight="duotone" />
            </Box>
            <Typography variant="h6" sx={{ color: colors.dark, mb: 1 }}>No hay gráficas seleccionadas</Typography>
            <Typography variant="body2" sx={{ color: colors.gray, mb: 2 }}>Selecciona al menos una gráfica para visualizar los datos</Typography>
            <Button variant="contained" startIcon={<Gear size={16} />} onClick={() => setChartSettingsOpen(true)} sx={{ backgroundColor: colors.primary, borderRadius: '12px', textTransform: 'none', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)', transition: 'left 0.5s ease' }, '&:hover': { backgroundColor: colors.secondary, '&::before': { left: '100%' } } }}>
              Configurar Gráficas
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
            {visibleCharts.products_overview && (
              <Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Package size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Productos</Typography>
                </Box>
                <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
                  <Doughnut data={{ labels: ['Activos', 'Inactivos'], datasets: [{ data: [mockData.products.active, mockData.products.inactive], backgroundColor: [colors.primary, colors.gray], borderWidth: 0 }] }} options={getChartOptions()} />
                </Box>
              </Paper>
            )}
            
            {visibleCharts.user_stats && (
              <Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Users size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Usuarios</Typography>
                </Box>
                <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
                  <Bar data={{ labels: ['Activos', 'Inactivos', 'Admins', 'Premium', 'Clientes'], datasets: [{ label: 'Usuarios', data: [mockData.users.active, mockData.users.inactive, mockData.users.admins, mockData.users.premium, mockData.users.customers], backgroundColor: [colors.primary, colors.gray, colors.accent, colors.secondary, alpha(colors.primary, 0.6)], borderRadius: 6 }] }} options={getChartOptions()} />
                </Box>
              </Paper>
            )}
            
            {visibleCharts.employee_distribution && (
              <Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <User size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Empleados</Typography>
                </Box>
                <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
                  <Pie data={{ labels: ['Admins', 'Gerentes', 'Empleados', 'Delivery'], datasets: [{ data: [mockData.employees.roles.admins, mockData.employees.roles.managers, mockData.employees.roles.employees, mockData.employees.roles.delivery], backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.dark] }] }} options={getChartOptions()} />
                </Box>
              </Paper>
            )}
            
            {visibleCharts.design_status && (
              <Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ChartPie size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Diseños</Typography>
                </Box>
                <Box sx={{ height: '280px', position: 'relative', flex: 1 }}>
                  <PolarArea data={{ labels: ['Pendientes', 'Cotizados', 'Aprobados', 'Rechazados', 'Completados', 'Borradores'], datasets: [{ data: [mockData.designs.pending, mockData.designs.quoted, mockData.designs.approved, mockData.designs.rejected, mockData.designs.completed, mockData.designs.drafts], backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.gray, colors.dark, alpha(colors.primary, 0.4)] }] }} options={getChartOptions()} />
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Paper>

      {/* Modal de configuración */}
      <Dialog open={chartSettingsOpen} onClose={() => setChartSettingsOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
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
            <Typography variant="h6" sx={{ mb: 2 }}>Gráficas Visibles</Typography>
            {Object.values(CHART_TYPES).map((chart) => (
              <FormControlLabel 
                key={chart.id} 
                control={
                  <Switch 
                    checked={visibleCharts[chart.id]} 
                    onChange={(e) => setVisibleCharts(prev => ({ ...prev, [chart.id]: e.target.checked }))} 
                    color="primary" 
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <chart.icon size={20} />
                    <Box>
                      <Typography variant="body1">{chart.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{chart.description}</Typography>
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
              <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                <InputLabel>Intervalo</InputLabel>
                <Select value={refreshInterval} label="Intervalo" onChange={(e) => setRefreshInterval(e.target.value)}>
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
          <Button onClick={() => setChartSettingsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsDashboard;
