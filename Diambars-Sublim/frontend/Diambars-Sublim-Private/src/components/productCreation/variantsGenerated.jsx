import React, { useState } from 'react';
import './VariantsGenerated.css';

const VariantsGenerated = () => {
  const [variants, setVariants] = useState([
    {
      name: 'Bold Red (Glossy)',
      priceAdj: 2.00,
      stock: 50,
      image: null
    },
    {
      name: 'Ocean Blue (Matte)',
      priceAdj: 0.00,
      stock: 3,
      image: null
    }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleDelete = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  return (
    <div className="variants-generated-wrapper">
      <table className="variants-generated-table">
        <thead>
          <tr>
            <th>Variante</th>
            <th>Precio Adj.</th>
            <th>Stock</th>
            <th>Imagen</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant, index) => (
            <tr key={index}>
              <td>{variant.name}</td>
              <td>
                <input
                  type="number"
                  value={variant.priceAdj}
                  onChange={(e) =>
                    handleChange(index, 'priceAdj', parseFloat(e.target.value))
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    handleChange(index, 'stock', parseInt(e.target.value))
                  }
                />
              </td>
              <td>
                <input
                  type="file"
                  onChange={(e) =>
                    handleChange(index, 'image', e.target.files[0])
                  }
                />
              </td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VariantsGenerated;
