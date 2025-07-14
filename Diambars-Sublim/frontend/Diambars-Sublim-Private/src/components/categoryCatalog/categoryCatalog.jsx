import React, { useState, useContext } from 'react';
import './CategoryCatalog.css';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { CategoryContext } from '../../context/categoryContext/categoryContext'; // ✅ Importar el contexto

const CategoryCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});
  const { categories } = useContext(CategoryContext); // ✅ Obtener las categorías del contexto

  const handleToggle = (categoryName) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // 🔁 Agrupa por categoría padre
  const grouped = {};

  categories.forEach((cat) => {
    if (cat.parent) {
      if (!grouped[cat.parent]) grouped[cat.parent] = [];
      grouped[cat.parent].push(cat);
    } else {
      grouped[cat.name] = [];
    }
  });

  return (
    <div className="category-catalog-container">
      <div className="category-catalog-header">
        <h2>GESTIÓN DE CATEGORÍAS</h2>
      </div>

      <div className="catalog-section">
        <label className="section-title">CATEGORÍAS</label>
        <input
          type="text"
          placeholder="Buscar categoría"
          className="category-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="category-list">
          {Object.entries(grouped).map(([group, children]) => {
            const showGroup = group.toLowerCase().includes(searchTerm.toLowerCase()) ||
              children.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!showGroup) return null;

            return (
              <div key={group} className="category-group">
                <div className="group-header" onClick={() => handleToggle(group)}>
                  {expanded[group] ? <FaChevronDown /> : <FaChevronRight />}
                  <span>{group}</span>
                </div>
                {expanded[group] && children.length > 0 && (
                  <div className="subcategories">
                    {children.map((child) => (
                      <div key={child.name} className="subcategory-item">
                        {child.name} <span className="count">({child.count || 0})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryCatalog;
