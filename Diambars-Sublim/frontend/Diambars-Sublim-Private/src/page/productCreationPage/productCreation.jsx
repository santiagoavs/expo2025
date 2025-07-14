import React, { useState } from 'react';
import NavbarProduct from '../../components/NavbarProduct/NavbarProduct';
import ProductInformation from '../../components/ProductInformation/ProductInformation';
import LivePreview from '../../components/LivePreview/LivePreview';
import ProductVariants from '../../components/ProductVariants/ProductVariants';
import VariantsGenerated from '../../components/variantsGenerated/variantsGenerated';
import './ProductCreation.css';

const ProductCreation = () => {
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: ''
  });

  const handleUpdateProduct = (newData) => {
    setProductData(newData);
  };

  return (
    <div className="product-creation-wrapper">
      <NavbarProduct title="Crear nuevo producto" />
      <div className="product-creation-container">
        <div className="product-creation-content">
          <div className="product-form-card">
            <ProductInformation 
              data={productData}
              onUpdate={handleUpdateProduct}
            />
          </div>
          <div className="product-preview-card">
            <LivePreview data={productData} />
          </div>
          <div className="product-variants-card">
            <div className="product-variants-container">
              <ProductVariants />
              <div className="variants-generated-positionable">
                <VariantsGenerated />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreation;
