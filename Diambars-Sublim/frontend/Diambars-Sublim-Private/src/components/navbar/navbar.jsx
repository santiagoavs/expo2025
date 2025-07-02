import React from "react";
import "./Navbar.css"; // Archivo CSS separado

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-title">Administración de catálogo</div>
      
      <div className="nav-links">
        <a href="#" className="nav-link">Reseñas</a>
        <a href="#" className="nav-link">Stats</a>
        <a href="#" className="nav-link">Ajustes</a>
      </div>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search product" 
          className="search-input" 
        />
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </nav>
  );
};

export default Navbar;