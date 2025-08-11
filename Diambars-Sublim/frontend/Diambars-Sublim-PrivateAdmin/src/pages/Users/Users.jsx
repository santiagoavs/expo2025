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
import UserCard from '../../components/UserCard/UserCard';
import Modal from '../../components/Modal/Modal';
import CreateUserModal from '../../components/CreateUserModal/CreateUserModal';
import UserFilters from '../../components/UserFilters/UserFilters';
import useUsers from '../../hooks/useUsers';
import Swal from 'sweetalert2';
import './Users.css';

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
      <div className="users-admin-page">
        <div className="users-admin-error">
          <h3>Error al cargar usuarios</h3>
          <p>{error}</p>
          <button 
            className="users-admin-btn users-admin-btn--primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="users-admin-page">
        <div className="users-admin-loading">
          <div className="users-admin-spinner"></div>
          <span>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="users-admin-page">
      <div className="users-admin-container">
        
        {/* Header */}
        <div className="users-admin-header">
          <div className="users-admin-title-section">
            <h1 className="users-admin-title">
              <UsersIcon size={32} weight="duotone" />
              Gestión de Usuarios
            </h1>
            <p className="users-admin-subtitle">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>

          <div className="users-admin-actions">
            <button 
              className="users-admin-btn users-admin-btn--secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple size={16} weight="duotone" />
              Filtros
            </button>

            <button 
              className="users-admin-btn users-admin-btn--secondary"
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
            >
              <Export size={16} weight="duotone" />
              Exportar
            </button>

            <button 
              className="users-admin-btn users-admin-btn--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={16} weight="duotone" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="users-admin-stats">
          <div className="users-admin-stat-card">
            <div className="users-admin-stat-icon users-admin-stat-icon--total">
              <UsersIcon size={24} weight="duotone" />
            </div>
            <div className="users-admin-stat-content">
              <span className="users-admin-stat-number">{stats.total}</span>
              <span className="users-admin-stat-label">Total Usuarios</span>
            </div>
          </div>

          <div className="users-admin-stat-card">
            <div className="users-admin-stat-icon users-admin-stat-icon--active">
              <User size={24} weight="duotone" />
            </div>
            <div className="users-admin-stat-content">
              <span className="users-admin-stat-number">{stats.active}</span>
              <span className="users-admin-stat-label">Activos</span>
            </div>
          </div>

          <div className="users-admin-stat-card">
            <div className="users-admin-stat-icon users-admin-stat-icon--admin">
              <Shield size={24} weight="duotone" />
            </div>
            <div className="users-admin-stat-content">
              <span className="users-admin-stat-number">{stats.admins}</span>
              <span className="users-admin-stat-label">Administradores</span>
            </div>
          </div>

          <div className="users-admin-stat-card">
            <div className="users-admin-stat-icon users-admin-stat-icon--premium">
              <Shield size={24} weight="duotone" />
            </div>
            <div className="users-admin-stat-content">
              <span className="users-admin-stat-number">{stats.premium}</span>
              <span className="users-admin-stat-label">Premium</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="users-admin-controls">
          <div className="users-admin-search">
            <MagnifyingGlass className="users-admin-search-icon" size={18} weight="duotone" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="users-admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {showFilters && (
            <UserFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </div>

        {/* Results Info */}
        <div className="users-admin-results">
          <span className="users-admin-results-text">
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="users-admin-empty">
            <UsersIcon size={64} weight="duotone" />
            <h3>No se encontraron usuarios</h3>
            <p>
              {searchQuery || filters.role !== 'all' || filters.status !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay usuarios registrados en el sistema'
              }
            </p>
          </div>
        ) : (
          <div className="users-admin-grid">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
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

      </div>
    </div>
  );
};

export default Users;