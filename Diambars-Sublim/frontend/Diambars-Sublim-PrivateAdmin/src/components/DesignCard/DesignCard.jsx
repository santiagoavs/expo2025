// src/components/DesignCard/DesignCard.jsx - TARJETA DE DISEÑO ADMIN
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  styled,
  alpha,
  useTheme,
  Skeleton,
  
} from '@mui/material';
import {
  DotsThreeVertical,
  Eye,
  PencilSimple,
  Copy,
  Trash,
  Money,
  User,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Warning
} from '@phosphor-icons/react';

// ================ ESTILOS MODERNOS ================
const DesignCardContainer = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
    transform: 'translateY(-2px)',
    borderColor: alpha('#1F64BF', 0.15),
  }
}));

const DesignPreviewContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '200px',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const DesignPreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease'
});

const PreviewPlaceholder = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: alpha('#1F64BF', 0.6),
  '& svg': {
    fontSize: '48px',
    opacity: 0.5
  }
}));

const StatusBadgeComponent = styled(Box)(({ theme, status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { 
        color: '#6B7280', 
        bg: alpha('#6B7280', 0.1), 
        icon: PencilSimple 
      },
      'pending': { 
        color: '#F59E0B', 
        bg: alpha('#F59E0B', 0.1), 
        icon: Clock 
      },
      'quoted': { 
        color: '#3B82F6', 
        bg: alpha('#3B82F6', 0.1), 
        icon: Money 
      },
      'approved': { 
        color: '#10B981', 
        bg: alpha('#10B981', 0.1), 
        icon: CheckCircle 
      },
      'rejected': { 
        color: '#EF4444', 
        bg: alpha('#EF4444', 0.1), 
        icon: XCircle 
      },
      'completed': { 
        color: '#059669', 
        bg: alpha('#059669', 0.1), 
        icon: CheckCircle 
      },
      'cancelled': { 
        color: '#DC2626', 
        bg: alpha('#DC2626', 0.1), 
        icon: XCircle 
      }
    };
    return configs[status] || configs['draft'];
  };

  const config = getStatusConfig(status);

  return {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '20px',
    background: config.bg,
    color: config.color,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    zIndex: 2,
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(config.color, 0.2)}`
  };
});

const DesignCardContent = styled(CardContent)({
  padding: '20px',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const DesignHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px'
});

const DesignInfo = styled(Box)({
  flex: 1,
  minWidth: 0 // Para que text-overflow funcione
});

const DesignTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#010326',
  marginBottom: '4px',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const DesignSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#032CA6',
  opacity: 0.8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const DesignMetrics = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '8px'
});

const MetricItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
});

const MetricIcon = styled(Box)(({ theme, color }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(color || '#1F64BF', 0.1),
  color: color || '#1F64BF',
  flexShrink: 0
}));

const MetricText = styled(Box)({
  minWidth: 0,
  flex: 1
});

const MetricLabel = styled(Typography)({
  fontSize: '0.75rem',
  color: '#032CA6',
  opacity: 0.7,
  lineHeight: 1,
  marginBottom: '2px'
});

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  lineHeight: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const ClientInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  borderRadius: '12px',
  background: alpha('#1F64BF', 0.04),
  border: `1px solid ${alpha('#1F64BF', 0.08)}`
});

const ClientAvatar = styled(Avatar)(({ theme }) => ({
  width: '32px',
  height: '32px',
  fontSize: '0.875rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white'
}));

const ClientDetails = styled(Box)({
  flex: 1,
  minWidth: 0
});

const ClientName = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const ClientEmail = styled(Typography)({
  fontSize: '0.75rem',
  color: '#032CA6',
  opacity: 0.7,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const ActionsButton = styled(IconButton)(({ theme }) => ({
  width: '32px',
  height: '32px',
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha('#1F64BF', 0.15),
    transform: 'scale(1.05)'
  }
}));

const ComplexityChip = styled(Chip)(({ complexity }) => {
  const colors = {
    'low': { color: '#10B981', bg: alpha('#10B981', 0.1) },
    'medium': { color: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
    'high': { color: '#EF4444', bg: alpha('#EF4444', 0.1) }
  };
  
  const config = colors[complexity] || colors['low'];
  
  return {
    height: '24px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: config.color,
    backgroundColor: config.bg,
    border: `1px solid ${alpha(config.color, 0.2)}`,
    '& .MuiChip-label': {
      padding: '0 8px'
    }
  };
});

// ================ COMPONENTE PRINCIPAL ================
const DesignCard = ({
  id,
  name,
  status,
  clientName,
  clientEmail,
  productName,
  productImage,
  previewImage,
  price,
  formattedPrice,
  createdDate,
  updatedDate,
  elementsCount,
  complexity,
  canEdit,
  canQuote,
  canApprove,
  daysAgo,
  onView,
  onEdit,
  onClone,
  onDelete,
  onQuote,
  onChangeStatus,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // ==================== MANEJADORES ====================
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action, ...args) => {
    handleMenuClose();
    if (action && typeof action === 'function') {
      action(...args);
    }
  };

  const handleCardClick = () => {
    if (onView && typeof onView === 'function') {
      onView(id);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // ==================== CONFIGURACIÓN DE ESTADO ====================
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { 
        text: 'Borrador',
        color: '#6B7280', 
        bg: alpha('#6B7280', 0.1), 
        icon: PencilSimple 
      },
      'pending': { 
        text: 'Pendiente',
        color: '#F59E0B', 
        bg: alpha('#F59E0B', 0.1), 
        icon: Clock 
      },
      'quoted': { 
        text: 'Cotizado',
        color: '#3B82F6', 
        bg: alpha('#3B82F6', 0.1), 
        icon: Money 
      },
      'approved': { 
        text: 'Aprobado',
        color: '#10B981', 
        bg: alpha('#10B981', 0.1), 
        icon: CheckCircle 
      },
      'rejected': { 
        text: 'Rechazado',
        color: '#EF4444', 
        bg: alpha('#EF4444', 0.1), 
        icon: XCircle 
      },
      'completed': { 
        text: 'Completado',
        color: '#059669', 
        bg: alpha('#059669', 0.1), 
        icon: CheckCircle 
      },
      'cancelled': { 
        text: 'Cancelado',
        color: '#DC2626', 
        bg: alpha('#DC2626', 0.1), 
        icon: XCircle 
      }
    };
    return configs[status] || configs['draft'];
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // ==================== OPCIONES DEL MENÚ ====================
  const menuOptions = [
    {
      label: 'Ver diseño',
      icon: Eye,
      action: () => handleAction(onView, id),
      show: true,
      color: '#1F64BF'
    },
    {
      label: 'Editar',
      icon: PencilSimple,
      action: () => handleAction(onEdit, id),
      show: canEdit,
      color: '#F59E0B'
    },
    {
      label: 'Cotizar',
      icon: Money,
      action: () => handleAction(onQuote, id),
      show: canQuote,
      color: '#10B981'
    },
    {
      label: 'Clonar',
      icon: Copy,
      action: () => handleAction(onClone, id),
      show: true,
      color: '#6366F1'
    },
    {
      label: 'Cambiar estado',
      icon: Warning,
      action: () => handleAction(onChangeStatus, id),
      show: status !== 'completed' && status !== 'cancelled',
      color: '#8B5CF6'
    },
    {
      label: 'Eliminar',
      icon: Trash,
      action: () => handleAction(onDelete, id),
      show: status === 'draft' || status === 'cancelled',
      color: '#EF4444',
      divider: true
    }
  ];

  const visibleOptions = menuOptions.filter(option => option.show);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <DesignCardContainer>
        <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
        <DesignCardContent>
          <Box>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
          <DesignMetrics>
            <Skeleton variant="rectangular" width="100%" height={48} />
            <Skeleton variant="rectangular" width="100%" height={48} />
          </DesignMetrics>
          <Skeleton variant="rectangular" width="100%" height={56} />
        </DesignCardContent>
      </DesignCardContainer>
    );
  }

  // ==================== RENDER PRINCIPAL ====================
  return (
    <DesignCardContainer>
      {/* Preview del diseño */}
      <DesignPreviewContainer onClick={handleCardClick} sx={{ cursor: 'pointer' }}>
        {/* Status Badge */}
        <StatusBadgeComponent status={status} />
        {/* Imagen de preview */}
        {previewImage && !imageError ? (
          <>
            {imageLoading && (
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="100%" 
                sx={{ position: 'absolute', top: 0, left: 0 }}
              />
            )}
            <DesignPreviewImage
              src={previewImage}
              alt={`Preview de ${name}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                display: imageLoading ? 'none' : 'block',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />
          </>
        ) : (
          <PreviewPlaceholder>
            <Package size={48} weight="duotone" />
            <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
              {imageError ? 'Error cargando imagen' : 'Sin vista previa'}
            </Typography>
          </PreviewPlaceholder>
        )}
      </DesignPreviewContainer>

      {/* Contenido principal */}
      <DesignCardContent>
        {/* Header con título y acciones */}
        <DesignHeader>
          <DesignInfo>
            <DesignTitle title={name}>
              {name}
            </DesignTitle>
            <DesignSubtitle title={productName}>
              {productName}
            </DesignSubtitle>
          </DesignInfo>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <ComplexityChip 
              complexity={complexity}
              label={complexity}
              size="small"
            />
            <ActionsButton
              onClick={handleMenuOpen}
              disabled={loading}
            >
              <DotsThreeVertical size={16} weight="bold" />
            </ActionsButton>
          </Box>
        </DesignHeader>

        {/* Métricas del diseño */}
        <DesignMetrics>
          <MetricItem>
            <MetricIcon color="#10B981">
              <Money size={16} weight="bold" />
            </MetricIcon>
            <MetricText>
              <MetricLabel>Precio</MetricLabel>
              <MetricValue>
                {price > 0 ? formattedPrice : 'Sin cotizar'}
              </MetricValue>
            </MetricText>
          </MetricItem>

          <MetricItem>
            <MetricIcon color="#3B82F6">
              <Package size={16} weight="bold" />
            </MetricIcon>
            <MetricText>
              <MetricLabel>Elementos</MetricLabel>
              <MetricValue>
                {elementsCount} elemento{elementsCount !== 1 ? 's' : ''}
              </MetricValue>
            </MetricText>
          </MetricItem>

          <MetricItem>
            <MetricIcon color="#F59E0B">
              <Calendar size={16} weight="bold" />
            </MetricIcon>
            <MetricText>
              <MetricLabel>Creado</MetricLabel>
              <MetricValue title={createdDate}>
                {daysAgo === 0 ? 'Hoy' : 
                 daysAgo === 1 ? 'Ayer' : 
                 daysAgo < 30 ? `Hace ${daysAgo} días` : 
                 createdDate}
              </MetricValue>
            </MetricText>
          </MetricItem>

          <MetricItem>
            <MetricIcon color="#8B5CF6">
              <CheckCircle size={16} weight="bold" />
            </MetricIcon>
            <MetricText>
              <MetricLabel>Estado</MetricLabel>
              <MetricValue style={{ color: statusConfig.color }}>
                {statusConfig.text}
              </MetricValue>
            </MetricText>
          </MetricItem>
        </DesignMetrics>

        {/* Información del cliente */}
        <ClientInfo>
          <ClientAvatar>
            {clientName ? clientName.charAt(0).toUpperCase() : 'C'}
          </ClientAvatar>
          <ClientDetails>
            <ClientName title={clientName}>
              {clientName || 'Cliente desconocido'}
            </ClientName>
            <ClientEmail title={clientEmail}>
              {clientEmail || 'Sin email'}
            </ClientEmail>
          </ClientDetails>
          <Box sx={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: statusConfig.color,
            flexShrink: 0
          }} />
        </ClientInfo>
      </DesignCardContent>

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
            minWidth: '160px',
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              margin: '4px 8px',
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: 500,
              gap: '8px',
              '&:hover': {
                backgroundColor: alpha('#1F64BF', 0.08),
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {visibleOptions.map((option, index) => (
          <React.Fragment key={option.label}>
            {option.divider && index > 0 && (
              <Box sx={{ 
                height: '1px', 
                backgroundColor: alpha('#1F64BF', 0.08), 
                margin: '4px 16px' 
              }} />
            )}
            <MenuItem
              onClick={option.action}
              sx={{ 
                color: option.color,
                '& svg': { 
                  color: option.color,
                  flexShrink: 0
                }
              }}
            >
              <option.icon size={16} weight="bold" />
              {option.label}
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </DesignCardContainer>
  );
};

// ==================== PROP TYPES ====================
DesignCard.defaultProps = {
  name: 'Diseño sin nombre',
  status: 'draft',
  clientName: 'Cliente desconocido',
  clientEmail: '',
  productName: 'Producto desconocido',
  price: 0,
  formattedPrice: '$0.00',
  elementsCount: 0,
  complexity: 'low',
  canEdit: false,
  canQuote: false,
  canApprove: false,
  daysAgo: 0,
  loading: false,
  onView: () => {},
  onEdit: () => {},
  onClone: () => {},
  onDelete: () => {},
  onQuote: () => {},
  onChangeStatus: () => {}
};

export default DesignCard;