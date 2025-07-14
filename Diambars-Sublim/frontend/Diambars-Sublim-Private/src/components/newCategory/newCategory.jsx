import React, { useState, useContext } from 'react';
import './NewCategory.css';
import { CategoryContext } from '../../context/categoryContext/categoryContext'; // ✅ Importar el contexto

const NewCategory = () => {
  const [name, setName] = useState('Camisetas');
  const [parent, setParent] = useState('Ropa');
  const [description, setDescription] = useState('Camisetas de algodón con estampados únicos para todas las edades');
  const [active, setActive] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [image, setImage] = useState(null);

  const { addCategory } = useContext(CategoryContext); // ✅ Acceder a la función del contexto

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSave = () => {
    const newCat = {
      name,
      count: 0,
      parent: parent || null,
      description,
      image,
    };

    // ✅ Agregar al contexto
    addCategory(newCat);

    // Opcional: limpiar campos después de guardar
    setName('');
    setParent('');
    setDescription('');
    setImage(null);
    setActive(true);
    setShowOnHome(true);
  };

  return (
    <div className="new-category-wrapper">
      <div className="new-category-header">
        <h2>Editando: {name}</h2>
        <span>Última modificación: 12 Jul 2023, 15:30</span>
      </div>

      <div className="new-category-body">
        <div className="new-category-form">
          <label>
            NOMBRE DE SUB CATEGORÍA
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            NOMBRE DE CATEGORIA
            <input type="text" value={parent} onChange={(e) => setParent(e.target.value)} />
          </label>

          <label>
            DESCRIPCIÓN
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div className="new-category-switches">
            <label>
              <input type="checkbox" checked={active} onChange={() => setActive(!active)} />
              Categoría activa
            </label>
            <label>
              <input type="checkbox" checked={showOnHome} onChange={() => setShowOnHome(!showOnHome)} />
              Mostrar en página principal
            </label>
          </div>
        </div>

        <div className="new-category-visual">
          <div className="image-section">
            <div className="image-preview-box">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="Preview" />
              ) : (
                <div className="image-placeholder">Imagen</div>
              )}
            </div>
            <label className="image-upload">
              Cambiar imagen
              <input type="file" onChange={handleImageChange} />
            </label>
          </div>

          <div className="preview-section">
            <h3>CÓMO SE VERÁ</h3>
            <p>{parent} &gt; {name}</p>
            <p>Productos: 12</p>
            <div className="preview-image-box">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="Preview" />
              ) : (
                <div className="image-placeholder">Imagen</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="new-category-actions">
        <button className="save-btn" onClick={handleSave}>Guardar</button>
        <button className="cancel-btn">Cancelar</button>
      </div>
    </div>
  );
};

export default NewCategory;
