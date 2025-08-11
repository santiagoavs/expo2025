// src/components/UserFilters/UserFilters.jsx
import React from 'react';
import { 
  User, 
  Shield, 
  Crown,
  Check,
  X,
  Clock,
  Calendar
} from '@phosphor-icons/react';
import './UserFilters.css';

const UserFilters = ({ filters, onFiltersChange }) => {
  
  const handleFilterChange = (filterType, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      role: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.role !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all';
  };

  return (
    <div className="user-filters">
      <div className="user-filters-header">
        <h4 className="user-filters-title">Filtros de búsqueda</h4>
        {hasActiveFilters() && (
          <button 
            className="user-filters-reset"
            onClick={resetFilters}
          >
            <X size={14} weight="duotone" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="user-filters-content">
        
        {/* Filtro por Rol */}
        <div className="user-filters-group">
          <label className="user-filters-label">
            <Shield size={14} weight="duotone" />
            Rol
          </label>
          <div className="user-filters-options">
            <label className={`user-filters-option ${filters.role === 'all' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="all"
                checked={filters.role === 'all'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <span>Todos</span>
            </label>
            
            <label className={`user-filters-option ${filters.role === 'admin' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={filters.role === 'admin'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <Crown size={14} weight="duotone" />
              <span>Administradores</span>
            </label>
        
            <label className={`user-filters-option ${filters.role === 'user' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={filters.role === 'user'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <User size={14} weight="duotone" />
              <span>Usuarios</span>
            </label>
          </div>
        </div>

        {/* Filtro por Estado */}
        <div className="user-filters-group">
          <label className="user-filters-label">
            <Check size={14} weight="duotone" />
            Estado
          </label>
          <div className="user-filters-options">
            <label className={`user-filters-option ${filters.status === 'all' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="all"
                checked={filters.status === 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span>Todos</span>
            </label>
            
            <label className={`user-filters-option ${filters.status === 'active' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="active"
                checked={filters.status === 'active'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span className="user-filters-status-dot user-filters-status-dot--active"></span>
              <span>Activos</span>
            </label>
            
            <label className={`user-filters-option ${filters.status === 'inactive' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={filters.status === 'inactive'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span className="user-filters-status-dot user-filters-status-dot--inactive"></span>
              <span>Inactivos</span>
            </label>
          </div>
        </div>

        {/* Filtro por Fecha */}
        <div className="user-filters-group">
          <label className="user-filters-label">
            <Calendar size={14} weight="duotone" />
            Fecha de registro
          </label>
          <div className="user-filters-options user-filters-options--vertical">
            <label className={`user-filters-option ${filters.dateRange === 'all' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="all"
                checked={filters.dateRange === 'all'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Todas las fechas</span>
            </label>
            
            <label className={`user-filters-option ${filters.dateRange === 'today' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="today"
                checked={filters.dateRange === 'today'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Hoy</span>
            </label>
            
            <label className={`user-filters-option ${filters.dateRange === 'week' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="week"
                checked={filters.dateRange === 'week'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Última semana</span>
            </label>
            
            <label className={`user-filters-option ${filters.dateRange === 'month' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="month"
                checked={filters.dateRange === 'month'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Último mes</span>
            </label>
            
            <label className={`user-filters-option ${filters.dateRange === 'year' ? 'user-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="year"
                checked={filters.dateRange === 'year'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Último año</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserFilters;