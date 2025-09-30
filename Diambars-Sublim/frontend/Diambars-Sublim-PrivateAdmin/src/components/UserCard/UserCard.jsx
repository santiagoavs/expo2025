// src/components/UserCard/UserCard.jsx
import React, { useState } from 'react';
import { 
  PencilSimple, 
  Trash, 
  DotsThreeVertical,
  EnvelopeSimple,
  Phone,
  Calendar,
  Clock,
  Shield,
  User,
  Crown,
  Check,
  X,
  Pause,
  List
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
  TextField,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  styled,
  useTheme,
  alpha,
  Paper,
  Divider
} from '@mui/material';

// ================ ESTILOS MODERNOS RESPONSIVE - USER CARD ================
const UserCardContainer = styled(Card)(({ theme }) => ({
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

const UserCardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '24px 24px 0 24px',
  position: 'relative',
});

const UserCardAvatar = styled(Avatar)(({ theme }) => ({
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

const UserCardStatusDot = styled(Box)(({ status, theme }) => ({
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
    animation: 'userCardPulse 2s ease-in-out infinite',
  } : status === 'pending' ? {
    background: '#f59e0b',
    animation: 'userCardPulse 2s ease-in-out infinite',
  } : {
    background: '#64748b',
  }),
  [theme.breakpoints.down('sm')]: {
    width: '12px',
    height: '12px',
    borderWidth: '2px',
  }
}));

const UserCardActions = styled(Box)({
  position: 'relative',
});

const UserCardActionBtn = styled(IconButton)(({ theme }) => ({
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

const UserCardDropdown = styled(Paper)(({ theme }) => ({
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
  animation: 'userCardDropdownEnter 0.2s ease-out',
}));

const UserCardDropdownItem = styled(MenuItem)(({ theme }) => ({
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

const UserCardBody = styled(Box)({
  padding: '16px 24px 24px 24px',
});

const UserCardInfo = styled(Box)({
  marginBottom: '20px',
});

const UserCardName = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: '700',
  color: '#010326',
  margin: '0 0 8px 0',
  lineHeight: 1.3,
  [theme.breakpoints.down('md')]: {
    fontSize: '16px',
  }
}));

const UserCardRole = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#040DBF',
});

const UserCardStatus = styled(Box)(({ status }) => ({
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

const UserCardStatusIndicator = styled(Box)(({ status }) => ({
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

const UserCardContact = styled(Box)({
  marginBottom: '16px',
});

const UserCardContactItem = styled(Box)({
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

const UserCardContactText = styled(Typography)({
  color: '#334155',
  fontWeight: '500',
  wordBreak: 'break-all',
  fontSize: '13px',
});

const UserCardMeta = styled(Box)({
  marginBottom: '16px',
  padding: '12px',
  background: 'rgba(248, 250, 252, 0.6)',
  borderRadius: '10px',
  border: `1px solid ${alpha('#040DBF', 0.05)}`,
});

const UserCardMetaItem = styled(Box)({
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

const UserCardMetaLabel = styled(Typography)({
  color: '#64748b',
  fontWeight: '600',
  minWidth: '60px',
  fontSize: '11px',
});

const UserCardMetaValue = styled(Typography)({
  color: '#334155',
  fontWeight: '500',
  fontSize: '11px',
});

const UserCardPermissions = styled(Box)({
  marginTop: '12px',
});

const UserCardPermissionsLabel = styled(Typography)({
  display: 'block',
  fontSize: '11px',
  color: '#64748b',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px',
});

const UserCardPermissionsList = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

const UserCardPermissionTag = styled(Chip)({
  padding: '4px 8px',
  background: alpha('#040DBF', 0.1),
  color: '#040DBF',
  fontSize: '10px',
  fontWeight: '600',
  borderRadius: '6px',
  textTransform: 'capitalize',
  border: `1px solid ${alpha('#040DBF', 0.2)}`,
  height: 'auto',
  '& .MuiChip-label': {
    padding: '0',
    fontSize: '10px',
  }
});

const UserCardEditForm = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const UserCardField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

const UserCardLabel = styled(Typography)({
  fontSize: '12px',
  fontWeight: '600',
  color: '#334155',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const UserCardInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    padding: '10px 12px',
    background: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#040DBF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#040DBF',
      boxShadow: '0 0 0 3px rgba(4, 13, 191, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    color: '#010326',
    padding: 0,
  }
}));

const UserCardSelect = styled(Select)(({ theme }) => ({
  padding: '10px 12px',
  background: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  '& fieldset': {
    borderColor: '#e2e8f0',
    borderWidth: '2px',
  },
  '&:hover fieldset': {
    borderColor: '#040DBF',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#040DBF',
    boxShadow: '0 0 0 3px rgba(4, 13, 191, 0.1)',
  },
  '& .MuiSelect-select': {
    color: '#010326',
  }
}));

const UserCardEditActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  }
}));

const UserCardBtn = styled(Button)(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  flex: 1,
  justifyContent: 'center',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
    color: '#ffffff',
    '&:hover': {
      background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
      transform: 'translateY(-1px)',
    }
  } : {
    background: '#ffffff',
    color: '#64748b',
    borderColor: '#e2e8f0',
    '&:hover': {
      background: '#f8fafc',
      color: '#334155',
      borderColor: '#cbd5e1',
    }
  })
}));

const UserCardOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  zIndex: 5,
});

const UserCard = ({ user, onEdit, onDelete, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || user.phone || '', // Manejar ambos campos
    role: user.role
  });

  const handleEditSubmit = () => {
    // Preparar datos para envío
    const dataToSubmit = {
      name: editData.name,
      email: editData.email,
      phoneNumber: editData.phoneNumber, // Usar phoneNumber para backend
      role: editData.role
    };
    
    console.log('[UserCard] Enviando datos de edición:', dataToSubmit);
    
    onEdit(user.id, dataToSubmit);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || user.phone || '',
      role: user.role
    });
    setIsEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} weight="duotone" />;
      case 'premium':
        return <Crown size={16} weight="duotone" />;
      case 'customer':
      default:
        return <User size={16} weight="duotone" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'premium':
        return 'Premium';
      case 'customer':
      default:
        return 'Cliente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'user-card-status--active';
      case 'inactive':
        return 'user-card-status--inactive';
      default:
        return 'user-card-status--inactive';
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
    <UserCardContainer>
      {/* Card Header */}
      <UserCardHeader>
        <Box sx={{ position: 'relative' }}>
          <UserCardAvatar>
            {user.name.charAt(0).toUpperCase()}
          </UserCardAvatar>
          <UserCardStatusDot status={user.status} />
        </Box>

        <UserCardActions>
          <UserCardActionBtn
            onClick={() => setShowActions(!showActions)}
            aria-label="Menú de acciones"
            title="Opciones"
          >
            <DotsThreeVertical size={20} weight="bold" />
          </UserCardActionBtn>

          {showActions && (
            <UserCardDropdown>
              <UserCardDropdownItem
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
              >
                <PencilSimple size={14} weight="duotone" />
                Editar
              </UserCardDropdownItem>
              
              {user.status === 'active' ? (
                <UserCardDropdownItem
                  onClick={() => {
                    onStatusChange(user.id, 'inactive');
                    setShowActions(false);
                  }}
                >
                  <Pause size={14} weight="duotone" />
                  Desactivar
                </UserCardDropdownItem>
              ) : (
                <UserCardDropdownItem
                  onClick={() => {
                    onStatusChange(user.id, 'active');
                    setShowActions(false);
                  }}
                >
                  <Check size={14} weight="duotone" />
                  Activar
                </UserCardDropdownItem>
              )}

              <UserCardDropdownItem
                className="danger"
                onClick={() => {
                  onDelete(user.id);
                  setShowActions(false);
                }}
              >
                <Trash size={14} weight="duotone" />
                Eliminar
              </UserCardDropdownItem>
            </UserCardDropdown>
          )}
        </UserCardActions>
      </UserCardHeader>

      {/* Card Body */}
      <UserCardBody>
        {isEditing ? (
          <UserCardEditForm>
            <UserCardField>
              <UserCardLabel>Nombre</UserCardLabel>
              <UserCardInput
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </UserCardField>

            <UserCardField>
              <UserCardLabel>Email</UserCardLabel>
              <UserCardInput
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
              />
            </UserCardField>

            <UserCardField>
              <UserCardLabel>Teléfono</UserCardLabel>
              <UserCardInput
                type="tel"
                value={editData.phoneNumber}
                onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                placeholder="12345678"
                inputProps={{ maxLength: 8 }}
              />
            </UserCardField>

            <UserCardField>
              <UserCardLabel>Rol</UserCardLabel>
              <FormControl fullWidth>
                <UserCardSelect
                  value={editData.role}
                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                >
                  <MenuItem value="customer">Cliente</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </UserCardSelect>
              </FormControl>
            </UserCardField>

            <UserCardEditActions>
              <UserCardBtn 
                variant="primary"
                onClick={handleEditSubmit}
              >
                <Check size={14} weight="duotone" />
                Guardar
              </UserCardBtn>
              <UserCardBtn 
                variant="secondary"
                onClick={handleEditCancel}
              >
                <X size={14} weight="duotone" />
                Cancelar
              </UserCardBtn>
            </UserCardEditActions>
          </UserCardEditForm>
        ) : (
          <>
            {/* User Info */}
            <UserCardInfo>
              <UserCardName>{user.name}</UserCardName>
              
              <UserCardRole>
                {getRoleIcon(user.role)}
                <span>{getRoleLabel(user.role)}</span>
              </UserCardRole>

              <UserCardStatus status={user.status}>
                <UserCardStatusIndicator status={user.status} />
                {getStatusLabel(user.status)}
              </UserCardStatus>
            </UserCardInfo>

            {/* Contact Info */}
            <UserCardContact>
              <UserCardContactItem>
                <EnvelopeSimple size={14} weight="duotone" />
                <UserCardContactText>{user.email}</UserCardContactText>
              </UserCardContactItem>
              
              {(user.phoneNumber || user.phone) && (
                <UserCardContactItem>
                  <Phone size={14} weight="duotone" />
                  <UserCardContactText>{user.phoneNumber || user.phone}</UserCardContactText>
                </UserCardContactItem>
              )}
            </UserCardContact>

            {/* Meta Info */}
            <UserCardMeta>
              <UserCardMetaItem>
                <Calendar size={12} weight="duotone" />
                <UserCardMetaLabel>Creado:</UserCardMetaLabel>
                <UserCardMetaValue>{formatDate(user.createdAt)}</UserCardMetaValue>
              </UserCardMetaItem>
              
              <UserCardMetaItem>
                <Clock size={12} weight="duotone" />
                <UserCardMetaLabel>Último acceso:</UserCardMetaLabel>
                <UserCardMetaValue>{formatLastLogin(user.lastLogin)}</UserCardMetaValue>
              </UserCardMetaItem>
            </UserCardMeta>

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
              <UserCardPermissions>
                <UserCardPermissionsLabel>Permisos:</UserCardPermissionsLabel>
                <UserCardPermissionsList>
                  {user.permissions.map((permission, index) => (
                    <UserCardPermissionTag
                      key={index}
                      label={permission}
                      size="small"
                    />
                  ))}
                </UserCardPermissionsList>
              </UserCardPermissions>
            )}
          </>
        )}
      </UserCardBody>

      {/* Click overlay to close dropdown */}
      {showActions && (
        <UserCardOverlay
          onClick={() => setShowActions(false)}
        />
      )}
    </UserCardContainer>
  );
};

export default UserCard;