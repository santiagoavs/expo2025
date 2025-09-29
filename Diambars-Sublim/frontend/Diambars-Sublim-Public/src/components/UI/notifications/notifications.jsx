import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import useDesigns from '../../../hooks/useDesign';
import './notifications.css';

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const { needsResponseDesigns } = useDesigns();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Actualiza el contador de notificaciones no leidas
  useEffect(() => {
    if (needsResponseDesigns) {
      const unread = needsResponseDesigns.filter(
        design => !readNotifications.has(design._id)
      ).length;
      setUnreadCount(unread);
    }
  }, [needsResponseDesigns, readNotifications]);

  // Cierra el dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (designId) => {
    // Marca como leida
    setReadNotifications(prev => new Set([...prev, designId]));
    // Navega a design hub
    navigate('/design-hub');
    // Cierra dropdown
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    if (needsResponseDesigns) {
      const allIds = needsResponseDesigns.map(design => design._id);
      setReadNotifications(prev => new Set([...prev, ...allIds]));
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notifications-container" ref={notificationsRef}>
      <button 
        className="notifications-button" 
        onClick={toggleNotifications}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="notifications-icon"
        >
          <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
          <polyline points="15 9 18 9 18 11" />
          <path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0" />
          <line x1="6" x2="7" y1="10" y2="10" />
        </svg>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notificaciones</h3>
            {needsResponseDesigns?.length > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="notifications-list">
            {!isAuthenticated ? (
              <div className="notification-item">
                <div className="notification-content">
                  <p>Inicia sesión para ver notificaciones</p>
                </div>
              </div>
            ) : needsResponseDesigns?.length === 0 ? (
              <div className="notification-item">
                <div className="notification-content">
                  <p>No hay notificaciones nuevas</p>
                </div>
              </div>
            ) : (
              needsResponseDesigns?.map(design => {
                const isUnread = !readNotifications.has(design._id);
                const notificationDate = new Date(design.updatedAt || design.createdAt);
                const timeAgo = getTimeAgo(notificationDate);
                
                return (
                  <div 
                    key={design._id} 
                    className={`notification-item ${isUnread ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(design._id)}
                  >
                    <div className="notification-dot"></div>
                    <div className="notification-content">
                      <p>Diseño necesita respuesta: {design.name || 'Sin nombre'}</p>
                      <span className="notification-time">{timeAgo}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {isAuthenticated && needsResponseDesigns?.length > 0 && (
            <div className="notifications-footer">
              <a href="/design-hub">Ver todos los diseños</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Función auxiliar para formatear el tiempo
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `Hace ${interval} año${interval === 1 ? '' : 's'}`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `Hace ${interval} mes${interval === 1 ? '' : 'es'}`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `Hace ${interval} día${interval === 1 ? '' : 's'}`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `Hace ${interval} hora${interval === 1 ? '' : 's'}`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `Hace ${interval} minuto${interval === 1 ? '' : 's'}`;
  
  return 'Hace unos segundos';
}
