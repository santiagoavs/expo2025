import React, { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  SignOut, 
  List, 
  X, 
  Gear,
  ChartBar,
  Star,
  Users,
  ShoppingCart,
  Package,
  Folders,
  CurrencyDollar,
  UserList,
  Archive
} from '@phosphor-icons/react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from "sweetalert2";
import "./Navbar.css";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Detectar scroll para cambiar estilos del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      confirmButtonColor: '#040DBF',
      cancelButtonColor: '#F2F2F2',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#010326',
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
          background: '#ffffff',
          color: '#010326',
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
          background: '#fef2f2',
          color: '#dc2626'
        });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implementar lógica de búsqueda
    }
  };

  const navigationItems = [
    {
      to: "/catalog-management",
      label: "Catálogo",
      icon: <ChartBar size={20} weight="duotone" />,
      description: "Gestión de productos y servicios"
    },
    {
      to: "/orders",
      label: "Pedidos",
      icon: <ShoppingCart size={20} weight="duotone" />,
      description: "Control de pedidos y órdenes"
    },
    {
      to: "/employees",
      label: "Empleados",
      icon: <UserList size={20} weight="duotone" />,
      description: "Gestión de personal"
    },
    {
      to: "/users",
      label: "Usuarios",
      icon: <Users size={20} weight="duotone" />,
      description: "Administración de usuarios"
    },
    {
      to: "/categories",
      label: "Categorías",
      icon: <Folders size={20} weight="duotone" />,
      description: "Organización de productos"
    },
    {
      to: "/sales",
      label: "Ventas",
      icon: <CurrencyDollar size={20} weight="duotone" />,
      description: "Reportes y estadísticas"
    },
    {
      to: "/reviews",
      label: "Reseñas",
      icon: <Star size={20} weight="duotone" />,
      description: "Opiniones de clientes"
    },
    {
      to: "/inventory",
      label: "Inventario",
      icon: <Archive size={20} weight="duotone" />,
      description: "Control de stock"
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Navbar principal */}
      <nav className={`diambars-navbar ${isScrolled ? 'diambars-navbar--scrolled' : ''}`}>
        {/* Logo y marca */}
        <div className="diambars-navbar__brand">
          <div className="diambars-navbar__logo">
            <div className="diambars-navbar__logo-circle">
              <span className="diambars-navbar__logo-text">D</span>
            </div>
            <div className="diambars-navbar__logo-pulse"></div>
          </div>
          <div className="diambars-navbar__brand-text">
            <h1 className="diambars-navbar__brand-name">DIAMBARS</h1>
            <span className="diambars-navbar__brand-subtitle">sublimado</span>
          </div>
        </div>

        {/* Navegación desktop - Mostrando solo los primeros 5 elementos */}
        <div className="diambars-navbar__nav diambars-navbar__nav--desktop">
          {navigationItems.slice(0, 5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`diambars-navbar__nav-item ${isActiveRoute(item.to) ? 'diambars-navbar__nav-item--active' : ''}`}
              title={item.description}
            >
              <span className="diambars-navbar__nav-icon">{item.icon}</span>
              <span className="diambars-navbar__nav-label">{item.label}</span>
              <div className="diambars-navbar__nav-highlight"></div>
            </Link>
          ))}
          
          {/* Botón "Ver más" si hay más elementos */}
          {navigationItems.length > 5 && (
            <button 
              className="diambars-navbar__nav-item diambars-navbar__nav-item--more" 
              onClick={toggleSidebar} 
              title="Ver más opciones"
            >
              <span className="diambars-navbar__nav-icon">
                <List size={20} weight="duotone" />
              </span>
              <span className="diambars-navbar__nav-label">Más</span>
              <div className="diambars-navbar__nav-badge">{navigationItems.length - 5}</div>
            </button>
          )}
        </div>

        {/* Acciones del navbar */}
        <div className="diambars-navbar__actions">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className={`diambars-navbar__search ${isSearchFocused ? 'diambars-navbar__search--focused' : ''}`}>
            <MagnifyingGlass className="diambars-navbar__search-icon" size={18} weight="duotone" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="diambars-navbar__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </form>

          {/* Información del usuario */}
          <div className="diambars-navbar__user diambars-navbar__user--desktop">
            <div className="diambars-navbar__user-avatar">
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              <div className="diambars-navbar__user-status"></div>
            </div>
            <div className="diambars-navbar__user-info">
              <span className="diambars-navbar__user-name">{user?.name || 'Usuario'}</span>
              <span className="diambars-navbar__user-role">{user?.type || 'admin'}</span>
            </div>
          </div>

          {/* Configuración y logout */}
          <div className="diambars-navbar__actions-buttons diambars-navbar__actions-buttons--desktop">
            <Link to="/settings" className="diambars-navbar__action-btn" title="Configuración">
              <Gear size={18} weight="duotone" />
            </Link>
            <button className="diambars-navbar__action-btn diambars-navbar__logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <SignOut size={18} weight="duotone" />
            </button>
          </div>

          {/* Menú móvil */}
          <button className="diambars-navbar__mobile-btn diambars-navbar__mobile-btn--mobile" onClick={toggleSidebar}>
            <List size={22} weight="duotone" />
          </button>
        </div>
      </nav>

      {/* Sidebar móvil y menu completo */}
      <div className={`diambars-sidebar__overlay ${isSidebarOpen ? 'diambars-sidebar__overlay--active' : ''}`} onClick={toggleSidebar}></div>
      
      <div className={`diambars-sidebar ${isSidebarOpen ? 'diambars-sidebar--active' : ''}`}>
        <div className="diambars-sidebar__header">
          <div className="diambars-sidebar__brand">
            <div className="diambars-sidebar__logo">
              <span>D</span>
            </div>
            <div className="diambars-sidebar__brand-text">
              <span className="diambars-sidebar__brand-name">DIAMBARS</span>
              <span className="diambars-sidebar__brand-sub">sublimado</span>
            </div>
          </div>
          <button className="diambars-sidebar__close-btn" onClick={toggleSidebar}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="diambars-sidebar__content">
          {/* Usuario móvil */}
          <div className="diambars-sidebar__user">
            <div className="diambars-sidebar__user-avatar">
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className="diambars-sidebar__user-info">
              <span className="diambars-sidebar__user-name">{user?.name || 'Usuario'}</span>
              <span className="diambars-sidebar__user-role">{user?.type || 'admin'}</span>
            </div>
          </div>

          {/* Navegación completa en sidebar */}
          <div className="diambars-sidebar__nav">
            <div className="diambars-sidebar__nav-section">
              <h3 className="diambars-sidebar__nav-title">Navegación Principal</h3>
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`diambars-sidebar__nav-item ${isActiveRoute(item.to) ? 'diambars-sidebar__nav-item--active' : ''}`}
                  onClick={toggleSidebar}
                >
                  <span className="diambars-sidebar__nav-icon">{item.icon}</span>
                  <div className="diambars-sidebar__nav-content">
                    <span className="diambars-sidebar__nav-label">{item.label}</span>
                    <span className="diambars-sidebar__nav-desc">{item.description}</span>
                  </div>
                  <div className="diambars-sidebar__nav-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Acciones móviles */}
          <div className="diambars-sidebar__actions">
            <Link to="/settings" className="diambars-sidebar__action-btn" onClick={toggleSidebar}>
              <Gear size={18} weight="duotone" />
              <span>Configuración</span>
            </Link>
            <button className="diambars-sidebar__action-btn diambars-sidebar__action-btn--logout" onClick={handleLogout}>
              <SignOut size={18} weight="duotone" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;