// src/pages/ReportsPage/ReportsPage.jsx - Página de reportes con gráficas en posición original
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  styled,
  useTheme,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Chip,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  ChartBar,
  TrendUp,
  Users,
  Package,
  Clock,
  Download,
  ChartLine,
  ChartPie,
  Target,
  Lightning,
  Coffee,
  Gear,
  ArrowRight,
  EyeSlash
} from '@phosphor-icons/react';
import { Line, Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
import { 
  useDashboardStats, 
  useSalesReport, 
  useTopProductsReport, 
  useTopCustomersReport, 
  useProductionReport,
  useReportExport
} from '../../hooks/useReports';
import ChartErrorBoundary from '../../components/ChartErrorBoundary/ChartErrorBoundary';

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
  Filler
);

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '1500';
    }
  }
});

// ================ ESTILOS COMPLETAMENTE ACORDES AL DASHBOARD ================
const ReportsPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const ReportsContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1400px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1200px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '110px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '100px',
    paddingLeft: '16px',
    paddingRight: '16px',
  }
}));

const ReportsModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

// Header Principal - Igual al Dashboard
const ReportsHeaderSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: '#FFFFFF',
  boxShadow: '0 4px 24px rgba(31, 100, 191, 0.25)',
  border: 'none',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '32px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const ReportsHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '32px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '24px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const ReportsHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
  }
}));

const ReportsMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700 !important',
  color: '#FFFFFF',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
    textAlign: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const ReportsMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: '500 !important',
  lineHeight: 1.6,
  textAlign: 'left',
  maxWidth: '600px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    textAlign: 'center',
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const ReportsHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    width: '100%',
    gap: '10px',
    '& > *': {
      flex: 1,
    }
  }
}));

// Botones con efecto shimmer - Iguales al Dashboard
const ReportsPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '16px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: '160px',
  whiteSpace: 'nowrap',
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
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: '140px',
    padding: '12px 24px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    flex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 20px',
    fontSize: '0.85rem',
  }
}));

const ReportsSecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
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
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('md')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
  }
}));

// GRID DE ESTADÍSTICAS - Igual al Dashboard
const ReportsStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(4, 1fr)',
  marginBottom: '32px',
  [theme.breakpoints.down(1400)]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  }
}));

const ReportsStatCard = styled(ReportsModernCard)(({ theme, variant }) => {
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
    padding: '28px',
    width: '100%',
    minHeight: '160px',
    maxHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'pointer',
    boxShadow: variant === 'primary' ? '0 4px 20px rgba(31, 100, 191, 0.25)' : '0 2px 16px rgba(1, 3, 38, 0.06)',
    ...selectedVariant,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: variant === 'primary' 
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
      transition: 'left 0.5s ease',
      zIndex: 1
    },
    '&::after': variant === 'primary' ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '70px',
      height: '70px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(20px, -20px)',
      zIndex: 0
    } : {},
    '& > *': { position: 'relative', zIndex: 2 },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: variant === 'primary' 
        ? '0 8px 28px rgba(31, 100, 191, 0.3), 0 0 12px rgba(31, 100, 191, 0.15)'
        : '0 8px 24px rgba(1, 3, 38, 0.1), 0 0 12px rgba(31, 100, 191, 0.08)',
      '&::before': { left: '100%' }
    },
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
      minHeight: '150px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '20px',
      minHeight: '140px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '18px',
      minHeight: '130px',
    }
  };
});

const ReportsStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const ReportsStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant === 'primary' ? 'white' : '#1F64BF',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
  },
  [theme.breakpoints.down('md')]: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
  }
}));

const ReportsStatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '6px',
  color: variant === 'primary' ? 'white' : '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const ReportsStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
  opacity: variant === 'primary' ? 0.9 : 0.7,
  color: variant === 'primary' ? 'white' : '#032CA6',
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const ReportsStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: 'auto',
  padding: '6px 10px',
  borderRadius: '8px',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : trend === 'up' 
      ? alpha('#10B981', 0.1) 
      : alpha('#EF4444', 0.1),
  width: 'fit-content',
}));

const ReportsStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: variant === 'primary' 
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

// Sección de Control - Igual al Dashboard
const ReportsControlSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
  gap: '24px',
  marginBottom: '32px',
  [theme.breakpoints.down('md')]: {
    gap: '20px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
    marginBottom: '20px',
  }
}));

const ControlCard = styled(ReportsModernCard)(({ theme }) => ({
  padding: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('lg')]: {
    padding: '28px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

// Botones de control con efecto shimmer
const ControlButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  
  return {
    border: isPrimary ? 'none' : `1px solid ${alpha('#032CA6', 0.3)}`,
    background: isPrimary 
      ? 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)' 
      : 'transparent',
    color: isPrimary ? 'white' : '#032CA6',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    boxShadow: isPrimary ? '0 4px 16px rgba(31, 100, 191, 0.24)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: isPrimary
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(3, 44, 166, 0.15), transparent)',
      transition: 'left 0.5s ease'
    },
    '&:hover': {
      background: isPrimary 
        ? 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)' 
        : alpha('#032CA6', 0.05),
      boxShadow: isPrimary ? '0 6px 24px rgba(31, 100, 191, 0.32)' : 'none',
      transform: 'translateY(-1px)',
      borderColor: isPrimary ? 'none' : alpha('#032CA6', 0.5),
      '&::before': { left: '100%' }
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  };
});

// Sección de Gráficas Principal - POSICIÓN ORIGINAL DE GRÁFICAS
const ReportsChartsSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: { xs: '24px', sm: '32px', md: '40px' },
  marginBottom: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '20px',
  }
}));

const ChartsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '32px',
  padding: '20px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    marginBottom: '24px',
    padding: '16px',
  }
}));

// Cards de Gráficas Individuales - POSICIÓN ORIGINAL
const ChartCard = styled(ReportsModernCard)(({ theme }) => ({
  padding: '24px',
  borderRadius: '12px',
  background: 'white',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

// Tabs personalizados
const ReportsTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    fontFamily: "'Mona Sans'",
    minHeight: '48px',
    color: '#64748b',
    '&.Mui-selected': {
      color: '#1F64BF',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#1F64BF',
    height: '3px',
    borderRadius: '2px',
  },
}));

const ReportsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hooks de reportes
  const { data: dashboardStats, loading: dashboardLoading, error: dashboardError } = useDashboardStats();
  const { data: salesData, loading: salesLoading, error: salesError } = useSalesReport();
  const { data: productsData, loading: productsLoading, error: productsError } = useTopProductsReport();
  const { data: customersData, loading: customersLoading, error: customersError } = useTopCustomersReport();
  const { data: productionData, loading: productionLoading, error: productionError } = useProductionReport();
  const { exportReport } = useReportExport();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const getGreeting = () => { 
    const hour = currentTime.getHours(); 
    if (hour < 12) return 'Buenos días'; 
    if (hour < 18) return 'Buenas tardes'; 
    return 'Buenas noches'; 
  };

  // Función para manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Función para exportar reportes
  const handleExport = async (tabIndex, format) => {
    setExportLoading(true);
    try {
      const reportTypes = ['dashboard', 'sales', 'products', 'customers', 'production'];
      const reportType = reportTypes[tabIndex];
      await exportReport(reportType, format);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!dashboardStats) return { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 };
    
    const todayData = dashboardStats.today || {};
    const monthData = dashboardStats.thisMonth || {};
    const totalCustomers = customersData?.customerStatistics?.totalCustomers || 0;
    const totalProducts = productsData?.topProductsByQuantity?.length || 0;
    
    return {
      totalRevenue: monthData.totalRevenue || todayData.totalRevenue || 0,
      totalOrders: monthData.totalOrders || todayData.totalOrders || 0,
      totalCustomers: totalCustomers,
      totalProducts: totalProducts
    };
  }, [dashboardStats, customersData, productsData]);

  // Función para validar y formatear datos de gráficos
  const getValidChartData = (data, type = 'bar') => {
    if (data && data.datasets && Array.isArray(data.datasets)) {
      return data;
    }
    
    if (data && (data.topProductsByQuantity || data.topCustomers || data.salesByPeriod)) {
      if (type === 'pie' || type === 'doughnut') {
        if (data.topProductsByQuantity && Array.isArray(data.topProductsByQuantity)) {
          return {
            labels: data.topProductsByQuantity.map(item => item.productName || 'Producto'),
            datasets: [{
              data: data.topProductsByQuantity.map(item => item.totalQuantity || 0),
              backgroundColor: data.topProductsByQuantity.map((_, index) => 
                `hsl(${(index * 137.5) % 360}, 70%, 50%)`
              ),
              borderColor: data.topProductsByQuantity.map((_, index) => 
                `hsl(${(index * 137.5) % 360}, 70%, 30%)`
              ),
              borderWidth: 1
            }]
          };
        }
      } else {
        if (data.topProductsByQuantity && Array.isArray(data.topProductsByQuantity)) {
          return {
            labels: data.topProductsByQuantity.map(item => item.productName || 'Producto'),
            datasets: [{
              label: 'Cantidad Vendida',
              data: data.topProductsByQuantity.map(item => item.totalQuantity || 0),
              backgroundColor: 'rgba(31, 100, 191, 0.1)',
              borderColor: '#1F64BF',
              borderWidth: 2
            }]
          };
        }
        
        if (data.topCustomers && Array.isArray(data.topCustomers)) {
          return {
            labels: data.topCustomers.map(item => item.userName || 'Cliente'),
            datasets: [{
              label: 'Total Gastado',
              data: data.topCustomers.map(item => item.totalSpent || 0),
              backgroundColor: 'rgba(31, 100, 191, 0.1)',
              borderColor: '#1F64BF',
              borderWidth: 2
            }]
          };
        }
        
        if (data.salesByPeriod && Array.isArray(data.salesByPeriod)) {
          return {
            labels: data.salesByPeriod.map(item => {
              const date = new Date(item._id);
              return date.toLocaleDateString('es-CO', { 
                month: 'short', 
                day: 'numeric' 
              });
            }),
            datasets: [
              {
                label: 'Ventas',
                data: data.salesByPeriod.map(item => item.totalRevenue || 0),
                backgroundColor: 'rgba(31, 100, 191, 0.1)',
                borderColor: '#1F64BF',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }
            ]
          };
        }
      }
    }
    
    // Datos por defecto
    const defaultData = {
      labels: ['Sin datos'],
      datasets: [{
        label: 'Sin datos',
        data: [0],
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        borderColor: 'rgba(128, 128, 128, 1)',
        borderWidth: 1
      }]
    };
    
    if (type === 'pie' || type === 'doughnut') {
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(128, 128, 128, 0.2)'],
          borderColor: ['rgba(128, 128, 128, 1)'],
          borderWidth: 1
        }]
      };
    }
    
    return defaultData;
  };

  // Opciones de gráficos consistentes
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
          font: { 
            size: isMobile ? 9 : 11, 
            weight: '600' 
          } 
        } 
      } 
    } 
  });

  if (dashboardLoading) {
    return (
      <ReportsPageContainer>
        <ReportsContentWrapper>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh', 
            gap: '24px' 
          }}>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography variant="body1" sx={{ 
              color: '#010326', 
              fontWeight: 600, 
              fontFamily: "'Mona Sans'" 
            }}>
              Cargando reportes...
            </Typography>
          </Box>
        </ReportsContentWrapper>
      </ReportsPageContainer>
    );
  }

  return (
    <ReportsPageContainer>
      <ReportsContentWrapper>
        {/* HEADER PRINCIPAL - Igual al Dashboard */}
        <ReportsHeaderSection>
          <ReportsHeaderContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
              <Box sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: '16px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ChartBar size={24} weight="duotone" />
              </Box>
              <Box>
                <ReportsMainTitle>
                  {getGreeting()} Administrador
                </ReportsMainTitle>
                <ReportsMainDescription>
                  Panel de reportes y análisis - 5 categorías disponibles
                </ReportsMainDescription>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8, mt: 1 }}>
                  <Clock size={14} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <ReportsHeaderActions>
              <ReportsPrimaryActionButton
                startIcon={<Download size={18} weight="bold" />}
                onClick={() => handleExport(activeTab, 'excel')}
                disabled={exportLoading}
              >
                {isMobile ? 'Exportar' : 'Exportar Excel'}
              </ReportsPrimaryActionButton>
              
              <ReportsSecondaryActionButton
                onClick={() => handleExport(activeTab, 'pdf')}
                title="Exportar PDF"
                disabled={exportLoading}
              >
                <Download size={20} weight="bold" />
              </ReportsSecondaryActionButton>
            </ReportsHeaderActions>
          </ReportsHeaderContent>
        </ReportsHeaderSection>

        {/* ESTADÍSTICAS PRINCIPALES */}
        <ReportsStatsGrid>
          <ReportsStatCard variant="primary">
            <ReportsStatHeader>
              <Box>
                <ReportsStatValue variant="primary">
                  {formatCurrency(stats.totalRevenue)}
                </ReportsStatValue>
                <ReportsStatLabel variant="primary">
                  Ingresos Totales
                </ReportsStatLabel>
              </Box>
              <ReportsStatIconContainer variant="primary">
                <TrendUp size={24} weight="duotone" />
              </ReportsStatIconContainer>
            </ReportsStatHeader>
            <ReportsStatChange variant="primary" trend="up">
              <TrendUp size={14} weight="bold" />
              <ReportsStatTrendText variant="primary" trend="up">
                +12% este mes
              </ReportsStatTrendText>
            </ReportsStatChange>
          </ReportsStatCard>

          <ReportsStatCard>
            <ReportsStatHeader>
              <Box>
                <ReportsStatValue>
                  {stats.totalOrders}
                </ReportsStatValue>
                <ReportsStatLabel>
                  Total de Órdenes
                </ReportsStatLabel>
              </Box>
              <ReportsStatIconContainer>
                <ChartBar size={24} weight="duotone" />
              </ReportsStatIconContainer>
            </ReportsStatHeader>
            <ReportsStatChange trend="up">
              <TrendUp size={14} weight="bold" />
              <ReportsStatTrendText trend="up">
                +8% este mes
              </ReportsStatTrendText>
            </ReportsStatChange>
          </ReportsStatCard>

          <ReportsStatCard>
            <ReportsStatHeader>
              <Box>
                <ReportsStatValue>
                  {stats.totalCustomers}
                </ReportsStatValue>
                <ReportsStatLabel>
                  Clientes Activos
                </ReportsStatLabel>
              </Box>
              <ReportsStatIconContainer>
                <Users size={24} weight="duotone" />
              </ReportsStatIconContainer>
            </ReportsStatHeader>
            <ReportsStatChange trend="up">
              <TrendUp size={14} weight="bold" />
              <ReportsStatTrendText trend="up">
                +15% este mes
              </ReportsStatTrendText>
            </ReportsStatChange>
          </ReportsStatCard>

          <ReportsStatCard>
            <ReportsStatHeader>
              <Box>
                <ReportsStatValue>
                  {stats.totalProducts}
                </ReportsStatValue>
                <ReportsStatLabel>
                  Productos Vendidos
                </ReportsStatLabel>
              </Box>
              <ReportsStatIconContainer>
                <Package size={24} weight="duotone" />
              </ReportsStatIconContainer>
            </ReportsStatHeader>
            <ReportsStatChange trend="up">
              <TrendUp size={14} weight="bold" />
              <ReportsStatTrendText trend="up">
                +22% este mes
              </ReportsStatTrendText>
            </ReportsStatChange>
          </ReportsStatCard>
        </ReportsStatsGrid>

        {/* SECCIÓN DE CONTROL */}
        <ReportsControlSection>
          <ControlCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326' }}>
                Estado del Sistema de Reportes
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Servicios de Datos</Typography>
                <Typography variant="body2" sx={{ color: '#1F64BF', fontWeight: 600 }}>5/5</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: alpha('#1F64BF', 0.1),
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: '#1F64BF', 
                    borderRadius: 3 
                  } 
                }} 
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '8px', 
                background: alpha('#1F64BF', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1F64BF' 
              }}>
                <Lightning size={18} weight="duotone" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#010326' }}>
                  Reporte Más Solicitado
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Ventas por Mes
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '8px', 
                background: alpha('#10B981', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#10B981' 
              }}>
                <Coffee size={18} weight="duotone" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#010326' }}>
                  Última Actualización
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {formatTime(currentTime)}
                </Typography>
              </Box>
            </Box>
          </ControlCard>

          <ControlCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326' }}>
                Control de Reportes
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ControlButton
                variant="primary"
                startIcon={<Download size={16} weight="bold" />}
                onClick={() => handleExport(activeTab, 'excel')}
                disabled={exportLoading}
              >
                Exportar Reporte Actual
              </ControlButton>
              
              <ControlButton
                variant="secondary"
                startIcon={<ArrowRight size={16} weight="bold" />}
              >
                Actualizar Datos
              </ControlButton>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                  Categorías Disponibles
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {['Dashboard', 'Ventas', 'Productos', 'Clientes', 'Producción'].map((category) => (
                    <Chip 
                      key={category}
                      label={category} 
                      size="small" 
                      sx={{ 
                        background: alpha('#1F64BF', 0.1), 
                        color: '#1F64BF', 
                        fontWeight: 600, 
                        fontSize: '0.7rem', 
                        height: '24px' 
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </ControlCard>
        </ReportsControlSection>

        {/* SECCIÓN PRINCIPAL DE GRÁFICAS - POSICIÓN ORIGINAL */}
        <ReportsChartsSection>
          <ChartsHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                padding: 1, 
                borderRadius: '8px', 
                backgroundColor: alpha('#1F64BF', 0.1), 
                color: '#1F64BF' 
              }}>
                <ChartLine size={20} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  Reportes Analíticos
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Visualización interactiva de datos y métricas
                </Typography>
              </Box>
              <Chip 
                label="5 categorías" 
                size="small" 
                sx={{ 
                  background: '#1F64BF', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: '0.7rem', 
                  height: '24px' 
                }} 
              />
            </Box>
            
            <Tooltip title="Opciones de exportación">
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#1F64BF', 
                  '&:hover': { backgroundColor: alpha('#1F64BF', 0.1) } 
                }}
              >
                <Gear size={18} />
              </IconButton>
            </Tooltip>
          </ChartsHeader>

          {/* TABS DE NAVEGACIÓN */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <ReportsTabs value={activeTab} onChange={handleTabChange} aria-label="report tabs">
              <Tab icon={<ChartBar size={18} weight="duotone" />} label="Dashboard" />
              <Tab icon={<TrendUp size={18} weight="duotone" />} label="Ventas" />
              <Tab icon={<Package size={18} weight="duotone" />} label="Productos" />
              <Tab icon={<Users size={18} weight="duotone" />} label="Clientes" />
              <Tab icon={<Clock size={18} weight="duotone" />} label="Producción" />
            </ReportsTabs>
          </Box>

          {/* CONTENIDO DE PESTAÑAS - POSICIÓN ORIGINAL DE GRÁFICAS */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartCard sx={{ height: '400px' }}>
                  <Typography variant="h6" gutterBottom>
                    Ventas por Mes
                  </Typography>
                  {salesData ? (
                    <ChartErrorBoundary>
                      <Bar 
                        data={getValidChartData(salesData, 'bar')} 
                        options={getChartOptions()} 
                      />
                    </ChartErrorBoundary>
                  ) : (
                    <CircularProgress />
                  )}
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard sx={{ height: '400px' }}>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Productos
                  </Typography>
                  {productsData ? (
                    <ChartErrorBoundary>
                      <Pie 
                        data={getValidChartData(productsData, 'pie')} 
                        options={getChartOptions()} 
                      />
                    </ChartErrorBoundary>
                  ) : (
                    <CircularProgress />
                  )}
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <ChartCard sx={{ height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Tendencias de Ventas
              </Typography>
              {salesData ? (
                <ChartErrorBoundary>
                  <Line 
                    data={getValidChartData(salesData, 'line')} 
                    options={getChartOptions()} 
                  />
                </ChartErrorBoundary>
              ) : (
                <CircularProgress />
              )}
            </ChartCard>
          )}

          {activeTab === 2 && (
            <ChartCard sx={{ height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Productos Más Vendidos
              </Typography>
              {productsData ? (
                <ChartErrorBoundary>
                  <Bar 
                    data={getValidChartData(productsData, 'bar')} 
                    options={getChartOptions()} 
                  />
                </ChartErrorBoundary>
              ) : (
                <CircularProgress />
              )}
            </ChartCard>
          )}

          {activeTab === 3 && (
            <ChartCard sx={{ height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Clientes Más Activos
              </Typography>
              {customersData ? (
                <ChartErrorBoundary>
                  <Bar 
                    data={getValidChartData(customersData, 'bar')} 
                    options={getChartOptions()} 
                  />
                </ChartErrorBoundary>
              ) : (
                <CircularProgress />
              )}
            </ChartCard>
          )}

          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartCard sx={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Tiempo Promedio de Producción
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ textAlign: 'center', my: 4 }}>
                    {productionData?.averageProductionTime || '0'} días
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard sx={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Eficiencia de Producción
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ textAlign: 'center', my: 4 }}>
                    {productionData?.efficiency || '0'}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={productionData?.efficiency || 0} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </ChartCard>
              </Grid>
            </Grid>
          )}
        </ReportsChartsSection>

        {/* Mostrar errores si existen */}
        {(dashboardError || salesError || productsError || customersError || productionError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al cargar los reportes. Por favor, inténtalo de nuevo.
          </Alert>
        )}
      </ReportsContentWrapper>
    </ReportsPageContainer>
  );
};

export default ReportsPage;