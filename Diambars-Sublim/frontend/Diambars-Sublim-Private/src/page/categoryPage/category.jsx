import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NewCategory from '../../components/NewCategory/NewCategory';
import CategoryCatalog from '../../components/CategoryCatalog/CategoryCatalog';
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