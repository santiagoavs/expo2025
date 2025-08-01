import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/Navbar';
import CategoryForm from '../../components/Category/CategoryForm';
import CategoryCatalog from '../../components/Category/CategoryCatalog';
import './category.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const CategoryPage = () => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quart'
    });
  }, []);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleClearEditing = () => {
    setEditingCategory(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => !prev);
  };

  return (
    <div className="category-page-container">
      <Navbar />
      <div className="category-content-wrapper">
        {/* Formulario fijado al viewport */}

          <CategoryForm 
            editingCategory={editingCategory} 
            clearEditing={handleClearEditing}
            onSuccess={handleSuccess}
          />

        {/* Catálogo fijado al viewport */}

          <CategoryCatalog 
            onEditCategory={handleEditCategory} 
            refreshTrigger={refreshTrigger}
          />

      </div>
    </div>
  );
};

export default CategoryPage;
