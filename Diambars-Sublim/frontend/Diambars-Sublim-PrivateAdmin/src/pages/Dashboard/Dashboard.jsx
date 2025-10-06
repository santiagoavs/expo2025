import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Chip, Paper, alpha, Divider, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Switch, FormControlLabel, useTheme, useMediaQuery } from '@mui/material';
import { ChartLine, Package, Users, TrendUp, Clock, ArrowRight, User, Coffee, Lightning, Target, Gear, EyeSlash, ChartPie, X } from '@phosphor-icons/react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Doughnut, Bar, Pie, PolarArea } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, ArcElement, Filler);

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

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleCharts, setVisibleCharts] = useState({ products_overview: true, user_stats: true, employee_distribution: true, design_status: false });
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const colors = { primary: '#1F64BF', secondary: '#032CA6', accent: '#040DBF', dark: '#010326', gray: '#64748b' };

  const getChartOptions = () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: isMobile ? 8 : 15, font: { size: isMobile ? 9 : 11, weight: '600' } } } } });

  const getDashboardStats = () => [
    { id: 'products', title: 'Total Productos', value: mockData.products.total.toString(), change: `${Math.round((mockData.products.active/mockData.products.total)*100)}% activos`, icon: Package, gradient: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)' },
    { id: 'users', title: 'Usuarios Totales', value: mockData.users.total.toString(), change: `${mockData.users.active} activos`, icon: Users, color: '#10b981' },
    { id: 'employees', title: 'Personal Activo', value: mockData.employees.active.toString(), change: `${mockData.employees.total} total`, icon: User, color: '#f59e0b' },
    { id: 'designs', title: 'Diseños Pendientes', value: mockData.designs.pending.toString(), change: `${mockData.designs.total} total`, icon: ChartLine, color: '#ef4444' }
  ];

  const formatTime = (date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const getGreeting = () => { const hour = currentTime.getHours(); if (hour < 12) return 'Buenos días'; if (hour < 18) return 'Buenas tardes'; return 'Buenas noches'; };
  const visibleChartsCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <Box sx={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '40px', paddingX: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#ffffff' }}>
      <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header */}
        <Paper sx={{ padding: { xs: 3, md: 5 }, marginBottom: 4, borderRadius: '16px', background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)', color: '#FFFFFF', boxShadow: '0 4px 24px rgba(31, 100, 191, 0.25)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={24} weight="duotone" /></Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, marginBottom: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>{getGreeting()} Administrador</Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>Panel de control - {visibleChartsCount} gráfica{visibleChartsCount !== 1 ? 's' : ''} activa{visibleChartsCount !== 1 ? 's' : ''}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8, mt: 1 }}><Clock size={14} /><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{formatTime(currentTime)}</Typography></Box>
              </Box>
            </Box>
            
            {/* Botón con efecto shimmer */}
            <Button variant="outlined" startIcon={<Gear size={18} />} onClick={() => setChartSettingsOpen(true)}
              sx={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '16px', padding: '12px 24px', textTransform: 'none', fontWeight: 600, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', transition: 'left 0.5s ease' }, '&:hover': { background: 'rgba(255, 255, 255, 0.25)', borderColor: 'rgba(255, 255, 255, 0.6)', '&::before': { left: '100%' } } }}>
              {isMobile ? 'Configurar' : 'Configurar Gráficas'}
            </Button>
          </Box>
        </Paper>

        {/* Cards de estadísticas - hover disminuido */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, marginBottom: 4 }}>
          {getDashboardStats().map((stat) => (
            <Paper key={stat.id} sx={{ padding: 3, borderRadius: '16px', background: stat.gradient || 'white', color: stat.gradient ? 'white' : '#010326', border: stat.gradient ? 'none' : `1px solid ${alpha('#1F64BF', 0.08)}`, cursor: 'pointer', boxShadow: stat.gradient ? '0 4px 20px rgba(31, 100, 191, 0.25)' : '0 2px 16px rgba(1, 3, 38, 0.06)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: stat.gradient ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)' : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)', transition: 'left 0.5s ease', zIndex: 1 }, '&::after': stat.gradient ? { content: '""', position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', transform: 'translate(20px, -20px)', zIndex: 0 } : {}, '& > *': { position: 'relative', zIndex: 2 }, '&:hover': { transform: 'translateY(-2px)', boxShadow: stat.gradient ? '0 8px 28px rgba(31, 100, 191, 0.3), 0 0 12px rgba(31, 100, 191, 0.15)' : '0 8px 24px rgba(1, 3, 38, 0.1), 0 0 12px rgba(31, 100, 191, 0.08)', '&::before': { left: '100%' } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>{stat.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>{stat.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '4px 8px', borderRadius: '6px', background: stat.gradient ? 'rgba(255, 255, 255, 0.15)' : alpha(stat.color, 0.1), width: 'fit-content' }}><TrendUp size={12} weight="bold" /><Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{stat.change}</Typography></Box>
                </Box>
                <Box sx={{ backgroundColor: stat.gradient ? 'rgba(255, 255, 255, 0.2)' : alpha(stat.color, 0.1), borderRadius: '12px', padding: 1.5, color: stat.gradient ? 'white' : stat.color }}><stat.icon size={32} weight="duotone" /></Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Cards con hover sutil */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, marginBottom: 4 }}>
          <Paper sx={{ padding: 3, borderRadius: '16px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: alpha('#1F64BF', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F64BF' }}><Target size={20} weight="duotone" /></Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326' }}>Estado del Sistema</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>Servicios Operativos</Typography><Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600 }}>4/4</Typography></Box>
              <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, backgroundColor: alpha(colors.accent, 0.1), '& .MuiLinearProgress-bar': { backgroundColor: colors.accent, borderRadius: 3 } }} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: alpha(colors.accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}><Lightning size={18} weight="duotone" /></Box>
              <Box sx={{ flex: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark }}>Productos más Populares</Typography><Typography variant="body2" sx={{ color: colors.gray, fontSize: '0.75rem' }}>Camiseta Básica</Typography></Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: alpha(colors.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}><Coffee size={18} weight="duotone" /></Box>
              <Box sx={{ flex: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.dark }}>Última Actualización</Typography><Typography variant="body2" sx={{ color: colors.gray, fontSize: '0.75rem' }}>{formatTime(currentTime)}</Typography></Box>
            </Box>
          </Paper>

          <Paper sx={{ padding: 3, borderRadius: '16px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: alpha('#1F64BF', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F64BF' }}><ChartLine size={20} weight="duotone" /></Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326' }}>Control de Gráficas</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              
              {/* Botones con efecto shimmer */}
              <Button variant="outlined" startIcon={<Gear size={16} />} onClick={() => setChartSettingsOpen(true)} fullWidth sx={{ borderColor: colors.primary, color: colors.primary, borderRadius: '12px', padding: '12px 16px', textTransform: 'none', fontWeight: 600, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)', transition: 'left 0.5s ease' }, '&:hover': { borderColor: colors.secondary, backgroundColor: alpha(colors.primary, 0.05), '&::before': { left: '100%' } } }}>Configurar Gráficas</Button>
              
              <Button variant="outlined" startIcon={<ArrowRight size={16} />} fullWidth sx={{ borderColor: colors.secondary, color: colors.secondary, borderRadius: '12px', padding: '12px 16px', textTransform: 'none', fontWeight: 600, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(3, 44, 166, 0.15), transparent)', transition: 'left 0.5s ease' }, '&:hover': { borderColor: colors.accent, backgroundColor: alpha(colors.secondary, 0.05), '&::before': { left: '100%' } } }}>Actualizar Datos</Button>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>Gráficas Activas</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Object.entries(CHART_TYPES).filter(([id]) => visibleCharts[id]).map(([id, chart]) => (<Chip key={id} icon={<chart.icon size={14} />} label={chart.name} size="small" sx={{ background: alpha(colors.primary, 0.1), color: colors.primary, fontWeight: 600, fontSize: '0.7rem', height: '24px' }} />))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Sección de gráficas con hover sutil */}
        <Paper sx={{ padding: { xs: 2, sm: 3, md: 4 }, marginBottom: 4, borderRadius: '16px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, marginBottom: 3, padding: 2, background: '#f8fafc', borderRadius: '12px', border: `1px solid ${alpha('#1F64BF', 0.1)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ padding: 1, borderRadius: '8px', backgroundColor: alpha('#1F64BF', 0.1), color: '#1F64BF' }}><ChartLine size={20} weight="duotone" /></Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: { xs: '1rem', md: '1.1rem' } }}>{isMobile ? 'Analíticas' : 'Analíticas Dinámicas'}</Typography>
              <Chip label={`${visibleChartsCount} activa${visibleChartsCount !== 1 ? 's' : ''}`} size="small" sx={{ background: colors.accent, color: '#fff', fontWeight: 600, fontSize: '0.7rem', height: '24px' }} />
            </Box>
            <Tooltip title="Configurar gráficas"><IconButton onClick={() => setChartSettingsOpen(true)} size="small" sx={{ color: colors.primary, '&:hover': { backgroundColor: alpha(colors.primary, 0.1) } }}><Gear size={18} /></IconButton></Tooltip>
          </Box>

          {visibleChartsCount === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 8 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: alpha('#1F64BF', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#1F64BF' }}><EyeSlash size={32} weight="duotone" /></Box>
              <Typography variant="h6" sx={{ color: colors.dark, mb: 1 }}>No hay gráficas seleccionadas</Typography>
              <Typography variant="body2" sx={{ color: colors.gray, mb: 2 }}>Selecciona al menos una gráfica para visualizar los datos</Typography>
              
              {/* Botón con efecto shimmer */}
              <Button variant="contained" startIcon={<Gear size={16} />} onClick={() => setChartSettingsOpen(true)} sx={{ backgroundColor: colors.primary, borderRadius: '12px', textTransform: 'none', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)', transition: 'left 0.5s ease' }, '&:hover': { backgroundColor: colors.secondary, '&::before': { left: '100%' } } }}>Configurar Gráficas</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
              {/* Cards de gráficas con hover sutil */}
              {visibleCharts.products_overview && (<Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><Package size={18} /><Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Productos</Typography></Box><Box sx={{ height: '280px', position: 'relative', flex: 1 }}><Doughnut data={{ labels: ['Activos', 'Inactivos'], datasets: [{ data: [mockData.products.active, mockData.products.inactive], backgroundColor: [colors.primary, colors.gray], borderWidth: 0 }] }} options={getChartOptions()} /></Box></Paper>)}
              
              {visibleCharts.user_stats && (<Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><Users size={18} /><Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Usuarios</Typography></Box><Box sx={{ height: '280px', position: 'relative', flex: 1 }}><Bar data={{ labels: ['Activos', 'Inactivos', 'Admins', 'Premium', 'Clientes'], datasets: [{ label: 'Usuarios', data: [mockData.users.active, mockData.users.inactive, mockData.users.admins, mockData.users.premium, mockData.users.customers], backgroundColor: [colors.primary, colors.gray, colors.accent, colors.secondary, alpha(colors.primary, 0.6)], borderRadius: 6 }] }} options={getChartOptions()} /></Box></Paper>)}
              
              {visibleCharts.employee_distribution && (<Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><User size={18} /><Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Empleados</Typography></Box><Box sx={{ height: '280px', position: 'relative', flex: 1 }}><Pie data={{ labels: ['Admins', 'Gerentes', 'Empleados', 'Delivery', 'Producción'], datasets: [{ data: [mockData.employees.roles.admins, mockData.employees.roles.managers, mockData.employees.roles.employees, mockData.employees.roles.delivery, mockData.employees.roles.production], backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.dark, alpha(colors.primary, 0.6)] }] }} options={getChartOptions()} /></Box></Paper>)}
              
              {visibleCharts.design_status && (<Paper sx={{ padding: 3, borderRadius: '12px', background: 'white', border: `1px solid ${alpha('#1F64BF', 0.08)}`, boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)', height: { xs: '350px', sm: '380px', md: '420px' }, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)', transform: 'translateY(-1px)' } }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><ChartPie size={18} /><Typography variant="h6" sx={{ fontWeight: 600, color: colors.dark, fontSize: '0.9rem' }}>Diseños</Typography></Box><Box sx={{ height: '280px', position: 'relative', flex: 1 }}><PolarArea data={{ labels: ['Pendientes', 'Cotizados', 'Aprobados', 'Rechazados', 'Completados', 'Borradores'], datasets: [{ data: [mockData.designs.pending, mockData.designs.quoted, mockData.designs.approved, mockData.designs.rejected, mockData.designs.completed, mockData.designs.drafts], backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.gray, colors.dark, alpha(colors.primary, 0.4)] }] }} options={getChartOptions()} /></Box></Paper>)}
            </Box>
          )}
        </Paper>

        {/* Modal */}
        <Dialog open={chartSettingsOpen} onClose={() => setChartSettingsOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Gear size={24} />Configuración de Gráficas<Box sx={{ flex: 1 }} /><IconButton onClick={() => setChartSettingsOpen(false)}><X size={20} /></IconButton></DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Gráficas Visibles</Typography>{Object.values(CHART_TYPES).map((chart) => (<FormControlLabel key={chart.id} control={<Switch checked={visibleCharts[chart.id]} onChange={(e) => setVisibleCharts(prev => ({ ...prev, [chart.id]: e.target.checked }))} color="primary" />} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><chart.icon size={20} /><Box><Typography variant="body1">{chart.name}</Typography><Typography variant="caption" color="text.secondary">{chart.description}</Typography></Box></Box>} sx={{ width: '100%', mb: 1 }} />))}</Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 3 }}><FormControlLabel control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} color="primary" />} label="Actualización Automática" sx={{ mb: 2 }} />{autoRefresh && (<FormControl size="small" sx={{ minWidth: 120, width: '100%' }}><InputLabel>Intervalo</InputLabel><Select value={refreshInterval} label="Intervalo" onChange={(e) => setRefreshInterval(e.target.value)}><MenuItem value={15}>15 segundos</MenuItem><MenuItem value={30}>30 segundos</MenuItem><MenuItem value={60}>1 minuto</MenuItem><MenuItem value={300}>5 minutos</MenuItem></Select></FormControl>)}</Box>
          </DialogContent>
          <DialogActions><Button onClick={() => setChartSettingsOpen(false)}>Cerrar</Button></DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Dashboard;