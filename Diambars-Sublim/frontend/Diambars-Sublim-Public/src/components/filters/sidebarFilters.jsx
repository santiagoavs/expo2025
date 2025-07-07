import React from 'react';
import './sidebarFilters.css';

const FilterSidebar = () => {
  return (
    <aside className="filter-sidebar">
      <h3 className="filter-title">Filtros</h3>
      <div className="filter-group">
        <h4 className="filter-heading">Categoría</h4>
        <ul className="filter-list">
          <li>Hogar</li>
          <li>Ropa</li>
          <li>Accesorios</li>
        </ul>
      </div>
      <div className="filter-group">
        <h4 className="filter-heading">Ropa</h4>
        <ul className="filter-list">
          <li>Hombre</li>
          <li>Mujer</li>
          <li>Niños</li>
        </ul>
      </div>
    </aside>
  );
};

export default FilterSidebar;