import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const heroContainerRef = useRef(null);
  const videoRef = useRef(null);
  const tshirtSectionRef = useRef(null);
  
  // T-shirt template switching images state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const switchingImages = [
    'images/tshirt-designs/design1.webp',
    'images/tshirt-designs/design2.png',
    'images/tshirt-designs/design3.jpg',
    'images/tshirt-designs/design4.png',
    'images/tshirt-designs/design5.jpg',
    'images/tshirt-designs/design6.webp'
  ];

  // Random hover animation system
  useEffect(() => {
    const startRandomHoverAnimation = () => {
      const textItems = document.querySelectorAll('.custom-text-item');
      
      const triggerRandomHover = () => {
        // Remove any existing auto-hover classes
        textItems.forEach(item => item.classList.remove('auto-hover'));
        
        // Select a random text item
        if (textItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * textItems.length);
          const selectedItem = textItems[randomIndex];
          
          // Add auto-hover class
          selectedItem.classList.add('auto-hover');
          
          // Remove the class after 1 second
          setTimeout(() => {
            selectedItem.classList.remove('auto-hover');
          }, 1000);
        }
      };

      // Start random hover after initial animations complete (6 seconds)
      const initialDelay = setTimeout(() => {
        triggerRandomHover(); // First trigger
        
        // Then continue with random intervals between 2-4 seconds
        const randomHoverInterval = setInterval(() => {
          triggerRandomHover();
        }, Math.random() * 2000 + 2000); // Random between 2-4 seconds
        
        return () => clearInterval(randomHoverInterval);
      }, 6000);

      return () => clearTimeout(initialDelay);
    };

    const cleanup = startRandomHoverAnimation();
    return cleanup;
  }, []);

  useEffect(() => {
    // Force video to play and ensure proper rendering
    const video = videoRef.current;
    if (video) {
      video.play().catch(console.log);
      // Force repaint to fix rendering issues
      video.style.transform = 'translateZ(0)';
    }

    // T-shirt image switching interval
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % switchingImages.length
      );
    }, 800); // Switch every 800ms for high speed

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
      clearInterval(imageInterval);
      heroContainer.removeEventListener('mousemove', handleMouseMove);
      heroContainer.removeEventListener('mouseenter', handleMouseEnter);
      heroContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Parallax effect for t-shirt section
  useEffect(() => {
    const handleScroll = () => {
      const tshirtSection = tshirtSectionRef.current;
      if (!tshirtSection) return;

      const rect = tshirtSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress when section is in view
      let scrollProgress = 0;
      
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        // Section is in viewport
        const sectionHeight = rect.height;
        const visibleHeight = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
        scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + sectionHeight)));
      }
      
      // Apply parallax transform and opacity
      const parallaxOffset = scrollProgress * 50; // Adjust multiplier for effect intensity
      const backgroundOpacity = Math.min(0.95, scrollProgress * 1.2);
      
      tshirtSection.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
      tshirtSection.style.setProperty('--background-opacity', backgroundOpacity);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
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
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video"
                >
                  <source src="/videos/product1.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video"
                >
                  <source src="/videos/product2.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
                <img src="images/home/product3.png" alt="Producto 3" />
              </div>
              <div className="hero-carousel-item">
                <img src="images/home/product4.png" alt="Producto 4" />
              </div>
              <div className="hero-carousel-item">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video"
                >
                  <source src="/videos/product5.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video product6-video"
                >
                  <source src="/videos/product6.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
                <img src="images/home/product7.png" alt="Producto 7" />
              </div>
              <div className="hero-carousel-item">
                <img src="images/home/product8.png" alt="Producto 7" />
              </div>
              {/* Duplicate first items for seamless loop */}
              <div className="hero-carousel-item">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video"
                >
                  <source src="/videos/product1.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  className="carousel-video"
                >
                  <source src="/videos/product2.mp4" type="video/mp4" />
                  
                </video>
              </div>
              <div className="hero-carousel-item">
              <img src="images/home/product3.png" alt="Producto 3" />
              </div>
              <div className="hero-carousel-item">
                <img src="images/home/product4.png" alt="Producto 4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* T-shirt Template Section */}
      <section className="tshirt-template-section">
        <div className="tshirt-container">
          <h2 className="tshirt-title">Explota tu cretividad</h2>
          <p className="tshirt-subtitle">Mira cómo tus diseños cobran vida en tiempo real</p>
          
          <div className="tshirt-customization-area">
            {/* Left side text */}
            <div className="customization-text left-text">
              <span className="custom-text-item">Añade tu logo</span>
              <span className="custom-text-item">Cambia colores</span>
              <span className="custom-text-item">Elige tipografías</span>
            </div>

            <div className="tshirt-template">
              <img 
                src="images/home/white-t-shirt.webp" 
                alt="White T-shirt Template" 
                className="tshirt-base"
              />
              
              {/* Switching design overlay */}
              <div className="design-overlay">
                {switchingImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Design ${index + 1}`}
                    className={`design-image ${
                      index === currentImageIndex ? 'active' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right side text */}
            <div className="customization-text right-text">
              <span className="custom-text-item">Sube imágenes</span>
              <span className="custom-text-item">Ajusta tamaños</span>
              <span className="custom-text-item">Añade formas</span>
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