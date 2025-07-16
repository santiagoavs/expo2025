import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavbarProductDesigner.css';
import { FaQuestionCircle, FaUserCircle } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';

const NavbarProductDesigner = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/catalog-management');
  };

  return (
    <nav className="navbar-product-designer">
      <div className="navbar-content">
        {/* 🔙 Volver */}
        <button className="back-btn" onClick={handleBack}>
          <MdArrowBack size={18} />
          <span>Volver al menú</span>
        </button>

        {/* 🎨 Título central */}
        <div className="designer-title">
          <img src="/src/img/custom-icon.png" alt="Icono Diseño" className="designer-icon" />
          <span className="title-text">Custom Product Designer</span>
        </div>

        {/* 🛠️ Acciones */}
        <div className="designer-actions">
          <button className="action-btn">
            <FaQuestionCircle size={18} />
            <span>Help</span>
          </button>
          <button className="action-btn">
            <FaUserCircle size={18} />
            <span>Account</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarProductDesigner;
