import React from 'react';
import './DiambarsBrand.css';

const DiambarsBrand = () => {
  return (
    <div className="diambars-brand-column">
      <div className="diambars-logo-container">
        <img 
          src="/src/img/logo.png" 
          alt="Logo DIAMBARS" 
          className="diambars-logo"
        />
      </div>
      <div className="diambars-brand-text">
        <h1>DIAMBARS</h1>
        <p>sublimado</p>
      </div>
    </div>
  );
};

export default DiambarsBrand;