import React from 'react';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="diambars-welcome-screen" id="diambars-welcome-screen">
      <div className="diambars-logo-container" id="diambars-logo-container">
        {/* Espacio para el logo (imagen) */}
        <div className="diambars-logo-image-container" id="diambars-logo-img-container">
          {/* La imagen se cargará aquí */}
        </div>
        
        <h1 className="diambars-main-logo" id="diambars-main-logo">DIAMBARS</h1>
        <p className="diambars-sublogo" id="diambars-sublogo">sublimado</p>
      </div>
    </div>
  );
};

export default Welcome;