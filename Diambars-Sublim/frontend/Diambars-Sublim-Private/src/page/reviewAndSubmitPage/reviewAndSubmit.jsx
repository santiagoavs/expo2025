import React from 'react';
import NavbarProductDesigner from '../../components/navbarProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/processBar/processBar';
import './reviewAndSubmit.css'; // 🎨 Estilo personalizado

const ReviewAndSubmit = () => {
  const currentStep = 4; // 🧭 Paso activo para la etapa final

  return (
    <div className="review-and-submit-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />
      
      {/* Contenido del paso actual */}
      <div className="review-and-submit-content">
        {/* Aquí irá el resumen del diseño, producto, dirección, etc */}
        <h2>Contenido del paso actual</h2>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;
