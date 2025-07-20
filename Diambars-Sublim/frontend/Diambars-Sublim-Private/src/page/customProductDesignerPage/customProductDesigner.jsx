import React from 'react';
import NavbarProductDesigner from '../../components/customProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/customProductDesigner/processBar';
import './customProductDesigner.css'; // 🎨 Estilo personalizado

const CustomProductDesigner = () => {
  const currentStep = 1; // 🧭 Cambia este valor según el paso actual (1 a 4)

  return (
    <div className="custom-product-designer-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />
      
      {/* Aquí irán los componentes del paso actual */}
      <div className="custom-step-content">
        {/* Por ejemplo, pantalla de envío o diseño */}
        <h2>Contenido del paso actual</h2>
      </div>
    </div>
  );
};

export default CustomProductDesigner;
