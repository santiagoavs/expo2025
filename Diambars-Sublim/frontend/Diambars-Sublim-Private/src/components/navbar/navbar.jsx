import React, { useState } from "react";
import { IoLogOutOutline } from 'react-icons/io5';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importa el hook useAuth
import Swal from "sweetalert2";
import "./Navbar.css";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      
      // Mostrar notificación pequeña
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Sesión cerrada correctamente',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: '#f8f9fa',
        width: '300px'
      });
      
      navigate('/login');
    } catch (error) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Error al cerrar sesión',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img 
            src="/src/img/logo.png"
            alt="DIAMBARS Logo" 
            className="logo-image"
          />
          <span className="brand-name">DIAMBARS</span>
        </div>
        
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="nav-links desktop-menu">
          <Link to="/catalog-management" className="nav-link">Administración de catálogo</Link>
          <a href="#" className="nav-link">Reseñas</a>
          <a href="#" className="nav-link">Stats</a>
          <a href="#" className="nav-link">Ajustes</a>
          <Link to="/custom-product-designer" className="nav-link">Pedido manual</Link>
          <Link to="/category-page" className="nav-link">Categorías</Link>
        </div>
        
        <div className="navbar-right desktop-menu">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search product" 
              className="search-input" 
            />
            <button className="search-button">
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <IoLogOutOutline />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Sidebar para móvil */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <img src="/src/img/logo.png" alt="Logo" className="sidebar-logo" />
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        <div className="sidebar-menu">
          <div className="sidebar-search">
            <input 
              type="text" 
              placeholder="Search product" 
              className="search-input" 
            />
            <button className="search-button">
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <Link to="/catalog-management" className="sidebar-link">Administración de catálogo</Link>
          <a href="#" className="sidebar-link">Reseñas</a>
          <a href="#" className="sidebar-link">Stats</a>
          <a href="#" className="sidebar-link">Ajustes</a>
          <Link to="/custom-product-designer" className="sidebar-link">Pedido manual</Link>
          <Link to="/category" className="sidebar-link">Categorías</Link>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <IoLogOutOutline />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;