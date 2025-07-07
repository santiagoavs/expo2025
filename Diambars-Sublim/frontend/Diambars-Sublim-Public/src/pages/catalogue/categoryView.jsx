import { useParams } from 'react-router-dom';
import SidebarFilters from '../../components/filters/SidebarFilters';
import ProductCard from '../../components/products/ProductCard';
import Footer from '../../components/UI/footer/footer';
import './categoryView.css';

const dummyProducts = [
  { name: 'De vestir', image: '/images/products/vestir.png' },
  { name: 'Cuello V', image: '/images/products/cuello-v.png' },
  // etc...
];

export default function CategoryView() {
  const { categoria } = useParams();

  return (
    <>
      <div className="category-page">
        <SidebarFilters />
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
      <Footer />
    </>
  );
}
