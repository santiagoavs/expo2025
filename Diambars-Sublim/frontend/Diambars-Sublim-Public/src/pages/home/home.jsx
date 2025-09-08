import { useEffect, useRef } from 'react';
import './home.css';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const heroContainerRef = useRef(null);

  useEffect(() => {
    const heroContainer = heroContainerRef.current;
    if (!heroContainer) return;

    const handleMouseMove = (e) => {
      const rect = heroContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Actualizar la posición del pseudo-elemento ::after usando CSS custom properties
      heroContainer.style.setProperty('--mouse-x', `${x}px`);
      heroContainer.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseEnter = () => {
      heroContainer.classList.add('mouse-tracking');
    };

    const handleMouseLeave = () => {
      heroContainer.classList.remove('mouse-tracking');
    };

    heroContainer.addEventListener('mousemove', handleMouseMove);
    heroContainer.addEventListener('mouseenter', handleMouseEnter);
    heroContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroContainer.removeEventListener('mousemove', handleMouseMove);
      heroContainer.removeEventListener('mouseenter', handleMouseEnter);
      heroContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container" ref={heroContainerRef}>
          <img 
            src="/images/navbar/Logo-2.png" 
            alt="Logo" 
            className="hero-logo"
          />
          <h1 className="hero-title">
            Traemos tus ideas a la realidad.
          </h1>
          <p className="hero-subtitle">
            Empieza a crear tus productos favoritos. <br />Explora nuestro catálogo
            y elige el producto de tu interés para personalizarlo.
          </p>
          <button 
            className="hero-cta-button" 
            onClick={() => navigate('/catalogue')}
          >
            <span>Explorar Catálogo</span>
            <svg className="slots-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="slots-indicator">
            <svg className="products-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Más de 50 productos a personalizar</span>
          </div>

          {/* Product Carousel */}
          <div className="hero-carousel">
            <div className="hero-carousel-track">
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/4A90E2/ffffff?text=Producto+1" alt="Producto 1" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/357ABD/ffffff?text=Producto+2" alt="Producto 2" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/87CEEB/ffffff?text=Producto+3" alt="Producto 3" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/4A90E2/ffffff?text=Producto+4" alt="Producto 4" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/357ABD/ffffff?text=Producto+5" alt="Producto 5" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/87CEEB/ffffff?text=Producto+6" alt="Producto 6" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/4A90E2/ffffff?text=Producto+7" alt="Producto 7" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/357ABD/ffffff?text=Producto+8" alt="Producto 8" />
              </div>
              {/* Duplicate first items for seamless loop */}
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/4A90E2/ffffff?text=Producto+1" alt="Producto 1" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/357ABD/ffffff?text=Producto+2" alt="Producto 2" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/87CEEB/ffffff?text=Producto+3" alt="Producto 3" />
              </div>
              <div className="hero-carousel-item">
                <img src="https://via.placeholder.com/280x160/4A90E2/ffffff?text=Producto+4" alt="Producto 4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="content-grid">
          <div className="content-card">
            <h3>Lorem Ipsum Dolor</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
            <a href="#" className="content-card-link">Saber más →</a>
          </div>

          <div className="content-card">
            <h3>Consectetur Adipiscing</h3>
            <p>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
            </p>
            <a href="#" className="content-card-link">Descubrir →</a>
          </div>

          <div className="content-card">
            <h3>Eiusmod Tempor</h3>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
            </p>
            <a href="#" className="content-card-link">Explorar →</a>
          </div>
        </div>
      </section>


      <ContactButton />
      <Footer />
    </div>
  );
}