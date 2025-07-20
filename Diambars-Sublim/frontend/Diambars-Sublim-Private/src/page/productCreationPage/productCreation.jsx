import React, { useState } from 'react';
import NavbarProduct from '../../components/productCreation/navbarProduct';
import ProductInformation from '../../components/productCreation/productInformation';
import LivePreview from '../../components/productCreation/livePreview';
import ProductVariants from '../../components/productCreation/productVariants';
import VariantsGenerated from '../../components/productCreation/variantsGenerated';
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
