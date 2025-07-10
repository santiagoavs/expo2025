import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img 
          src="/path-to-your-logo.png" // Aquí deberás poner la ruta correcta de tu logo
          alt="DIAMBARS Logo" 
          className="logo-image"
        />
        <span className="brand-name">DIAMBARS</span>
      </div>
      
      <div className="nav-links">
        <a href="#" className="nav-link">Administracion de catalogo</a>
        <a href="#" className="nav-link">Reseñas</a>
        <a href="#" className="nav-link">Stats</a>
        <a href="#" className="nav-link">Ajustes</a>
        <a href="#" className="nav-link">Pedido manual</a>
      </div>
      
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
    </nav>
  );
};

export default Navbar;