import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavbarProduct.css';

const NavbarProduct = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/catalog-management');
  };

  return (
    <nav className="navbar">
      <button className="back-button" onClick={handleBack}>
        <div className="back-button-content">
          <span className="back-arrow">←</span>
          <span className="back-text">Volver al menu</span>
        </div>
      </button>
      <h1 className="navbar-title">{title}</h1>
    </nav>
  );
};

export default NavbarProduct;