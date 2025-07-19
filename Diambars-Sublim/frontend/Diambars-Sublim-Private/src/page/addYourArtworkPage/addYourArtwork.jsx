import React from 'react';
import NavbarProductDesigner from '../../components/NavbarProductDesigner/NavbarProductDesigner';
import ProcessBar from '../../components/ProcessBar/ProcessBar';
import './AddYourArtwork.css'; // 🎨 Estilo personalizado

const AddYourArtwork = () => {
  const currentStep = 2; // 🧭 Este sería el paso para "Design"

  return (
    <div className="add-your-artwork-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />
      
      {/* Aquí irán los componentes del paso actual */}
      <div className="add-your-artwork-content">
        {/* Componente de diseño personalizado */}
        <h2>Contenido del paso actual</h2>
      </div>
    </div>
  );
};

export default AddYourArtwork;
