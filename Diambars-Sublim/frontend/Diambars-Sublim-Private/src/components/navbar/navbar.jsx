import React, { useState } from "react";
import { IoLogOutOutline } from 'react-icons/io5';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Importar Link
import "./Navbar.css";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    navigate('/login');
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
          <a href="#" className="nav-link">Administración de catálogo</a> 
          <a href="#" className="nav-link">Reseñas</a>
          <a href="#" className="nav-link">Stats</a>
          <a href="#" className="nav-link">Ajustes</a>
          <a href="#" className="nav-link">Pedido manual</a>
          <Link to="/category" className="nav-link">Categorías</Link> {/* ✅ Enlace real */}
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
          <a href="#" className="sidebar-link">Administración de catálogo</a>
          <a href="#" className="sidebar-link">Reseñas</a>
          <a href="#" className="sidebar-link">Stats</a>
          <a href="#" className="sidebar-link">Ajustes</a>
          <a href="#" className="sidebar-link">Pedido manual</a>
          <Link to="/category" className="sidebar-link">Categorías</Link> {/* ✅ Sidebar también */}
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
