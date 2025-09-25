// src/components/EmployeeFilters/EmployeeFilters.jsx
import React from 'react';
import { 
  User, 
  Crown, 
  Truck,
  Factory,
  Check,
  X,
  Clock,
  Calendar
} from '@phosphor-icons/react';
import './EmployeeFilters.css';

const EmployeeFilters = ({ filters, onFiltersChange }) => {
  
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
    <div className="employee-filters">
      <div className="employee-filters-header">
        <h4 className="employee-filters-title">Filtros de búsqueda</h4>
        {hasActiveFilters() && (
          <button 
            className="employee-filters-reset"
            onClick={resetFilters}
          >
            <X size={14} weight="duotone" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="employee-filters-content">
        
        {/* Filtro por Rol */}
        <div className="employee-filters-group">
          <label className="employee-filters-label">
            <User size={14} weight="duotone" />
            Rol
          </label>
          <div className="employee-filters-options">
            <label className={`employee-filters-option ${filters.role === 'all' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="all"
                checked={filters.role === 'all'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <span>Todos</span>
            </label>
            
            <label className={`employee-filters-option ${filters.role === 'manager' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="manager"
                checked={filters.role === 'manager'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <Crown size={14} weight="duotone" />
              <span>Gerentes</span>
            </label>

            <label className={`employee-filters-option ${filters.role === 'employee' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="employee"
                checked={filters.role === 'employee'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <User size={14} weight="duotone" />
              <span>Empleados</span>
            </label>

            <label className={`employee-filters-option ${filters.role === 'delivery' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="delivery"
                checked={filters.role === 'delivery'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <Truck size={14} weight="duotone" />
              <span>Repartidores</span>
            </label>

            <label className={`employee-filters-option ${filters.role === 'production' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="production"
                checked={filters.role === 'production'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
              <Factory size={14} weight="duotone" />
              <span>Producción</span>
            </label>
          </div>
        </div>

        {/* Filtro por Estado */}
        <div className="employee-filters-group">
          <label className="employee-filters-label">
            <Check size={14} weight="duotone" />
            Estado
          </label>
          <div className="employee-filters-options">
            <label className={`employee-filters-option ${filters.status === 'all' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="all"
                checked={filters.status === 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span>Todos</span>
            </label>
            
            <label className={`employee-filters-option ${filters.status === 'active' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="active"
                checked={filters.status === 'active'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span className="employee-filters-status-dot employee-filters-status-dot--active"></span>
              <span>Activos</span>
            </label>
            
            <label className={`employee-filters-option ${filters.status === 'inactive' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={filters.status === 'inactive'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
              <span className="employee-filters-status-dot employee-filters-status-dot--inactive"></span>
              <span>Inactivos</span>
            </label>
          </div>
        </div>

        {/* Filtro por Fecha */}
        <div className="employee-filters-group">
          <label className="employee-filters-label">
            <Calendar size={14} weight="duotone" />
            Fecha de contratación
          </label>
          <div className="employee-filters-options employee-filters-options--vertical">
            <label className={`employee-filters-option ${filters.dateRange === 'all' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="all"
                checked={filters.dateRange === 'all'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Todas las fechas</span>
            </label>
            
            <label className={`employee-filters-option ${filters.dateRange === 'week' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="week"
                checked={filters.dateRange === 'week'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Última semana</span>
            </label>
            
            <label className={`employee-filters-option ${filters.dateRange === 'month' ? 'employee-filters-option--active' : ''}`}>
              <input
                type="radio"
                name="dateRange"
                value="month"
                checked={filters.dateRange === 'month'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              />
              <span>Último mes</span>
            </label>
            
            <label className={`employee-filters-option ${filters.dateRange === 'year' ? 'employee-filters-option--active' : ''}`}>
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

export default EmployeeFilters;
