import React from 'react';
import Navbar from '../../components/navbar/navbar';
import NewCategory from '../../components/newCategory/newCategory';
import CategoryCatalog from '../../components/categoryCatalog/categoryCatalog';
import './category.css';

const CategoryPage = () => {
  return (
    <div className="category-page-wrapper">
      <Navbar />
      <div className="category-page-content">
        <NewCategory />
        <CategoryCatalog /> 
      </div>
    </div>
  );
};

export default CategoryPage;