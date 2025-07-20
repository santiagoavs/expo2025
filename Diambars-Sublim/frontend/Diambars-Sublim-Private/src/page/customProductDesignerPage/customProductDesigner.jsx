import React, { useState } from 'react';
import NavbarProductDesigner from '../../components/customProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/customProductDesigner/processBar';
import ProductPreviewCard from '../../components/customProductDesigner/productPreviewCard';
import './customProductDesigner.css';

const CustomProductDesigner = () => {
  const currentStep = 1;

  // 🎨 Estado de color y talla seleccionados
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div className="custom-product-designer-wrapper">
      <NavbarProductDesigner />
      <ProcessBar currentStep={currentStep} />

      <div className="custom-step-content">
        <ProductPreviewCard
          productName="Premium T-Shirt"
          description="100% Cotton • Unisex Fit"
          color={selectedColor}
          size={selectedSize}
          imageSrc={`/src/img/${selectedColor || 'tshirt-white'}.png`}
        />
      </div>
    </div>
  );
};

export default CustomProductDesigner;
