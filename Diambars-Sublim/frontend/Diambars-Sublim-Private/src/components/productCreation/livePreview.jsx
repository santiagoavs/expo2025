import React from 'react';
import './LivePreview.css';

const LivePreview = ({ data }) => {
  const { name, category, basePrice, description } = data;

  return (
    <div className="live-preview-card">
      <h2 className="live-preview-title">Vista previa en vivo</h2>
      <div className="preview-content">
        <div className="image-container">
          <img src="/placeholder-mug.jpg" alt="Vista previa del producto" className="preview-image" />
        </div>
        <div className="preview-details">
          <div className="detail-item">
            <span className="detail-label">Nombre:</span>
            <span className="detail-value">{name || 'Nombre del producto'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Categoría:</span>
            <span className="detail-value">{category || 'Categoría'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Precio:</span>
            <span className="detail-value">
              {basePrice ? `$${basePrice}` : 'No definido'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Descripción:</span>
            <span className="detail-value">{description || 'Sin descripción'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Material:</span>
            <span className="detail-value">Cerámica brillante</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Color:</span>
            <div className="color-value">
              <span className="color-square"></span>
              <span>Rojo oscuro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
