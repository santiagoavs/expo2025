const ProductPreviewCard = ({ productName, description, color, size, imageSrc }) => {
  return (
    <div className="product-preview-card">
      <div className="product-image-container">
        <img
          src={imageSrc}
          alt={productName}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{productName}</h3>
        <p className="product-description">{description}</p>
        <p className="product-selection">
          <strong>Selected:</strong> {color || 'No color selected'} • {size || 'No size selected'}
        </p>
      </div>
    </div>
  );
};
