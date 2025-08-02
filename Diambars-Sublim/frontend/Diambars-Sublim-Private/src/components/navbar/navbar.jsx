import React, { useState, useEffect } from "react";
import { IoLogOutOutline, IoSearchOutline } from 'react-icons/io5';
import { FaBars, FaTimes, FaChartBar, FaStar, FaCog, FaLayerGroup } from 'react-icons/fa';
import { MdDashboard, MdDesignServices } from 'react-icons/md';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from "sweetalert2";
import "./Navbar.css";
 
const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
 
  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
 
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#FFF6E2',
      color: '#2C2C2C',
      customClass: {
        popup: 'diambars-swal-popup',
        confirmButton: 'diambars-swal-confirm',
        cancelButton: 'diambars-swal-cancel'
      }
    });
 
    if (result.isConfirmed) {
      try {
        await logout();
       
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Sesión cerrada correctamente',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          background: 'linear-gradient(135deg, #F0D8AB 0%, #FFF6E2 100%)',
          color: '#2C2C2C',
          customClass: {
            popup: 'diambars-toast-popup'
          }
        });
       
        navigate('/login');
      } catch (error) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error al cerrar sesión',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          background: '#ff6b6b',
          color: 'white'
        });
      }
    }
  };
 
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Aquí puedes implementar la lógica de búsqueda
    }
  };
 
  const navigationItems = [
    {
      to: "/catalog-management",
      label: "Catálogo",
      icon: <MdDashboard />,
      description: "Administración de catálogo"
    },
    {
      to: "/reviews",
      label: "Reseñas",
      icon: <FaStar />,
      description: "Gestión de reseñas"
    },
    {
      to: "/stats",
      label: "Estadísticas",
      icon: <FaChartBar />,
      description: "Análisis y reportes"
    },
    {
      to: "/settings",
      label: "Ajustes",
      icon: <FaCog />,
      description: "Configuración del sistema"
    },
    {
      to: "/custom-product-designer",
      label: "Pedido Manual",
      icon: <MdDesignServices />,
      description: "Crear pedido personalizado"
    },
    {
      to: "/category-page",
      label: "Categorías",
      icon: <FaLayerGroup />,
      description: "Gestión de categorías"
    }
  ];
 
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };
 
  return (
    <>
      <nav className={`navbar ${isVisible ? 'navbar-visible' : ''}`}>
        {/* Indicador de carga inicial */}
        <div className="navbar-loading-bar"></div>
       
        {/* Logo y marca */}
        <div className="navbar-brand">
          <div className="logo-container">
            <img
              src="/src/img/logo.png"
              alt="DIAMBARS Logo"
              className="logo-image"
            />
            <div className="logo-glow"></div>
          </div>
          <div className="brand-content">
            <span className="brand-name">DIAMBARS</span>
            <span className="brand-subtitle">sublimado</span>
          </div>
        </div>
       
        {/* Botón móvil */}
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <div className="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
 
        {/* Navegación desktop */}
        <div className="nav-links desktop-menu">
          {navigationItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActiveRoute(item.to) ? 'active' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              <div className="nav-indicator"></div>
            </Link>
          ))}
        </div>
       
        {/* Sección derecha - REORDENADA */}
        <div className="navbar-actions desktop-menu">
          {/* Información del usuario - SEGUNDA */}
          <div className="user-info">
            <div className="user-avatar">
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">{user?.type || 'admin'}</span>
            </div>
          </div>
         
          {/* Botón de logout - TERCERO */}
          <button className="logout-btn" onClick={handleLogout}>
            <IoLogOutOutline className="logout-icon" />
            <span className="logout-text">Salir</span>
            <div className="logout-ripple"></div>
          </button>
        </div>
      </nav>
 
      {/* Sidebar móvil renovado */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/src/img/logo.png" alt="Logo" className="sidebar-logo" />
            <div>
              <div className="sidebar-brand-name">DIAMBARS</div>
              <div className="sidebar-brand-sub">sublimado</div>
            </div>
          </div>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
       
        <div className="sidebar-content">
          {/* Usuario móvil */}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Usuario'}</div>
              <div className="sidebar-user-role">{user?.type || 'admin'}</div>
            </div>
          </div>
         
          {/* Búsqueda móvil */}
          <form onSubmit={handleSearch} className="sidebar-search">
            <IoSearchOutline className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Buscar producto..."
              className="sidebar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
         
          {/* Navegación móvil */}
          <div className="sidebar-nav">
            {navigationItems.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActiveRoute(item.to) ? 'active' : ''}`}
                onClick={toggleSidebar}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <div className="sidebar-link-content">
                  <span className="sidebar-link-text">{item.label}</span>
                  <span className="sidebar-link-desc">{item.description}</span>
                </div>
                <div className="sidebar-link-arrow">→</div>
              </Link>
            ))}
          </div>
         
          {/* Logout móvil */}
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <IoLogOutOutline className="sidebar-logout-icon" />
            <div className="sidebar-logout-content">
              <span className="sidebar-logout-text">Cerrar Sesión</span>
              <span className="sidebar-logout-desc">Salir del sistema</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
 
export default Navbar;