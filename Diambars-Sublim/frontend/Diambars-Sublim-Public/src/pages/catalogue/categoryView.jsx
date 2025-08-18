// src/pages/catalogue/categoryView.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SidebarFilters from '../../components/filters/sidebarFilters';
import ProductCard from '../../components/products/ProductCard';
import Footer from '../../components/UI/footer/footer';
import './categoryView.css';

const dummyProducts = [
  { name: 'De vestir', image: '/images/products/vestir.png' },
  { name: 'Clásica', image: '/images/products/clasica.png' },
  { name: 'Manga Corta', image: '/images/products/manga-corta.png' },
  { name: 'Cuello V', image: '/images/products/cuello-v.png' },
  { name: 'Manga Larga', image: '/images/products/manga-larga.png' },
  { name: 'Sin Mangas', image: '/images/products/sin-mangas.png' },
  { name: 'Polo', image: '/images/products/polo.png' },
  { name: 'Deportiva', image: '/images/products/deportiva.png' },
  { name: 'Cuello Mao', image: '/images/products/cuello-mao.png' },
];

export default function CategoryView() {
  const { categoria } = useParams();
  const [activeFilters, setActiveFilters] = useState({});

  const handleFiltersChange = (newFilters) => {
    console.log('Filtros actualizados:', newFilters);
    setActiveFilters(newFilters);
    // Aquí puedes agregar lógica para filtrar los productos
  };

  return (
    <div className='category-page'>
      <div className="category-content-wrapper">
        <div className="category-container">
          <SidebarFilters 
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
          />
          <div className="product-grid">
            {dummyProducts.map((prod, idx) => (
              <ProductCard
                key={idx}
                name={prod.name}
                image={prod.image}
                onCustomize={() => alert(`Personalizar ${prod.name}`)}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}