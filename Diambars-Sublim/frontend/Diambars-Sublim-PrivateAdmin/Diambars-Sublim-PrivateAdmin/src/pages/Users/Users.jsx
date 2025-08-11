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
import Swal from 'sweetalert2';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  // Datos simulados - reemplazar con llamada a API
  const mockUsers = [
    {
      id: 1,
      name: 'Juan Carlos Pérez',
      email: 'juan.perez@diambars.com',
      role: 'admin',
      status: 'active',
      avatar: null,
      phone: '+503 7894-5612',
      createdAt: '2024-01-15',
      lastLogin: '2024-08-09T10:30:00',
      permissions: ['users', 'orders', 'catalog', 'reports']
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@diambars.com',
      role: 'moderator',
      status: 'active',
      avatar: null,
      phone: '+503 7123-4567',
      createdAt: '2024-02-20',
      lastLogin: '2024-08-08T16:45:00',
      permissions: ['orders', 'catalog']
    },
    {
      id: 3,
      name: 'Roberto Martínez',
      email: 'roberto.martinez@diambars.com',
      role: 'user',
      status: 'inactive',
      avatar: null,
      phone: '+503 7555-8899',
      createdAt: '2024-03-10',
      lastLogin: '2024-07-25T09:15:00',
      permissions: ['catalog']
    },
    {
      id: 4,
      name: 'Ana Sofía Ruiz',
      email: 'ana.ruiz@diambars.com',
      role: 'admin',
      status: 'active',
      avatar: null,
      phone: '+503 7777-1234',
      createdAt: '2024-01-08',
      lastLogin: '2024-08-09T14:20:00',
      permissions: ['users', 'orders', 'catalog', 'reports', 'settings']
    },
    {
      id: 5,
      name: 'Carlos Hernández',
      email: 'carlos.hernandez@diambars.com',
      role: 'moderator',
      status: 'pending',
      avatar: null,
      phone: '+503 7666-9988',
      createdAt: '2024-08-01',
      lastLogin: null,
      permissions: ['orders']
    }
  ];

  // Cargar usuarios al iniciar
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios',
          confirmButtonColor: '#040DBF'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filtrar usuarios por búsqueda y filtros
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, filters]);

  const handleCreateUser = async (userData) => {
    try {
      // Simular creación en API
      const newUser = {
        id: users.length + 1,
        ...userData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null
      };

      setUsers(prev => [newUser, ...prev]);
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
        text: 'No se pudo crear el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));

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
        text: 'No se pudo actualizar el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        
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
        text: 'No se pudo eliminar el usuario',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      const statusText = {
        active: 'activado',
        inactive: 'desactivado',
        pending: 'puesto en espera'
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
        text: 'No se pudo actualizar el estado',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleExportUsers = () => {
    // Simular exportación
    Swal.fire({
      icon: 'info',
      title: 'Exportando usuarios',
      text: 'Se iniciará la descarga en breve...',
      confirmButtonColor: '#040DBF',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const pending = users.filter(u => u.status === 'pending').length;

    return { total, active, admins, pending };
  };

  const stats = getUserStats();

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
            <p>Intenta ajustar los filtros de búsqueda</p>
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