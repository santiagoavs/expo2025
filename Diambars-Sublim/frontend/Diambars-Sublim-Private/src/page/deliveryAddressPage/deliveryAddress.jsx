import React from 'react';
import NavbarProductDesigner from '../../components/navbarProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/processBar/processBar';
import './deliveryAddress.css'; // 🎨 Estilo personalizado

const DeliveryAddress = () => {
  const currentStep = 3; // 🧭 Paso correspondiente a "Shipping"

  return (
    <div className="delivery-address-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />
      
      {/* Aquí irán los componentes del paso actual */}
      <div className="delivery-address-content">
        {/* Por ejemplo, formulario de dirección */}
        <h2>Contenido del paso actual</h2>
      </div>
    </div>
  );
};

export default DeliveryAddress;
