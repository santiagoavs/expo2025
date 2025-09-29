// src/pages/ReportsPage/ReportsPage.jsx - Página de reportes refactorizada
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
  Tab
} from '@mui/material';
import {
  ChartBar,
  TrendUp,
  Users,
  Package,
  Clock,
  Download
} from '@phosphor-icons/react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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
  ArcElement
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

// ================ ESTILOS MODERNOS RESPONSIVE - REPORTS ================
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

const ReportsHeaderSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  fontWeight: '700 !important',
  background: 'white',
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
  color: '#010326',
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
  color: '#032CA6',
  fontWeight: '700 !important',
  lineHeight: 1.6,
  opacity: 0.9,
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

const ReportsPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: '160px',
  whiteSpace: 'nowrap',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
    transform: 'translateY(-1px)',
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
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
  '&:hover': {
    background: alpha('#1F64BF', 0.12),
    transform: 'translateY(-1px)',
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

// CONTENEDOR UNIFICADO REPORTS
const ReportsUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const ReportsStatsContainer = styled(ReportsUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS REPORTS
const ReportsStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(4, 1fr)',
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
    ...selectedVariant,
    '&::before': variant === 'primary' ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    } : {},
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

const ReportsTabsSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '28px',
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

const ReportsSection = styled(ReportsUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const ReportsSectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '28px',
  paddingBottom: '18px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    marginBottom: '24px',
    paddingBottom: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '12px',
  }
}));

const ReportsSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  // Hooks de reportes
  const { data: dashboardStats, loading: dashboardLoading, error: dashboardError } = useDashboardStats();
  const { data: salesData, loading: salesLoading, error: salesError } = useSalesReport();
  const { data: productsData, loading: productsLoading, error: productsError } = useTopProductsReport();
  const { data: customersData, loading: customersLoading, error: customersError } = useTopCustomersReport();
  const { data: productionData, loading: productionLoading, error: productionError } = useProductionReport();
  const { exportReport } = useReportExport();

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
    console.log('📊 [ReportsPage] Dashboard Stats:', dashboardStats);
    console.log('📊 [ReportsPage] Customers Data:', customersData);
    console.log('📊 [ReportsPage] Products Data:', productsData);
    
    if (!dashboardStats) return { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 };
    
    // El backend devuelve datos anidados, necesitamos extraerlos correctamente
    const todayData = dashboardStats.today || {};
    const monthData = dashboardStats.thisMonth || {};
    const productionData = dashboardStats.production || {};
    
    // Calcular total de clientes únicos desde los datos de clientes
    const totalCustomers = customersData?.customerStatistics?.totalCustomers || 0;
    
    // Calcular total de productos desde los datos de productos
    const totalProducts = productsData?.topProductsByQuantity?.length || 0;
    
    const calculatedStats = {
      totalRevenue: monthData.totalRevenue || todayData.totalRevenue || 0,
      totalOrders: monthData.totalOrders || todayData.totalOrders || 0,
      totalCustomers: totalCustomers,
      totalProducts: totalProducts
    };
    
    console.log('📊 [ReportsPage] Calculated Stats:', calculatedStats);
    return calculatedStats;
  }, [dashboardStats, customersData, productsData]);

  // Función para validar y formatear datos de gráficos
  const getValidChartData = (data, type = 'bar') => {
    console.log(`📊 [getValidChartData] Processing data for type ${type}:`, data);
    
    // Si los datos ya están formateados para gráficos, usarlos directamente
    if (data && data.datasets && Array.isArray(data.datasets)) {
      console.log('📊 [getValidChartData] Using pre-formatted chart data');
      return data;
    }
    
    // Si los datos son del backend (datos originales), formatearlos
    if (data && (data.topProductsByQuantity || data.topCustomers || data.salesByPeriod)) {
      if (type === 'pie' || type === 'doughnut') {
        // Formatear para gráfico de pastel
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
        // Formatear para gráfico de barras
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
    
    // Retornar datos por defecto si no hay datos válidos
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

  if (dashboardLoading) {
    return (
      <ReportsPageContainer>
        <ReportsContentWrapper>
          <CircularProgress />
        </ReportsContentWrapper>
      </ReportsPageContainer>
    );
  }

  return (
    <ReportsPageContainer>
      <ReportsContentWrapper>
        {/* HEADER SECTION */}
        <ReportsHeaderSection>
          <ReportsHeaderContent>
            <ReportsHeaderInfo>
              <ReportsMainTitle>
                Reportes y Análisis
              </ReportsMainTitle>
              <ReportsMainDescription>
                Analiza el rendimiento de tu negocio con reportes detallados y visualizaciones interactivas
              </ReportsMainDescription>
            </ReportsHeaderInfo>
            <ReportsHeaderActions>
              <ReportsPrimaryActionButton
                startIcon={<Download size={18} weight="bold" />}
                onClick={() => handleExport(activeTab, 'excel')}
                disabled={exportLoading}
              >
                Exportar Excel
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

        {/* ESTADÍSTICAS */}
        <ReportsStatsContainer>
          <ReportsStatsGrid>
            <ReportsStatCard variant="primary">
              <ReportsStatHeader>
                <ReportsStatIconContainer variant="primary">
                  <TrendUp size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatValue variant="primary">
                {formatCurrency(stats.totalRevenue)}
              </ReportsStatValue>
              <ReportsStatLabel variant="primary">
                Ingresos Totales
              </ReportsStatLabel>
              <ReportsStatChange variant="primary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="primary" trend="up">
                  +12% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>

            <ReportsStatCard>
              <ReportsStatHeader>
                <ReportsStatIconContainer>
                  <ChartBar size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatValue>
                {stats.totalOrders}
              </ReportsStatValue>
              <ReportsStatLabel>
                Total de Órdenes
              </ReportsStatLabel>
              <ReportsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText trend="up">
                  +8% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>

            <ReportsStatCard>
              <ReportsStatHeader>
                <ReportsStatIconContainer>
                  <Users size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatValue>
                {stats.totalCustomers}
              </ReportsStatValue>
              <ReportsStatLabel>
                Clientes Activos
              </ReportsStatLabel>
              <ReportsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText trend="up">
                  +15% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>

            <ReportsStatCard>
              <ReportsStatHeader>
                <ReportsStatIconContainer>
                  <Package size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatValue>
                {stats.totalProducts}
              </ReportsStatValue>
              <ReportsStatLabel>
                Productos Vendidos
              </ReportsStatLabel>
              <ReportsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText trend="up">
                  +22% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </ReportsStatsGrid>
        </ReportsStatsContainer>

        {/* PESTAÑAS DE REPORTES */}
        <ReportsTabsSection>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="report tabs">
              <Tab icon={<ChartBar size={18} weight="duotone" />} label="Dashboard" />
              <Tab icon={<TrendUp size={18} weight="duotone" />} label="Ventas" />
              <Tab icon={<Package size={18} weight="duotone" />} label="Productos" />
              <Tab icon={<Users size={18} weight="duotone" />} label="Clientes" />
              <Tab icon={<Clock size={18} weight="duotone" />} label="Producción" />
            </Tabs>
          </Box>

          {/* CONTENIDO DE PESTAÑAS */}
          {activeTab === 0 && (
            <ReportsSection>
              <ReportsSectionHeader>
                <ReportsSectionTitle>
                  <ChartBar size={24} weight="duotone" />
                  Dashboard General
                </ReportsSectionTitle>
              </ReportsSectionHeader>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ReportsModernCard sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Ventas por Mes
                    </Typography>
                    {salesData ? (
                      <ChartErrorBoundary>
                        <Bar data={getValidChartData(salesData, 'bar')} options={{ responsive: true }} />
                      </ChartErrorBoundary>
                    ) : (
                      <CircularProgress />
                    )}
                  </ReportsModernCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ReportsModernCard sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Distribución de Productos
                    </Typography>
                    {productsData ? (
                      <ChartErrorBoundary>
                        <Pie data={getValidChartData(productsData, 'pie')} options={{ responsive: true }} />
                      </ChartErrorBoundary>
                    ) : (
                      <CircularProgress />
                    )}
                  </ReportsModernCard>
                </Grid>
              </Grid>
            </ReportsSection>
          )}

          {activeTab === 1 && (
            <ReportsSection>
              <ReportsSectionHeader>
                <ReportsSectionTitle>
                  <TrendUp size={24} weight="duotone" />
                  Reporte de Ventas
                </ReportsSectionTitle>
              </ReportsSectionHeader>
              <ReportsModernCard sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tendencias de Ventas
                </Typography>
                {salesData ? (
                  <ChartErrorBoundary>
                    <Line data={getValidChartData(salesData, 'line')} options={{ responsive: true }} />
                  </ChartErrorBoundary>
                ) : (
                  <CircularProgress />
                )}
              </ReportsModernCard>
            </ReportsSection>
          )}

          {activeTab === 2 && (
            <ReportsSection>
              <ReportsSectionHeader>
                <ReportsSectionTitle>
                  <Package size={24} weight="duotone" />
                  Productos Más Vendidos
                </ReportsSectionTitle>
              </ReportsSectionHeader>
              <ReportsModernCard sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top 10 Productos
                </Typography>
                {productsData ? (
                  <ChartErrorBoundary>
                    <Bar data={getValidChartData(productsData, 'bar')} options={{ responsive: true }} />
                  </ChartErrorBoundary>
                ) : (
                  <CircularProgress />
                )}
              </ReportsModernCard>
            </ReportsSection>
          )}

          {activeTab === 3 && (
            <ReportsSection>
              <ReportsSectionHeader>
                <ReportsSectionTitle>
                  <Users size={24} weight="duotone" />
                  Clientes Más Activos
                </ReportsSectionTitle>
              </ReportsSectionHeader>
              <ReportsModernCard sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top 10 Clientes
                </Typography>
                {customersData ? (
                  <ChartErrorBoundary>
                    <Bar data={getValidChartData(customersData, 'bar')} options={{ responsive: true }} />
                  </ChartErrorBoundary>
                ) : (
                  <CircularProgress />
                )}
              </ReportsModernCard>
            </ReportsSection>
          )}

          {activeTab === 4 && (
            <ReportsSection>
              <ReportsSectionHeader>
                <ReportsSectionTitle>
                  <Clock size={24} weight="duotone" />
                  Reporte de Producción
                </ReportsSectionTitle>
              </ReportsSectionHeader>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ReportsModernCard sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Tiempo Promedio de Producción
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {productionData?.averageProductionTime || '0'} días
                    </Typography>
                  </ReportsModernCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ReportsModernCard sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Eficiencia de Producción
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {productionData?.efficiency || '0'}%
                    </Typography>
                  </ReportsModernCard>
                </Grid>
              </Grid>
            </ReportsSection>
          )}
        </ReportsTabsSection>

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