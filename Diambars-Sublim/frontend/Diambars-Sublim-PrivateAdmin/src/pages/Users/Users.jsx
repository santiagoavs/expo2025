// src/pages/Users/Users.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  MagnifyingGlass,
  FunnelSimple,
  UserPlus,
  Shield,
  User,
  Export
} from '@phosphor-icons/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Avatar,
  InputLabel,
  FormControl,
  OutlinedInput
} from '@mui/material';
import UserCard from '../../components/UserCard/UserCard';
import Modal from '../../components/Modal/Modal';
import CreateUserModal from '../../components/CreateUserModal/CreateUserModal';
import UserFilters from '../../components/UserFilters/UserFilters';
import useUsers from '../../hooks/useUsers';
import Swal from 'sweetalert2';

// ================ ESTILOS MODERNOS RESPONSIVE - USERS ================
const UsersPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const UsersContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1200px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1000px',
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

const UsersModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#040DBF', 0.1)}`,
  boxShadow: '0 4px 15px rgba(4, 13, 191, 0.08)',
  transition: 'all 0.3s ease',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(4, 13, 191, 0.15)',
    borderColor: alpha('#040DBF', 0.2),
  }
}));

const UsersHeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '24px',
  padding: '20px 0',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '20px',
  }
}));

const UsersTitleSection = styled(Box)({
  flex: 1,
});

const UsersMainTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '28px',
  fontWeight: '700',
  color: '#010326',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '22px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  }
}));

const UsersSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#64748b',
  margin: 0,
  fontWeight: '500',
  [theme.breakpoints.down('md')]: {
    fontSize: '14px',
  }
}));

const UsersActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '8px',
  }
}));

const UsersBtn = styled(Button)(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(4, 13, 191, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(4, 13, 191, 0.4)',
    }
  } : {
    background: '#ffffff',
    color: '#040DBF',
    border: '2px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(4, 13, 191, 0.1)',
    '&:hover': {
      background: alpha('#040DBF', 0.05),
      borderColor: '#040DBF',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(4, 13, 191, 0.15)',
    }
  })
}));

const UsersStatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '8px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  }
}));

const UsersStatCard = styled(UsersModernCard)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
  [theme.breakpoints.down('md')]: {
    padding: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const UsersStatIcon = styled(Box)(({ variant, theme }) => ({
  width: '52px',
  height: '52px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  ...(variant === 'total' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  } : variant === 'active' ? {
    background: 'linear-gradient(135deg, #10b981, #059669)',
  } : variant === 'admin' ? {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  } : {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  }),
  [theme.breakpoints.down('sm')]: {
    width: '44px',
    height: '44px',
  }
}));

const UsersStatContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const UsersStatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: '700',
  color: '#010326',
  lineHeight: 1,
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
  }
}));

const UsersStatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '600',
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
  }
}));

const UsersControls = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const UsersSearch = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '500px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  }
}));

const UsersSearchIcon = styled(Box)({
  position: 'absolute',
  left: '16px',
  color: '#64748b',
  transition: 'color 0.3s ease',
  zIndex: 2,
});

const UsersSearchInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    paddingLeft: '48px',
    borderRadius: '16px',
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
      boxShadow: '0 0 0 4px rgba(4, 13, 191, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    color: '#010326',
  }
}));

const UsersResults = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 4px',
});

const UsersResultsText = styled(Typography)({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500',
});

const UsersGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '24px',
  marginTop: '8px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  }
}));

const UsersEmpty = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  textAlign: 'center',
  color: '#64748b',
  [theme.breakpoints.down('sm')]: {
    padding: '60px 20px',
  }
}));

const UsersEmptyTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: '600',
  margin: '16px 0 8px 0',
  color: '#334155',
});

const UsersEmptyText = styled(Typography)({
  fontSize: '14px',
  margin: 0,
});

const UsersLoading = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '16px',
  color: '#64748b',
  fontWeight: '500',
});

const UsersError = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '16px',
  color: '#64748b',
  textAlign: 'center',
});

const UsersErrorTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: '600',
  color: '#dc2626',
  margin: 0,
});

const UsersErrorText = styled(Typography)({
  fontSize: '14px',
  margin: 0,
});

const Users = () => {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    getUserStats
  } = useUsers();

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  // Filtrar usuarios por búsqueda y filtros
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;

      // Filtro por fecha (si se implementa)
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const userDate = new Date(user.createdAt);
        const daysDiff = (now - userDate) / (1000 * 60 * 60 * 24);

        switch (filters.dateRange) {
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
          case 'year':
            matchesDate = daysDiff <= 365;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, filters]);

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: `${userData.name} ha sido añadido exitosamente`,
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error creating user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData);

      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Los cambios se han guardado exitosamente',
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `¿Estás seguro de que quieres eliminar a ${user?.name}? Esta acción no se puede deshacer`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteUser(userId);
        
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'El usuario ha sido eliminado exitosamente',
          confirmButtonColor: '#040DBF',
          timer: 2000,
          showConfirmButton: false
        });
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      await updateUserStatus(userId, isActive);

      const statusText = {
        active: 'activado',
        inactive: 'desactivado'
      };

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El usuario ha sido ${statusText[newStatus]}`,
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el estado',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleExportUsers = () => {
    try {
      // Preparar datos para exportar
      const exportData = filteredUsers.map(user => ({
        Nombre: user.name,
        Email: user.email,
        Teléfono: user.phone || 'N/A',
        Rol: user.role,
        Estado: user.status === 'active' ? 'Activo' : 'Inactivo',
        'Fecha de Creación': new Date(user.createdAt).toLocaleDateString('es-ES'),
        'Último Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'
      }));

      // Crear CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header]}"`).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: 'Los usuarios han sido exportados correctamente',
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error exporting users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar la lista de usuarios',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const stats = getUserStats();

  // Mostrar error si hay problemas con la API
  if (error && !loading) {
    return (
      <UsersPageContainer>
        <UsersContentWrapper>
          <UsersError>
            <UsersErrorTitle>Error al cargar usuarios</UsersErrorTitle>
            <UsersErrorText>{error}</UsersErrorText>
            <UsersBtn 
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </UsersBtn>
          </UsersError>
        </UsersContentWrapper>
      </UsersPageContainer>
    );
  }

  if (loading) {
    return (
      <UsersPageContainer>
        <UsersContentWrapper>
          <UsersLoading>
            <CircularProgress size={40} sx={{ color: '#040DBF' }} />
            <span>Cargando usuarios...</span>
          </UsersLoading>
        </UsersContentWrapper>
      </UsersPageContainer>
    );
  }

  return (
    <UsersPageContainer>
      <UsersContentWrapper>
        
        {/* Header */}
        <UsersHeaderSection>
          <UsersTitleSection>
            <UsersMainTitle>
              <UsersIcon size={32} weight="duotone" />
              Gestión de Usuarios
            </UsersMainTitle>
            <UsersSubtitle>
              Administra usuarios, roles y permisos del sistema
            </UsersSubtitle>
          </UsersTitleSection>

          <UsersActions>
            <UsersBtn 
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple size={16} weight="duotone" />
              Filtros
            </UsersBtn>

            <UsersBtn 
              variant="secondary"
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
            >
              <Export size={16} weight="duotone" />
              Exportar
            </UsersBtn>

            <UsersBtn 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={16} weight="duotone" />
              Nuevo Usuario
            </UsersBtn>
          </UsersActions>
        </UsersHeaderSection>

        {/* Stats Cards */}
        <UsersStatsGrid>
          <UsersStatCard>
            <UsersStatIcon variant="total">
              <UsersIcon size={24} weight="duotone" />
            </UsersStatIcon>
            <UsersStatContent>
              <UsersStatNumber>{stats.total}</UsersStatNumber>
              <UsersStatLabel>Total Usuarios</UsersStatLabel>
            </UsersStatContent>
          </UsersStatCard>

          <UsersStatCard>
            <UsersStatIcon variant="active">
              <User size={24} weight="duotone" />
            </UsersStatIcon>
            <UsersStatContent>
              <UsersStatNumber>{stats.active}</UsersStatNumber>
              <UsersStatLabel>Activos</UsersStatLabel>
            </UsersStatContent>
          </UsersStatCard>

          <UsersStatCard>
            <UsersStatIcon variant="admin">
              <Shield size={24} weight="duotone" />
            </UsersStatIcon>
            <UsersStatContent>
              <UsersStatNumber>{stats.admins}</UsersStatNumber>
              <UsersStatLabel>Administradores</UsersStatLabel>
            </UsersStatContent>
          </UsersStatCard>

          <UsersStatCard>
            <UsersStatIcon variant="premium">
              <Shield size={24} weight="duotone" />
            </UsersStatIcon>
            <UsersStatContent>
              <UsersStatNumber>{stats.premium}</UsersStatNumber>
              <UsersStatLabel>Premium</UsersStatLabel>
            </UsersStatContent>
          </UsersStatCard>
        </UsersStatsGrid>

        {/* Search and Filters */}
        <UsersControls>
          <UsersSearch>
            <UsersSearchIcon>
              <MagnifyingGlass size={18} weight="duotone" />
            </UsersSearchIcon>
            <UsersSearchInput
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </UsersSearch>

          {showFilters && (
            <UserFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </UsersControls>

        {/* Results Info */}
        <UsersResults>
          <UsersResultsText>
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </UsersResultsText>
        </UsersResults>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <UsersEmpty>
            <UsersIcon size={64} weight="duotone" />
            <UsersEmptyTitle>No se encontraron usuarios</UsersEmptyTitle>
            <UsersEmptyText>
              {searchQuery || filters.role !== 'all' || filters.status !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay usuarios registrados en el sistema'
              }
            </UsersEmptyText>
          </UsersEmpty>
        ) : (
          <UsersGrid>
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
              />
            ))}
          </UsersGrid>
        )}

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Usuario"
        >
          <CreateUserModal
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

      </UsersContentWrapper>
    </UsersPageContainer>
  );
};

export default Users;