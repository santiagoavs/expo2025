// src/components/EmployeeCard/EmployeeCard.jsx
import React, { useState } from 'react';
import {
  User,
  Envelope,
  Phone,
  Calendar,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  UserMinus,
  UserPlus,
  Clock,
  Crown,
  Pause
} from '@phosphor-icons/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  styled,
  useTheme,
  alpha,
  Paper,
  Divider
} from '@mui/material';

// ================ ESTILOS MODERNOS RESPONSIVE - EMPLOYEE CARD ================
const EmployeeCardContainer = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(15px)',
  border: `1px solid ${alpha('#040DBF', 0.1)}`,
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 8px 25px rgba(4, 13, 191, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(4, 13, 191, 0.1)',
    transform: 'translateY(-2px)',
    borderColor: alpha('#040DBF', 0.15),
  }
}));

const EmployeeCardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '24px 24px 0 24px',
  position: 'relative',
});

const EmployeeCardAvatar = styled(Avatar)(({ theme }) => ({
  position: 'relative',
  width: '64px',
  height: '64px',
  background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  boxShadow: '0 6px 20px rgba(4, 13, 191, 0.3)',
  transition: 'all 0.3s ease',
  fontSize: '24px',
  fontWeight: '700',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 15px rgba(4, 13, 191, 0.25)',
  },
  [theme.breakpoints.down('md')]: {
    width: '56px',
    height: '56px',
    fontSize: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
    fontSize: '18px',
  }
}));

const EmployeeCardStatusDot = styled(Box)(({ status, theme }) => ({
  position: 'absolute',
  bottom: '4px',
  right: '4px',
  width: '16px',
  height: '16px',
  border: '3px solid #ffffff',
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  ...(status === 'active' ? {
    background: '#10b981',
    animation: 'employeeCardPulse 2s ease-in-out infinite',
  } : status === 'pending' ? {
    background: '#f59e0b',
    animation: 'employeeCardPulse 2s ease-in-out infinite',
  } : {
    background: '#64748b',
  }),
  [theme.breakpoints.down('sm')]: {
    width: '12px',
    height: '12px',
    borderWidth: '2px',
  }
}));

const EmployeeCardActions = styled(Box)({
  position: 'relative',
});

const EmployeeCardActionBtn = styled(IconButton)(({ theme }) => ({
  width: '40px',
  height: '40px',
  background: alpha('#040DBF', 0.15),
  border: `2px solid ${alpha('#040DBF', 0.3)}`,
  borderRadius: '12px',
  color: '#040DBF',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  position: 'relative',
  boxShadow: '0 2px 8px rgba(4, 13, 191, 0.1)',
  overflow: 'hidden',
  '&:hover': {
    background: alpha('#040DBF', 0.2),
    borderColor: alpha('#040DBF', 0.4),
    color: '#040DBF',
    transform: 'translateY(-1px) scale(1.02)',
    boxShadow: '0 4px 12px rgba(4, 13, 191, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.95)',
  },
  '&:focus': {
    outline: `3px solid ${alpha('#040DBF', 0.3)}`,
    outlineOffset: '2px',
  }
}));

const EmployeeCardDropdown = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  background: '#ffffff',
  border: `1px solid ${alpha('#040DBF', 0.1)}`,
  borderRadius: '12px',
  boxShadow: '0 8px 25px rgba(4, 13, 191, 0.15)',
  zIndex: 10,
  minWidth: '140px',
  overflow: 'hidden',
  animation: 'employeeCardDropdownEnter 0.2s ease-out',
}));

const EmployeeCardDropdownItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  fontSize: '13px',
  fontWeight: '500',
  color: '#334155',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha('#040DBF', 0.05),
    color: '#040DBF',
  },
  '&.danger:hover': {
    background: alpha('#ef4444', 0.05),
    color: '#dc2626',
  }
}));

const EmployeeCardBody = styled(Box)({
  padding: '16px 24px 24px 24px',
});

const EmployeeCardInfo = styled(Box)({
  marginBottom: '20px',
});

const EmployeeCardName = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: '700',
  color: '#010326',
  margin: '0 0 8px 0',
  lineHeight: 1.3,
  [theme.breakpoints.down('md')]: {
    fontSize: '16px',
  }
}));

const EmployeeCardRole = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#040DBF',
});

const EmployeeCardStatus = styled(Box)(({ status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  ...(status === 'active' ? {
    color: '#059669',
  } : status === 'pending' ? {
    color: '#d97706',
  } : {
    color: '#64748b',
  })
}));

const EmployeeCardStatusIndicator = styled(Box)(({ status }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  ...(status === 'active' ? {
    background: '#10b981',
  } : status === 'pending' ? {
    background: '#f59e0b',
  } : {
    background: '#64748b',
  })
}));

const EmployeeCardContact = styled(Box)({
  marginBottom: '16px',
});

const EmployeeCardContactItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 0',
  fontSize: '13px',
  '& svg': {
    color: '#64748b',
    minWidth: '14px',
  }
});

const EmployeeCardContactText = styled(Typography)({
  color: '#334155',
  fontWeight: '500',
  wordBreak: 'break-all',
  fontSize: '13px',
});

const EmployeeCardMeta = styled(Box)({
  marginBottom: '16px',
  padding: '12px',
  background: 'rgba(248, 250, 252, 0.6)',
  borderRadius: '10px',
  border: `1px solid ${alpha('#040DBF', 0.05)}`,
});

const EmployeeCardMetaItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  marginBottom: '4px',
  '&:last-child': {
    marginBottom: 0,
  },
  '& svg': {
    color: '#64748b',
  }
});

const EmployeeCardMetaLabel = styled(Typography)({
  color: '#64748b',
  fontWeight: '600',
  minWidth: '60px',
  fontSize: '11px',
});

const EmployeeCardMetaValue = styled(Typography)({
  color: '#334155',
  fontWeight: '500',
  fontSize: '11px',
});

const EmployeeCardOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  zIndex: 5,
});

const EmployeeCard = ({ 
  employee, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onView 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'manager':
        return <Crown size={16} weight="duotone" />;
      case 'delivery':
        return <User size={16} weight="duotone" />;
      case 'production':
        return <User size={16} weight="duotone" />;
      case 'employee':
      default:
        return <User size={16} weight="duotone" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'manager':
        return 'Gerente';
      case 'delivery':
        return 'Repartidor';
      case 'production':
        return 'Producción';
      case 'employee':
      default:
        return 'Empleado';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'employee-card-status--active';
      case 'inactive':
        return 'employee-card-status--inactive';
      default:
        return 'employee-card-status--inactive';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <EmployeeCardContainer>
      {/* Card Header */}
      <EmployeeCardHeader>
        <Box sx={{ position: 'relative' }}>
          <EmployeeCardAvatar>
            {employee.name.charAt(0).toUpperCase()}
          </EmployeeCardAvatar>
          <EmployeeCardStatusDot status={employee.status} />
        </Box>

        <EmployeeCardActions>
          <EmployeeCardActionBtn
            onClick={() => setShowActions(!showActions)}
            aria-label="Menú de acciones"
            title="Opciones"
          >
            <DotsThreeVertical size={20} weight="bold" />
          </EmployeeCardActionBtn>

          {showActions && (
            <EmployeeCardDropdown>
              <EmployeeCardDropdownItem
                onClick={() => {
                  onEdit(employee.id, employee);
                  setShowActions(false);
                }}
              >
                <PencilSimple size={14} weight="duotone" />
                Editar
              </EmployeeCardDropdownItem>
              
              {employee.status === 'active' ? (
                <EmployeeCardDropdownItem
                  onClick={() => {
                    onStatusChange(employee.id, 'inactive');
                    setShowActions(false);
                  }}
                >
                  <Pause size={14} weight="duotone" />
                  Desactivar
                </EmployeeCardDropdownItem>
              ) : (
                <EmployeeCardDropdownItem
                  onClick={() => {
                    onStatusChange(employee.id, 'active');
                    setShowActions(false);
                  }}
                >
                  <Check size={14} weight="duotone" />
                  Activar
                </EmployeeCardDropdownItem>
              )}

              <EmployeeCardDropdownItem
                className="danger"
                onClick={() => {
                  onDelete(employee.id);
                  setShowActions(false);
                }}
              >
                <Trash size={14} weight="duotone" />
                Eliminar
              </EmployeeCardDropdownItem>
            </EmployeeCardDropdown>
          )}
        </EmployeeCardActions>
      </EmployeeCardHeader>

      {/* Card Body */}
      <EmployeeCardBody>
        {/* Employee Info */}
        <EmployeeCardInfo>
          <EmployeeCardName>{employee.name}</EmployeeCardName>
          
          <EmployeeCardRole>
            {getRoleIcon(employee.role)}
            <span>{getRoleLabel(employee.role)}</span>
          </EmployeeCardRole>

          <EmployeeCardStatus status={employee.status}>
            <EmployeeCardStatusIndicator status={employee.status} />
            {getStatusLabel(employee.status)}
          </EmployeeCardStatus>
        </EmployeeCardInfo>

        {/* Contact Info */}
        <EmployeeCardContact>
          <EmployeeCardContactItem>
            <Envelope size={14} weight="duotone" />
            <EmployeeCardContactText>{employee.email}</EmployeeCardContactText>
          </EmployeeCardContactItem>
          
          {(employee.phoneNumber || employee.phone) && (
            <EmployeeCardContactItem>
              <Phone size={14} weight="duotone" />
              <EmployeeCardContactText>{employee.phoneNumber || employee.phone}</EmployeeCardContactText>
            </EmployeeCardContactItem>
          )}
        </EmployeeCardContact>

        {/* Meta Info */}
        <EmployeeCardMeta>
          <EmployeeCardMetaItem>
            <Calendar size={12} weight="duotone" />
            <EmployeeCardMetaLabel>Creado:</EmployeeCardMetaLabel>
            <EmployeeCardMetaValue>{formatDate(employee.createdAt)}</EmployeeCardMetaValue>
          </EmployeeCardMetaItem>
          
          <EmployeeCardMetaItem>
            <Clock size={12} weight="duotone" />
            <EmployeeCardMetaLabel>Último acceso:</EmployeeCardMetaLabel>
            <EmployeeCardMetaValue>{formatLastLogin(employee.lastLogin)}</EmployeeCardMetaValue>
          </EmployeeCardMetaItem>
        </EmployeeCardMeta>

        {/* Permissions */}
        {employee.permissions && employee.permissions.length > 0 && (
          <Box sx={{ marginTop: '12px' }}>
            <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Permisos:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {employee.permissions.map((permission, index) => (
                <Chip
                  key={index}
                  label={permission}
                  size="small"
                  sx={{
                    fontSize: '10px',
                    height: '24px',
                    background: alpha('#040DBF', 0.1),
                    color: '#040DBF',
                    border: `1px solid ${alpha('#040DBF', 0.2)}`,
                    '& .MuiChip-label': {
                      padding: '0 8px',
                      fontSize: '10px',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </EmployeeCardBody>

      {/* Click overlay to close dropdown */}
      {showActions && (
        <EmployeeCardOverlay
          onClick={() => setShowActions(false)}
        />
      )}
    </EmployeeCardContainer>
  );
};

export default EmployeeCard;
