import React from 'react';
import { 
  FaPlus, 
  FaBoxes, 
  FaChartLine, 
  FaCog, 
  FaFileExport, 
  FaSearch,
  FaTag,
  FaUsers
} from 'react-icons/fa';
import { 
  MdInventory, 
  MdDesignServices, 
  MdCategory,
  MdNotifications 
} from 'react-icons/md';
import { 
  TbTruckDelivery, 
  TbReportAnalytics 
} from 'react-icons/tb';
import './QuickActions.css';

const QuickActions = ({ 
  onCreateProduct,
  onManageInventory,
  onViewReports,
  onManageCategories,
  onViewOrders,
  onCustomDesign,
  onExportData,
  onManageUsers
}) => {
  
  const quickActionsList = [
    {
      id: 'create-product',
      title: 'Nuevo Producto',
      description: 'Agregar producto al catálogo',
      icon: FaPlus,
      color: 'blue',
      action: onCreateProduct,
      primary: true
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Gestionar stock y almacén',
      icon: MdInventory,
      color: 'green',
      action: onManageInventory
    },
    {
      id: 'reports',
      title: 'Reportes',
      description: 'Ver análisis y estadísticas',
      icon: TbReportAnalytics,
      color: 'purple',
      action: onViewReports
    },
    {
      id: 'categories',
      title: 'Categorías',
      description: 'Organizar productos',
      icon: MdCategory,
      color: 'orange',
      action: onManageCategories
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Gestionar pedidos y entregas',
      icon: TbTruckDelivery,
      color: 'indigo',
      action: onViewOrders
    },
    {
      id: 'custom-design',
      title: 'Diseño Custom',
      description: 'Crear pedido personalizado',
      icon: MdDesignServices,
      color: 'pink',
      action: onCustomDesign
    }
  ];

  const secondaryActions = [
    {
      id: 'export-data',
      title: 'Exportar Datos',
      icon: FaFileExport,
      action: onExportData
    },
    {
      id: 'manage-users',
      title: 'Usuarios',
      icon: FaUsers,
      action: onManageUsers
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: MdNotifications,
      action: () => console.log('Ver notificaciones')
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: FaCog,
      action: () => console.log('Abrir configuración')
    }
  ];

  const handleActionClick = (action) => {
    if (typeof action === 'function') {
      action();
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'action-blue',
      green: 'action-green',
      purple: 'action-purple',
      orange: 'action-orange',
      indigo: 'action-indigo',
      pink: 'action-pink',
      red: 'action-red'
    };
    return colorMap[color] || 'action-blue';
  };

  return (
    <div className="quick-actions-section">
      <div className="quick-actions-header">
        <h2 className="section-title">Acciones Rápidas</h2>
        <p className="section-description">
          Herramientas y funciones más utilizadas para gestionar tu negocio
        </p>
      </div>

      {/* Acciones principales */}
      <div className="main-actions-grid">
        {quickActionsList.map((action) => {
          const IconComponent = action.icon;
          return (
            <div
              key={action.id}
              className={`quick-action-card ${getColorClasses(action.color)} ${
                action.primary ? 'primary-action' : ''
              }`}
              onClick={() => handleActionClick(action.action)}
            >
              <div className="action-icon-wrapper">
                <IconComponent className="action-icon" />
                <div className="icon-glow"></div>
              </div>
              
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>

              <div className="action-arrow">→</div>
              <div className="action-bg"></div>
            </div>
          );
        })}
      </div>

      {/* Acciones secundarias */}
      <div className="secondary-actions">
        <h3 className="secondary-title">Herramientas Adicionales</h3>
        <div className="secondary-actions-grid">
          {secondaryActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                className="secondary-action-btn"
                onClick={() => handleActionClick(action.action)}
                title={action.title}
              >
                <IconComponent className="secondary-icon" />
                <span className="secondary-label">{action.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Widget de acceso rápido */}
      <div className="quick-access-widget">
        <div className="widget-header">
          <FaSearch className="widget-icon" />
          <span className="widget-title">Acceso Rápido</span>
        </div>
        <div className="widget-content">
          <div className="quick-links">
            <a href="#" className="quick-link">Productos más </a>
            <a href="#" className="quick-link">Inventario bajo</a>
            <a href="#" className="quick-link">Pedidos pendientes</a>
            <a href="#" className="quick-link">Reportes mensuales</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;