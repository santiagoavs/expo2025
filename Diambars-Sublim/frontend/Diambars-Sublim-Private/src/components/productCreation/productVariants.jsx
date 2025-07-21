import React, { useState } from 'react';
import './ProductVariants.css';

const ProductVariants = () => {
  const [selectedAttributes, setSelectedAttributes] = useState(['Color', 'Material']);
  const [colorOptions, setColorOptions] = useState([
    { name: 'Rojo oscuro', hex: '#ff0000' },
    { name: 'Azul océano', hex: '#1e40af' }
  ]);
  const [materialOptions, setMaterialOptions] = useState([
    'Cerámica brillante',
    'Cerámica mate'
  ]);
  const [variants, setVariants] = useState([]);

  const generateVariants = () => {
    const lists = [];

    if (selectedAttributes.includes('Color')) {
      lists.push(colorOptions.map(c => `Color: ${c.name}`));
    }

    if (selectedAttributes.includes('Material')) {
      lists.push(materialOptions.map(m => `Material: ${m}`));
    }

    if (lists.length === 0) return setVariants([]);

    const combinations = lists.reduce((acc, list) =>
      acc.flatMap(a => list.map(b => [...a, b]))
    , [[]]);

    setVariants(combinations);
  };

  const handleAddColor = () => {
    setColorOptions([...colorOptions, { name: '', hex: '#000000' }]);
  };

  const handleAddMaterial = () => {
    setMaterialOptions([...materialOptions, '']);
  };

  return (
    <div className="pv-wrapper">
      <h2 className="pv-title">Selecciona atributos</h2>

      <div className="pv-attribute-grid">
        {['Tamaño', 'Color', 'Material', 'Capacidad'].map(attr => (
          <label key={attr} className="pv-checkbox">
            <input
              type="checkbox"
              checked={selectedAttributes.includes(attr)}
              onChange={() => {
                setSelectedAttributes(prev =>
                  prev.includes(attr)
                    ? prev.filter(a => a !== attr)
                    : [...prev, attr]
                );
              }}
            />
            {attr}
          </label>
        ))}
      </div>

      {selectedAttributes.includes('Color') && (
        <div className="pv-options-section">
          <h3 className="pv-subtitle">Opciones de color</h3>
          {colorOptions.map((color, index) => (
            <div key={index} className="pv-color-option">
              <input
                type="text"
                value={color.name}
                onChange={e => {
                  const updated = [...colorOptions];
                  updated[index].name = e.target.value;
                  setColorOptions(updated);
                }}
                placeholder="Nombre del color"
              />
              <input
                type="color"
                value={color.hex}
                onChange={e => {
                  const updated = [...colorOptions];
                  updated[index].hex = e.target.value;
                  setColorOptions(updated);
                }}
              />
            </div>
          ))}
          <button onClick={handleAddColor} className="pv-add-button">+ Agregar color</button>
        </div>
      )}

      {selectedAttributes.includes('Material') && (
        <div className="pv-options-section">
          <h3 className="pv-subtitle">Opciones de materiales</h3>
          {materialOptions.map((material, index) => (
            <input
              key={index}
              type="text"
              value={material}
              onChange={e => {
                const updated = [...materialOptions];
                updated[index] = e.target.value;
                setMaterialOptions(updated);
              }}
              placeholder="Nombre del material"
              className="pv-material-input"
            />
          ))}
          <button onClick={handleAddMaterial} className="pv-add-button">+ Agregar material</button>
        </div>
      )}

      <button className="pv-generate-button" onClick={generateVariants}>
        Generar variantes
      </button>

      {variants.length > 0 && (
        <div className="pv-results">
          <h3 className="pv-subtitle">Variantes generadas:</h3>
          <ul>
            {variants.map((v, i) => (
              <li key={i}>{v.join(' | ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;
