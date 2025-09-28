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
import './EmployeeCard.css';

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
    <div className="employee-card">
      {/* Card Header */}
      <div className="employee-card-header">
        <div className="employee-card-avatar">
          <span className="employee-card-avatar-text">
            {employee.name.charAt(0).toUpperCase()}
          </span>
          <div className={`employee-card-status-dot ${getStatusColor(employee.status)}`}></div>
        </div>

        <div className="employee-card-actions">
          <button 
            className="employee-card-action-btn"
            onClick={() => setShowActions(!showActions)}
            aria-label="Menú de acciones"
            title="Opciones"
          >
            <DotsThreeVertical size={20} weight="bold" />
          </button>

          {showActions && (
            <div className="employee-card-dropdown">
              <button 
                className="employee-card-dropdown-item"
                onClick={() => {
                  onEdit(employee.id, employee);
                  setShowActions(false);
                }}
              >
                <PencilSimple size={14} weight="duotone" />
                Editar
              </button>
              
              {employee.status === 'active' ? (
                <button 
                  className="employee-card-dropdown-item"
                  onClick={() => {
                    onStatusChange(employee.id, 'inactive');
                    setShowActions(false);
                  }}
                >
                  <Pause size={14} weight="duotone" />
                  Desactivar
                </button>
              ) : (
                <button 
                  className="employee-card-dropdown-item"
                  onClick={() => {
                    onStatusChange(employee.id, 'active');
                    setShowActions(false);
                  }}
                >
                  <Check size={14} weight="duotone" />
                  Activar
                </button>
              )}

              <button 
                className="employee-card-dropdown-item employee-card-dropdown-item--danger"
                onClick={() => {
                  onDelete(employee.id);
                  setShowActions(false);
                }}
              >
                <Trash size={14} weight="duotone" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="employee-card-body">
        {/* Employee Info */}
        <div className="employee-card-info">
          <h3 className="employee-card-name">{employee.name}</h3>
          
          <div className="employee-card-role">
            {getRoleIcon(employee.role)}
            <span>{getRoleLabel(employee.role)}</span>
          </div>

          <div className={`employee-card-status ${getStatusColor(employee.status)}`}>
            <span className="employee-card-status-indicator"></span>
            {getStatusLabel(employee.status)}
          </div>
        </div>

        {/* Contact Info */}
        <div className="employee-card-contact">
          <div className="employee-card-contact-item">
            <Envelope size={14} weight="duotone" />
            <span className="employee-card-contact-text">{employee.email}</span>
          </div>
          
          {(employee.phoneNumber || employee.phone) && (
            <div className="employee-card-contact-item">
              <Phone size={14} weight="duotone" />
              <span className="employee-card-contact-text">{employee.phoneNumber || employee.phone}</span>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="employee-card-meta">
          <div className="employee-card-meta-item">
            <Calendar size={12} weight="duotone" />
            <span className="employee-card-meta-label">Creado:</span>
            <span className="employee-card-meta-value">{formatDate(employee.createdAt)}</span>
          </div>
          
          <div className="employee-card-meta-item">
            <Clock size={12} weight="duotone" />
            <span className="employee-card-meta-label">Último acceso:</span>
            <span className="employee-card-meta-value">{formatLastLogin(employee.lastLogin)}</span>
          </div>
        </div>

        {/* Permissions */}
        {employee.permissions && employee.permissions.length > 0 && (
          <div className="employee-card-permissions">
            <span className="employee-card-permissions-label">Permisos:</span>
            <div className="employee-card-permissions-list">
              {employee.permissions.map((permission, index) => (
                <span key={index} className="employee-card-permission-tag">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click overlay to close dropdown */}
      {showActions && (
        <div 
          className="employee-card-overlay"
          onClick={() => setShowActions(false)}
        ></div>
      )}
    </div>
  );
};

export default EmployeeCard;
