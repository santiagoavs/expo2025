// src/pages/Dashboard/WelcomeDashboard.jsx - Nueva página de inicio
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  alpha, 
  useTheme, 
  useMediaQuery, 
  styled,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Stack
} from '@mui/material';
import { 
  Clock, 
  User, 
  Target, 
  Lightning, 
  Coffee, 
  ChartLine, 
  Package, 
  Users, 
  ShoppingCart, 
  PaintBrush, 
  MapPin, 
  Star,
  ArrowRight,
  CheckCircle,
  Warning,
  Info,
  Rocket,
  Code,
  Database,
  Shield,
  Heart
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../utils/permissions';
import { useNavigate } from 'react-router-dom';

// ================ COMPONENTES ESTILIZADOS ================
const WelcomeHeader = styled(Paper)(({ theme }) => ({
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

const QuickActionCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'white',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
    transform: 'translateY(-4px)',
    borderColor: alpha('#1F64BF', 0.2)
  }
}));

const ProjectCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'linear-gradient(45deg, transparent 40%, rgba(31, 100, 191, 0.1) 50%, transparent 60%)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)'
  }
}));

const StatusIndicator = styled(Box)(({ status }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: status === 'online' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444',
  boxShadow: `0 0 0 3px ${status === 'online' ? 'rgba(16, 185, 129, 0.2)' : status === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
  animation: status === 'online' ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { boxShadow: `0 0 0 0 ${status === 'online' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}` },
    '70%': { boxShadow: `0 0 0 10px ${status === 'online' ? 'rgba(16, 185, 129, 0)' : 'rgba(245, 158, 11, 0)'}` },
    '100%': { boxShadow: `0 0 0 0 ${status === 'online' ? 'rgba(16, 185, 129, 0)' : 'rgba(245, 158, 11, 0)'}` }
  }
}));

const WelcomeDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { hasPermission, userRole } = usePermissions();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Funciones utilitarias
  const formatTime = (date) => date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const formatDate = (date) => date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      manager: 'Gerente',
      employee: 'Empleado',
      delivery: 'Repartidor'
    };
    return roleNames[role] || 'Usuario';
  };

  // Acciones rápidas según rol
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Ver Órdenes',
        description: 'Gestionar pedidos',
        icon: ShoppingCart,
        path: '/orders',
        permission: 'canViewOrders',
        color: '#1F64BF'
      },
      {
        title: 'Ver Direcciones',
        description: 'Gestionar direcciones',
        icon: MapPin,
        path: '/address-management',
        permission: 'canViewAddresses',
        color: '#10B981'
      }
    ];

    const adminActions = [
      {
        title: 'Gestión de Usuarios',
        description: 'Administrar usuarios',
        icon: Users,
        path: '/users',
        permission: 'canViewUsers',
        color: '#F59E0B'
      },
      {
        title: 'Gestión de Empleados',
        description: 'Administrar personal',
        icon: User,
        path: '/employees',
        permission: 'canViewEmployees',
        color: '#8B5CF6'
      },
      {
        title: 'Gestión de Productos',
        description: 'Administrar catálogo',
        icon: Package,
        path: '/catalog-management',
        permission: 'canViewProducts',
        color: '#EF4444'
      },
      {
        title: 'Editor de Diseños',
        description: 'Crear y editar diseños',
        icon: PaintBrush,
        path: '/design-management',
        permission: 'canViewDesigns',
        color: '#EC4899'
      },
      {
        title: 'Reportes',
        description: 'Ver estadísticas',
        icon: ChartLine,
        path: '/reports',
        permission: 'canViewReports',
        color: '#06B6D4'
      }
    ];

    return [...baseActions, ...adminActions].filter(action => 
      hasPermission(action.permission)
    );
  };

  const quickActions = getQuickActions();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      paddingTop: '120px', 
      paddingBottom: '40px', 
      paddingX: { xs: 2, sm: 3, md: 4 }, 
      backgroundColor: '#f8fafc' 
    }}>
      
      {/* Header de Bienvenida */}
      <WelcomeHeader sx={{ mb: 4 }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                background: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <User size={40} weight="duotone" />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  marginBottom: 1, 
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {getGreeting()}, {user?.name || 'Usuario'}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontWeight: 500,
                  mb: 1
                }}>
                  {getRoleDisplayName(userRole)} • Panel Administrativo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} />
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      {formatTime(currentTime)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                    {formatDate(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusIndicator status={systemStatus} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Sistema {systemStatus === 'online' ? 'Operativo' : 'En Mantenimiento'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </WelcomeHeader>

      {/* Acciones Rápidas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: '#010326', 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Target size={24} weight="duotone" />
          Acciones Rápidas
        </Typography>
        
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <QuickActionCard>
                <CardActionArea 
                  onClick={() => navigate(action.path)}
                  sx={{ p: 3, height: '100%' }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px', 
                        background: alpha(action.color, 0.1), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: action.color 
                      }}>
                        <action.icon size={24} weight="duotone" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#010326',
                          fontSize: '1.1rem'
                        }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#64748b',
                          fontSize: '0.85rem'
                        }}>
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip 
                        label="Acceder" 
                        size="small" 
                        sx={{ 
                          background: action.color, 
                          color: 'white', 
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }} 
                      />
                      <ArrowRight size={16} color={action.color} />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </QuickActionCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Información del Proyecto Expo */}
      <ProjectCard sx={{ mb: 4 }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: '#010326', 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Rocket size={24} weight="duotone" />
            Proyecto Expo 2025
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#010326', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Heart size={20} weight="duotone" />
                  Sobre DIAMBARS
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#475569', 
                  lineHeight: 1.6,
                  mb: 2
                }}>
                  Sistema administrativo completo para gestión de productos personalizados, 
                  diseñado para demostrar las mejores prácticas en desarrollo web moderno.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<Shield size={16} />} label="Seguro" size="small" color="primary" />
                  <Chip icon={<Lightning size={16} />} label="Rápido" size="small" color="success" />
                  <Chip icon={<Target size={16} />} label="Preciso" size="small" color="warning" />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#010326', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Code size={20} weight="duotone" />
                  Tecnologías
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip label="React" size="small" variant="outlined" />
                  <Chip label="Node.js" size="small" variant="outlined" />
                  <Chip label="MongoDB" size="small" variant="outlined" />
                  <Chip label="Material-UI" size="small" variant="outlined" />
                </Stack>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.85rem'
                }}>
                  Desarrollado con las tecnologías más modernas del ecosistema JavaScript, 
                  garantizando escalabilidad y mantenibilidad.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </ProjectCard>

      {/* Estado del Sistema */}
      <Paper sx={{ 
        padding: 3, 
        borderRadius: '16px', 
        background: 'white', 
        border: `1px solid ${alpha('#1F64BF', 0.08)}`,
        boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#010326', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CheckCircle size={20} weight="duotone" />
          Estado del Sistema
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusIndicator status="online" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#010326' }}>
                  Servidor Principal
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Operativo
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusIndicator status="online" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#010326' }}>
                  Base de Datos
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Conectada
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusIndicator status="online" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#010326' }}>
                  API REST
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Funcionando
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusIndicator status="online" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#010326' }}>
                  Autenticación
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Activa
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default WelcomeDashboard;
