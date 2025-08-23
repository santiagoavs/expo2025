// src/pages/Employees/Employees.jsx
import React, { useState, useEffect } from 'react';
import { 
  UserList, 
  Plus, 
  MagnifyingGlass,
  FunnelSimple,
  UserPlus,
  Shield,
  User,
  Export,
  Buildings,
  CheckCircle
} from '@phosphor-icons/react';
import UserCard from '../../components/UserCard/UserCard';
import Modal from '../../components/Modal/Modal';
import CreateUserModal from '../../components/CreateUserModal/CreateUserModal';
import UserFilters from '../../components/UserFilters/UserFilters';
import useUsers from '../../hooks/useUsers';
import Swal from 'sweetalert2';
import './Employees.css';

const Employees = () => {
  const {
    users: employees,
    loading,
    error,
    createUser: createEmployee,
    updateUser: updateEmployee,
    updateUserStatus: updateEmployeeStatus,
    deleteUser: deleteEmployee,
    getUserStats: getEmployeeStats
  } = useUsers();

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  // Filtrar empleados por búsqueda y filtros
  useEffect(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.phone && employee.phone.includes(searchQuery));

      const matchesRole = filters.role === 'all' || employee.role === filters.role;
      const matchesStatus = filters.status === 'all' || employee.status === filters.status;

      // Filtro por fecha (si se implementa)
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const employeeDate = new Date(employee.createdAt);
        const daysDiff = (now - employeeDate) / (1000 * 60 * 60 * 24);

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

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filters]);

  const handleCreateEmployee = async (employeeData) => {
    try {
      await createEmployee(employeeData);
      setShowCreateModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Empleado creado',
        text: `${employeeData.name} ha sido añadido exitosamente`,
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error creating employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear el empleado',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleEditEmployee = async (employeeId, employeeData) => {
    try {
      await updateEmployee(employeeId, employeeData);

      Swal.fire({
        icon: 'success',
        title: 'Empleado actualizado',
        text: 'Los cambios se han guardado exitosamente',
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error updating employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el empleado',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const employee = employees.find(e => e.id === employeeId);
      const result = await Swal.fire({
        title: '¿Eliminar empleado?',
        text: `¿Estás seguro de que quieres eliminar a ${employee?.name}? Esta acción no se puede deshacer`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteEmployee(employeeId);
        
        Swal.fire({
          icon: 'success',
          title: 'Empleado eliminado',
          text: 'El empleado ha sido eliminado exitosamente',
          confirmButtonColor: '#040DBF',
          timer: 2000,
          showConfirmButton: false
        });
      }

    } catch (error) {
      console.error('Error deleting employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el empleado',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      await updateEmployeeStatus(employeeId, isActive);

      const statusText = {
        active: 'activado',
        inactive: 'desactivado'
      };

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El empleado ha sido ${statusText[newStatus]}`,
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

  const handleExportEmployees = () => {
    try {
      // Preparar datos para exportar
      const exportData = filteredEmployees.map(employee => ({
        Nombre: employee.name,
        Email: employee.email,
        Teléfono: employee.phone || 'N/A',
        Departamento: employee.department || 'N/A',
        Posición: employee.position || 'N/A',
        Estado: employee.status === 'active' ? 'Activo' : 'Inactivo',
        'Fecha de Contratación': new Date(employee.hireDate || employee.createdAt).toLocaleDateString('es-ES'),
        Salario: employee.salary ? `$${employee.salary}` : 'N/A'
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
      link.setAttribute('download', `empleados_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: 'Los empleados han sido exportados correctamente',
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error exporting employees:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar la lista de empleados',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const stats = getEmployeeStats();

  // Mostrar error si hay problemas con la API
  if (error && !loading) {
    return (
      <div className="employees-admin-page">
        <div className="employees-admin-error">
          <h3>Error al cargar empleados</h3>
          <p>{error}</p>
          <button 
            className="employees-admin-btn employees-admin-btn--primary"
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
      <div className="employees-admin-page">
        <div className="employees-admin-loading">
          <div className="employees-admin-spinner"></div>
          <span>Cargando empleados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-admin-page">
      <div className="employees-admin-container">
        
        {/* Header */}
        <div className="employees-admin-header">
          <div className="employees-admin-title-section">
            <h1 className="employees-admin-title">
              <UserList size={32} weight="duotone" />
              Gestión de Empleados
            </h1>
            <p className="employees-admin-subtitle">
              Administra empleados, departamentos y posiciones de la empresa
            </p>
          </div>

          <div className="employees-admin-actions">
            <button 
              className="employees-admin-btn employees-admin-btn--secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple size={16} weight="duotone" />
              Filtros
            </button>

            <button 
              className="employees-admin-btn employees-admin-btn--secondary"
              onClick={handleExportEmployees}
              disabled={filteredEmployees.length === 0}
            >
              <Export size={16} weight="duotone" />
              Exportar
            </button>

            <button 
              className="employees-admin-btn employees-admin-btn--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={16} weight="duotone" />
              Nuevo Empleado
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="employees-admin-stats">
          <div className="employees-admin-stat-card">
            <div className="employees-admin-stat-icon employees-admin-stat-icon--total">
              <UserList size={24} weight="duotone" />
            </div>
            <div className="employees-admin-stat-content">
              <span className="employees-admin-stat-number">{stats.total}</span>
              <span className="employees-admin-stat-label">Total Empleados</span>
            </div>
          </div>

          <div className="employees-admin-stat-card">
            <div className="employees-admin-stat-icon employees-admin-stat-icon--active">
              <CheckCircle size={24} weight="duotone" />
            </div>
            <div className="employees-admin-stat-content">
              <span className="employees-admin-stat-number">{stats.active}</span>
              <span className="employees-admin-stat-label">Activos</span>
            </div>
          </div>

          <div className="employees-admin-stat-card">
            <div className="employees-admin-stat-icon employees-admin-stat-icon--departments">
              <Buildings size={24} weight="duotone" />
            </div>
            <div className="employees-admin-stat-content">
              <span className="employees-admin-stat-number">{stats.departments || 0}</span>
              <span className="employees-admin-stat-label">Departamentos</span>
            </div>
          </div>

          <div className="employees-admin-stat-card">
            <div className="employees-admin-stat-icon employees-admin-stat-icon--managers">
              <Shield size={24} weight="duotone" />
            </div>
            <div className="employees-admin-stat-content">
              <span className="employees-admin-stat-number">{stats.managers || 0}</span>
              <span className="employees-admin-stat-label">Supervisores</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="employees-admin-controls">
          <div className="employees-admin-search">
            <MagnifyingGlass className="employees-admin-search-icon" size={18} weight="duotone" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="employees-admin-search-input"
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
        <div className="employees-admin-results">
          <span className="employees-admin-results-text">
            {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? 's' : ''} encontrado{filteredEmployees.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Employees Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="employees-admin-empty">
            <UserList size={64} weight="duotone" />
            <h3>No se encontraron empleados</h3>
            <p>
              {searchQuery || filters.role !== 'all' || filters.status !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay empleados registrados en el sistema'
              }
            </p>
          </div>
        ) : (
          <div className="employees-admin-grid">
            {filteredEmployees.map(employee => (
              <UserCard
                key={employee.id}
                user={employee}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Create Employee Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Empleado"
        >
          <CreateUserModal
            onSubmit={handleCreateEmployee}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

      </div>
    </div>
  );
};

export default Employees;