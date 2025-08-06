import React from 'react';
import './CatalogManagement.css';
import StatCard from '../../components/catalogManagement/statCard';
import ProductCard from '../../components/catalogManagement/productCard';
import Navbar from '../../components/Navbar/Navbar';
import { TbShirt } from "react-icons/tb";
import { MdPendingActions } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

const CatalogManagement = () => {
  const navigate = useNavigate();

  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      number: 24,
      title: "Productos activos",
      iconComponent: TbShirt,
      iconColor: "icon-blue"
    },
    {
      number: 8,
      title: "Productos pendientes",
      iconComponent: MdPendingActions,
      iconColor: "icon-pink"
    },
    {
      number: "2 horas",
      title: "Últimos artículos subidos",
      iconComponent: BiTime,
      iconColor: "icon-green"
    }
  ];

  // Datos de ejemplo para los productos recientes
  const products = [
    {
      id: 'REC001',
      image: "/src/img/camiseta.png",
      title: "Diseño custom Camiseta",
      date: "Dec 8, 2024",
      price: "24.99",
      status: "Active"
    },
    {
      id: 'REC002',
      image: "/src/img/taza.png",
      title: "Sublimacion Taza",
      date: "Dec 7, 2024",
      price: "19.99",
      status: "Pending"
    },
    {
      id: 'REC003',
      image: "/src/img/funda.png",
      title: "Print case teléfono",
      date: "Dec 6, 2024",
      price: "19.99",
      status: "Active"
    },
    {
      id: 'REC004',
      image: "/src/img/bolso.png",
      title: "Custom Tote Bag",
      date: "Dec 5, 2024",
      price: "22.99",
      status: "Active"
    }
  ];

  // Datos específicos para la sección "Todos los productos"
  const allProducts = [
    {
      id: 'ALL001',
      image: "/src/img/camiseta.png",
      title: "Camiseta Premium",
      date: "Dec 1, 2024",
      price: "29.99",
      status: "Active"
    },
    {
      id: 'ALL002',
      image: "/src/img/taza.png",
      title: "Taza Personalizada",
      date: "Nov 30, 2024",
      price: "17.99",
      status: "Active"
    },
    {
      id: 'ALL003',
      image: "/src/img/funda.png",
      title: "Funda iPhone Pro",
      date: "Nov 29, 2024",
      price: "24.99",
      status: "Pending"
    },
    {
      id: 'ALL004',
      image: "/src/img/bolso.png",
      title: "Bolso Eco",
      date: "Nov 28, 2024",
      price: "27.99",
      status: "Active"
    },
    {
      id: 'ALL005',
      image: "/src/img/camiseta.png",
      title: "Camiseta Deportiva",
      date: "Nov 27, 2024",
      price: "34.99",
      status: "Active"
    },
    {
      id: 'ALL006',
      image: "/src/img/taza.png",
      title: "Taza Térmica",
      date: "Nov 26, 2024",
      price: "21.99",
      status: "Active"
    },
    {
      id: 'ALL007',
      image: "/src/img/funda.png",
      title: "Funda Samsung",
      date: "Nov 25, 2024",
      price: "22.99",
      status: "Pending"
    },
    {
      id: 'ALL008',
      image: "/src/img/bolso.png",
      title: "Bolso Premium",
      date: "Nov 24, 2024",
      price: "32.99",
      status: "Active"
    },
    {
      id: 'ALL009',
      image: "/src/img/camiseta.png",
      title: "Camiseta Vintage",
      date: "Nov 23, 2024",
      price: "26.99",
      status: "Active"
    },
    {
      id: 'ALL010',
      image: "/src/img/taza.png",
      title: "Taza Mágica",
      date: "Nov 22, 2024",
      price: "23.99",
      status: "Active"
    }
  ];

  return (
    <div className="main-container">
      {/* Navbar */}
      <Navbar />
      
      <div className="catalog-container">
        <div className="content-wrapper">
          {/* Header del catálogo */}
          <div className="catalog-header">
            <h1>Gestion de catalogo</h1>
            <p>Gestiona tu catálogo personalizado de sublimación e impresión</p>
          </div>

          {/* Contenedor de estadísticas */}
          <div className="stats-container">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                title={stat.title}
                IconComponent={stat.iconComponent}
                iconColor={stat.iconColor}
              />
            ))}
          </div>

          {/* Sección de productos recientes */}
          <div className="section-header">
            <h2>Productos recientes</h2>
            <div className="header-actions">
              <select className="sort-select">
                <option value="">Ordenar por</option>
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
              </select>
              <button 
                className="manage-catalog-btn"
                onClick={() => navigate('/product-creation')}
              >
                Crear producto
              </button>
            </div>
          </div>

          {/* Grid de productos recientes */}
          <div className="products-grid products-grid-recent">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                title={product.title}
                date={product.date}
                price={product.price}
                status={product.status}
              />
            ))}
          </div>

          {/* Nueva sección: Todos los productos */}
          <div className="section-header" style={{ marginTop: '48px' }}>
            <h2>Todos los productos</h2>
            <div className="header-actions">
              <select className="sort-select">
                <option value="">Ordenar por</option>
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
              </select>
              <button className="manage-catalog-btn">
                Gestionar productos
              </button>
            </div>
          </div>

          {/* Grid de todos los productos */}
          <div className="products-grid products-grid-all">
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                title={product.title}
                date={product.date}
                price={product.price}
                status={product.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogManagement;