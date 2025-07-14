import React from 'react';
import './ProductInformation.css';

const ProductInformation = ({ data, onUpdate }) => {
  const handleInputChange = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="product-information-card">
      <h2 className="product-information-title">Informacion del producto</h2>
      
      <div className="product-information-form">
        <div className="form-group">
          <label htmlFor="productName">Nombre del producto</label>
          <input
            type="text"
            id="productName"
            placeholder="Introduce el nombre del producto"
            value={data?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="category">Categoria del producto</label>
            <input
              type="text"
              id="category"
              value={data?.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group half">
            <label htmlFor="basePrice">Precio base</label>
            <div className="price-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="basePrice"
                placeholder="0.00"
                value={data?.basePrice || ''}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                className="form-input price-input"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            placeholder="Descripción del producto, instrucciones de colocación del diseño..."
            value={data?.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-input textarea"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductInformation;