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
  Pause
} from '@phosphor-icons/react';
import './UserCard.css';

const UserCard = ({ user, onEdit, onDelete, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
  });

  const handleEditSubmit = () => {
    onEdit(user.id, editData);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setIsEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} weight="duotone" />;
      case 'moderator':
        return <Shield size={16} weight="duotone" />;
      default:
        return <User size={16} weight="duotone" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Usuario';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'user-card-status--active';
      case 'inactive':
        return 'user-card-status--inactive';
      case 'pending':
        return 'user-card-status--pending';
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
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
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
    <div className="user-card">
      {/* Card Header */}
      <div className="user-card-header">
        <div className="user-card-avatar">
          <span className="user-card-avatar-text">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className={`user-card-status-dot ${getStatusColor(user.status)}`}></div>
        </div>

        <div className="user-card-actions">
          <button 
            className="user-card-action-btn"
            onClick={() => setShowActions(!showActions)}
          >
            <h4>X</h4>
          </button>

          {showActions && (
            <div className="user-card-dropdown">
              <button 
                className="user-card-dropdown-item"
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
              >
                <PencilSimple size={14} weight="duotone" />
                Editar
              </button>
              
              {user.status === 'active' ? (
                <button 
                  className="user-card-dropdown-item"
                  onClick={() => {
                    onStatusChange(user.id, 'inactive');
                    setShowActions(false);
                  }}
                >
                  <Pause size={14} weight="duotone" />
                  Desactivar
                </button>
              ) : (
                <button 
                  className="user-card-dropdown-item"
                  onClick={() => {
                    onStatusChange(user.id, 'active');
                    setShowActions(false);
                  }}
                >
                  <Check size={14} weight="duotone" />
                  Activar
                </button>
              )}

              <button 
                className="user-card-dropdown-item user-card-dropdown-item--danger"
                onClick={() => {
                  onDelete(user.id);
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
      <div className="user-card-body">
        {isEditing ? (
          <div className="user-card-edit-form">
            <div className="user-card-field">
              <label className="user-card-label">Nombre</label>
              <input
                type="text"
                className="user-card-input"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>

            <div className="user-card-field">
              <label className="user-card-label">Email</label>
              <input
                type="email"
                className="user-card-input"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
              />
            </div>

            <div className="user-card-field">
              <label className="user-card-label">Teléfono</label>
              <input
                type="tel"
                className="user-card-input"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
              />
            </div>

            <div className="user-card-field">
              <label className="user-card-label">Rol</label>
              <select
                className="user-card-select"
                value={editData.role}
                onChange={(e) => setEditData({...editData, role: e.target.value})}
              >
                <option value="user">Usuario</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="user-card-edit-actions">
              <button 
                className="user-card-btn user-card-btn--primary"
                onClick={handleEditSubmit}
              >
                <Check size={14} weight="duotone" />
                Guardar
              </button>
              <button 
                className="user-card-btn user-card-btn--secondary"
                onClick={handleEditCancel}
              >
                <X size={14} weight="duotone" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="user-card-info">
              <h3 className="user-card-name">{user.name}</h3>
              
              <div className="user-card-role">
                {getRoleIcon(user.role)}
                <span>{getRoleLabel(user.role)}</span>
              </div>

              <div className={`user-card-status ${getStatusColor(user.status)}`}>
                <span className="user-card-status-indicator"></span>
                {getStatusLabel(user.status)}
              </div>
            </div>

            {/* Contact Info */}
            <div className="user-card-contact">
              <div className="user-card-contact-item">
                <EnvelopeSimple size={14} weight="duotone" />
                <span className="user-card-contact-text">{user.email}</span>
              </div>
              
              <div className="user-card-contact-item">
                <Phone size={14} weight="duotone" />
                <span className="user-card-contact-text">{user.phone}</span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="user-card-meta">
              <div className="user-card-meta-item">
                <Calendar size={12} weight="duotone" />
                <span className="user-card-meta-label">Creado:</span>
                <span className="user-card-meta-value">{formatDate(user.createdAt)}</span>
              </div>
              
              <div className="user-card-meta-item">
                <Clock size={12} weight="duotone" />
                <span className="user-card-meta-label">Último acceso:</span>
                <span className="user-card-meta-value">{formatLastLogin(user.lastLogin)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Click overlay to close dropdown */}
      {showActions && (
        <div 
          className="user-card-overlay"
          onClick={() => setShowActions(false)}
        ></div>
      )}
    </div>
  );
};

export default UserCard;