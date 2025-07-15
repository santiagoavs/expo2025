import React from 'react';
import Navbar from '../../components/navbar/navbar';
import NewCategory from '../../components/newCategory/newCategory';
import CategoryCatalog from '../../components/categoryCatalog/categoryCatalog';
import './category.css';
import { CategoryProvider } from '../../context/categoryContext';

const CategoryPage = () => {
  return (
    <CategoryProvider>
      <div className="category-page-wrapper">
        <Navbar />
        <div className="category-page-content">
          <NewCategory />
          <CategoryCatalog /> 
        </div>
      </div>
    </CategoryProvider>
  );
};

export default CategoryPage;