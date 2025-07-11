import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './productCreation.css';

const ProductCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    basePrice: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="product-creation-wrapper">
      {/* Navbar fijo en la parte superior */}
      <nav className="product-creation-nav">
        <button 
          className="back-menu-btn"
          onClick={() => navigate('/catalog-management')}
        >
          ← Volver al menú
        </button>
        <h1>Crear nuevo producto</h1>
      </nav>

      <div className="product-creation-container">
        <div className="product-creation-content">
          {/* Card de información del producto */}
          <div className="product-form-card">
            <h2>Información del producto</h2>
            
            <div className="form-group">
              <label>Nombre del producto</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Introduce el nombre del producto"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría del producto</label>
                <input
                  type="text"
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Precio base</label>
                <div className="price-input-container">
                  <input
                    type="text"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="$"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del producto, instrucciones de colocación del diseño..."
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>

          {/* Card de vista previa */}
          <div className="product-preview-card">
            <h2>Vista previa en vivo</h2>
            <div className="preview-content">
              <div className="preview-image">
                <img src="/src/img/mug-preview.jpg" alt="Preview" />
              </div>
              <div className="preview-details">
                <div className="preview-info">
                  <span>Material:</span>
                  <span>Cerámica brillante</span>
                </div>
                <div className="preview-info">
                  <span>Color:</span>
                  <div className="color-indicator">
                    <span className="color-dot"></span>
                    <span>Rojo oscuro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreation;