import React, { useState, useEffect } from "react";
import { IoLogOutOutline, IoSearchOutline } from 'react-icons/io5';
import { FaBars, FaTimes, FaChartBar, FaStar, FaCog, FaLayerGroup } from 'react-icons/fa';
import { MdDashboard, MdDesignServices } from 'react-icons/md';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { createClassName, PAGE_IDENTIFIERS } from '../../utils/ClassNames';
import Swal from "sweetalert2";
import "./Navbar.css";

const NAVBAR_ID = PAGE_IDENTIFIERS.NAVBAR;

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [showFloatingNavbar, setShowFloatingNavbar] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const scrollDirection = useScrollDirection();

  // Clases únicas del navbar
  const classes = {
    // Containers
    static: createClassName(NAVBAR_ID, 'static'),
    floating: createClassName(NAVBAR_ID, 'floating'),
    floatingContent: createClassName(NAVBAR_ID, 'floating-content'),
    
    // Brand
    brand: createClassName(NAVBAR_ID, 'brand'),
    logoContainer: createClassName(NAVBAR_ID, 'logo-container'),
    logoImage: createClassName(NAVBAR_ID, 'logo-image'),
    logoGlow: createClassName(NAVBAR_ID, 'logo-glow'),
    brandContent: createClassName(NAVBAR_ID, 'brand-content'),
    brandName: createClassName(NAVBAR_ID, 'brand-name'),
    brandSubtitle: createClassName(NAVBAR_ID, 'brand-subtitle'),
    
    // Navigation
    navLinks: createClassName(NAVBAR_ID, 'nav-links'),
    navLink: createClassName(NAVBAR_ID, 'nav-link'),
    navIcon: createClassName(NAVBAR_ID, 'nav-icon'),
    navText: createClassName(NAVBAR_ID, 'nav-text'),
    navIndicator: createClassName(NAVBAR_ID, 'nav-indicator'),
    
    // Actions
    actions: createClassName(NAVBAR_ID, 'actions'),
    userInfo: createClassName(NAVBAR_ID, 'user-info'),
    userAvatar: createClassName(NAVBAR_ID, 'user-avatar'),
    userDetails: createClassName(NAVBAR_ID, 'user-details'),
    userName: createClassName(NAVBAR_ID, 'user-name'),
    userRole: createClassName(NAVBAR_ID, 'user-role'),
    
    // Logout
    logoutBtn: createClassName(NAVBAR_ID, 'logout-btn'),
    logoutIcon: createClassName(NAVBAR_ID, 'logout-icon'),
    logoutText: createClassName(NAVBAR_ID, 'logout-text'),
    
    // Mobile
    mobileBtn: createClassName(NAVBAR_ID, 'mobile-btn'),
    hamburgerLines: createClassName(NAVBAR_ID, 'hamburger-lines'),
    
    // Sidebar
    sidebarOverlay: createClassName(NAVBAR_ID, 'sidebar-overlay'),
    sidebar: createClassName(NAVBAR_ID, 'sidebar'),
    sidebarHeader: createClassName(NAVBAR_ID, 'sidebar-header'),
    sidebarBrand: createClassName(NAVBAR_ID, 'sidebar-brand'),
    sidebarLogo: createClassName(NAVBAR_ID, 'sidebar-logo'),
    sidebarBrandName: createClassName(NAVBAR_ID, 'sidebar-brand-name'),
    sidebarBrandSub: createClassName(NAVBAR_ID, 'sidebar-brand-sub'),
    closeSidebarBtn: createClassName(NAVBAR_ID, 'close-sidebar-btn'),
    sidebarContent: createClassName(NAVBAR_ID, 'sidebar-content'),
    
    // Sidebar User
    sidebarUser: createClassName(NAVBAR_ID, 'sidebar-user'),
    sidebarUserAvatar: createClassName(NAVBAR_ID, 'sidebar-user-avatar'),
    sidebarUserInfo: createClassName(NAVBAR_ID, 'sidebar-user-info'),
    sidebarUserName: createClassName(NAVBAR_ID, 'sidebar-user-name'),
    sidebarUserRole: createClassName(NAVBAR_ID, 'sidebar-user-role'),
    
    // Sidebar Search
    sidebarSearch: createClassName(NAVBAR_ID, 'sidebar-search'),
    sidebarSearchIcon: createClassName(NAVBAR_ID, 'sidebar-search-icon'),
    sidebarSearchInput: createClassName(NAVBAR_ID, 'sidebar-search-input'),
    
    // Sidebar Navigation
    sidebarNav: createClassName(NAVBAR_ID, 'sidebar-nav'),
    sidebarLink: createClassName(NAVBAR_ID, 'sidebar-link'),
    sidebarLinkIcon: createClassName(NAVBAR_ID, 'sidebar-link-icon'),
    sidebarLinkContent: createClassName(NAVBAR_ID, 'sidebar-link-content'),
    sidebarLinkText: createClassName(NAVBAR_ID, 'sidebar-link-text'),
    sidebarLinkDesc: createClassName(NAVBAR_ID, 'sidebar-link-desc'),
    sidebarLinkArrow: createClassName(NAVBAR_ID, 'sidebar-link-arrow'),
    
    // Sidebar Logout
    sidebarLogoutBtn: createClassName(NAVBAR_ID, 'sidebar-logout-btn'),
    sidebarLogoutIcon: createClassName(NAVBAR_ID, 'sidebar-logout-icon'),
    sidebarLogoutContent: createClassName(NAVBAR_ID, 'sidebar-logout-content'),
    sidebarLogoutText: createClassName(NAVBAR_ID, 'sidebar-logout-text'),
    sidebarLogoutDesc: createClassName(NAVBAR_ID, 'sidebar-logout-desc'),
    
    // States
    visible: createClassName(NAVBAR_ID, 'visible'),
    scrolled: createClassName(NAVBAR_ID, 'scrolled'),
    active: createClassName(NAVBAR_ID, 'active'),
    desktopMenu: createClassName(NAVBAR_ID, 'desktop-menu')
  };

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Lógica de scroll para navbar flotante
  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      const shouldShowFloating = 
        currentScrollY > 150 && 
        scrollDirection === 'up' && 
        currentScrollY > 50;

      setShowFloatingNavbar(shouldShowFloating);
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    const handleScroll = () => {
      requestTick();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection]);

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

  // Componente de contenido reutilizable
  const NavbarContent = ({ isFloating = false }) => (
    <>
      {/* Logo y marca */}
      <div className={classes.brand}>
        <div className={classes.logoContainer}>
          <img
            src="/src/img/logo.png"
            alt="DIAMBARS Logo"
            className={classes.logoImage}
          />
          <div className={classes.logoGlow}></div>
        </div>
        <div className={classes.brandContent}>
          <span className={classes.brandName}>DIAMBARS</span>
          <span className={classes.brandSubtitle}>sublimado</span>
        </div>
      </div>

      {/* Botón móvil */}
      <button className={classes.mobileBtn} onClick={toggleSidebar}>
        <div className={classes.hamburgerLines}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Navegación desktop */}
      <div className={`${classes.navLinks} ${classes.desktopMenu}`}>
        {navigationItems.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            className={`${classes.navLink} ${isActiveRoute(item.to) ? classes.active : ''}`}
            title={item.description}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className={classes.navIcon}>{item.icon}</span>
            <span className={classes.navText}>{item.label}</span>
            <div className={classes.navIndicator}></div>
          </Link>
        ))}
      </div>

      {/* Acciones */}
      <div className={`${classes.actions} ${classes.desktopMenu}`}>
        <div className={classes.userInfo}>
          <div className={classes.userAvatar}>
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className={classes.userDetails}>
            <span className={classes.userName}>{user?.name || 'Usuario'}</span>
            <span className={classes.userRole}>{user?.type || 'admin'}</span>
          </div>
        </div>

        <button className={classes.logoutBtn} onClick={handleLogout}>
          <IoLogOutOutline className={classes.logoutIcon} />
          <span className={classes.logoutText}>Salir</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Navbar estático */}
      <nav className={`${classes.static} ${isVisible ? classes.visible : ''} ${scrollY > 100 ? classes.scrolled : ''}`}>
        <NavbarContent />
      </nav>

      {/* Navbar flotante */}
      <nav className={`${classes.floating} ${showFloatingNavbar ? classes.visible : ''}`}>
        <div className={classes.floatingContent}>
          <NavbarContent isFloating={true} />
        </div>
      </nav>

      {/* Sidebar móvil */}
      <div className={`${classes.sidebarOverlay} ${isSidebarOpen ? classes.active : ''}`} onClick={toggleSidebar}></div>
      <div className={`${classes.sidebar} ${isSidebarOpen ? classes.active : ''}`}>
        <div className={classes.sidebarHeader}>
          <div className={classes.sidebarBrand}>
            <img src="/src/img/logo.png" alt="Logo" className={classes.sidebarLogo} />
            <div>
              <div className={classes.sidebarBrandName}>DIAMBARS</div>
              <div className={classes.sidebarBrandSub}>sublimado</div>
            </div>
          </div>
          <button className={classes.closeSidebarBtn} onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <div className={classes.sidebarContent}>
          {/* Usuario móvil */}
          <div className={classes.sidebarUser}>
            <div className={classes.sidebarUserAvatar}>
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className={classes.sidebarUserInfo}>
              <div className={classes.sidebarUserName}>{user?.name || 'Usuario'}</div>
              <div className={classes.sidebarUserRole}>{user?.type || 'admin'}</div>
            </div>
          </div>

          {/* Búsqueda móvil */}
          <form onSubmit={handleSearch} className={classes.sidebarSearch}>
            <IoSearchOutline className={classes.sidebarSearchIcon} />
            <input
              type="text"
              placeholder="Buscar producto..."
              className={classes.sidebarSearchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Navegación móvil */}
          <div className={classes.sidebarNav}>
            {navigationItems.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${classes.sidebarLink} ${isActiveRoute(item.to) ? classes.active : ''}`}
                onClick={toggleSidebar}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={classes.sidebarLinkIcon}>{item.icon}</span>
                <div className={classes.sidebarLinkContent}>
                  <span className={classes.sidebarLinkText}>{item.label}</span>
                  <span className={classes.sidebarLinkDesc}>{item.description}</span>
                </div>
                <div className={classes.sidebarLinkArrow}>→</div>
              </Link>
            ))}
          </div>

          {/* Logout móvil */}
          <button className={classes.sidebarLogoutBtn} onClick={handleLogout}>
            <IoLogOutOutline className={classes.sidebarLogoutIcon} />
            <div className={classes.sidebarLogoutContent}>
              <span className={classes.sidebarLogoutText}>Cerrar Sesión</span>
              <span className={classes.sidebarLogoutDesc}>Salir del sistema</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;