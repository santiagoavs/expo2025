import React, { useContext } from 'react';
import { CategoryContext } from '../context/categoryContext';
import { NavLink } from 'react-router-dom';
import './SidebarCategories.css';

const SidebarCategories = () => {
  const { flatCategories, loading, error } = useContext(CategoryContext);

  if (loading) return <div className="sidebar-loading">Cargando categorías...</div>;
  if (error) return <div className="sidebar-error">Error al cargar categorías</div>;

  return (
    <div className="sidebar-categories">
      <h3 className="sidebar-title">CATEGORÍAS</h3>
      <ul className="sidebar-list">
        {flatCategories
          .filter(category => category.isActive)
          .map(category => (
            <li key={category._id} className="sidebar-item">
              <NavLink 
                to={`/categories/${category._id}`}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="category-image"
                    onError={(e) => {
                      e.target.src = '/default-category.png';
                    }}
                  />
                )}
                <span className="category-name">{category.name}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SidebarCategories;