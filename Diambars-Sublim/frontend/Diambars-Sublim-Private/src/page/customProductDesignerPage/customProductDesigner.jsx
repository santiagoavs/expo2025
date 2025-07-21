import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ⬅️ Importación agregada
import NavbarProductDesigner from '../../components/customProductDesigner/navbarProductDesigner';
import ProcessBar from '../../components/customProductDesigner/processBar';
import ProductPreviewCard from '../../components/customProductDesigner/productPreviewCard';
import ColorSelector from '../../components/customProductDesigner/colorSelector';
import SizeSelector from '../../components/customProductDesigner/SizeSelector';
import ContinueButton from '../../components/customProductDesigner/continueButton';
import './customProductDesigner.css';

const CustomProductDesigner = () => {
  const currentStep = 1;
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const navigate = useNavigate(); // ⬅️ Hook para navegar

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
          onSelectColor={setSelectedColor}
        />

        <div className="color-selector-position">
          <ColorSelector
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>

        <div className="size-selector-position">
          <SizeSelector
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
          />
        </div>

        <div className="continue-button-position">
          <div className="custom-continue-button-wrapper">
            <ContinueButton onClick={() => navigate('/custom-product-designer/add-artwork')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProductDesigner;
