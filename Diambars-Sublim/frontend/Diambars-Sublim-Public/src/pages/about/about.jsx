import React, { useState } from 'react';
import './about.css';
import bgLogo from '/images/aboutUs/bgLogo.png';
import Footer from '../../components/UI/footer/footer';
import ContactButton from '../../components/UI/contactButton/contactButton';

const About = () => {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'terms', 'privacy', 'cookies'
  const [openAccordions, setOpenAccordions] = useState({});

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setOpenAccordions({}); // Cerrar todos los acordeones al cambiar de pestaña
  };

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Componente Acordeón
  const AccordionItem = ({ id, title, children, tag }) => (
    <div className="accordion-item" id={tag}>
      <div 
        className="accordion-header" 
        onClick={() => toggleAccordion(id)}
      >
        <h3>{title}</h3>
        <span className={`accordion-arrow ${openAccordions[id] ? 'open' : ''}`}></span>
      </div>
      <div className={`accordion-content ${openAccordions[id] ? 'open' : ''}`}>
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );

  // Contenido de cada pestaña
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              En Diambars Sublim nos apasiona transformar objetos cotidianos en piezas únicas y memorables. Nacimos con la visión de ofrecer a nuestros clientes la libertad de expresar su estilo y creatividad a través de la técnica de sublimación, convirtiendo desde tazas y camisetas hasta llaveros, cojines y más, en verdaderos artículos personalizados.
            </div>
            
            <div className='about-container'>
              <AccordionItem 
                id="purpose" 
                title="¿Nuestro propósito?"
              >
                <p>
                  En Diambars Sublim nos apasiona transformar objetos cotidianos en piezas únicas y memorables. Nacimos con la visión de ofrecer a nuestros clientes la libertad de expresar su estilo y creatividad a través de la técnica de sublimación, convirtiendo desde tazas y camisetas hasta llaveros, cojines y más, en verdaderos artículos personalizados.
                </p>
              </AccordionItem>

              <AccordionItem 
                id="features" 
                title="¿Nuestras características?"
              >
                <ul>
                  <li><strong>Calidad y detalle:</strong> Seleccionamos materiales premium y cuidamos cada etapa de impresión para asegurar resultados vibrantes y duraderos.</li>
                  <li><strong>Creatividad colaborativa:</strong> Trabajamos codo a codo contigo, adaptándonos a tus ideas y proponiendo opciones para potenciar tu diseño.</li>
                  <li><strong>Flexibilidad y variedad:</strong> Contamos con un catálogo amplio de objetos y admitimos tanto pedidos individuales como de gran volumen.</li>
                  <li><strong>Compromiso y responsabilidad:</strong> Cumplimos plazos, cuidamos el medio ambiente con tintas y procesos eco-amigables, y ofrecemos asesoría personalizada en todo momento.</li>
                </ul>
              </AccordionItem>

              <AccordionItem 
                id="products" 
                title="¿Qué sublimamos?"
              >
                <ul>
                  <li><strong>Textiles:</strong> camisetas, sudaderas, bolsas de tela, pañuelos y más.</li>
                  <li><strong>Artículos de cerámica y vidrio:</strong> tazas, platos, vasos, jarras.</li>
                  <li><strong>Accesorios:</strong> llaveros, carcasas de móvil, mousepads.</li>
                  <li><strong>Decoración:</strong> cojines, tapetes, cuadros y puzzles.</li>
                </ul>
                <p>Y si tienes en mente algún objeto especial, ¡pregúntanos! Nos encanta explorar nuevas posibilidades.</p>
              </AccordionItem>

              <AccordionItem 
                id="custom-orders" 
                title="Pedidos Personalizados"
                tag="custom-orders"
              >
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                <ul>
                  <li>Lorem ipsum dolor sit amet consectetur</li>
                  <li>Sed do eiusmod tempor incididunt ut labore</li>
                  <li>Ut enim ad minim veniam quis nostrud</li>
                  <li>Duis aute irure dolor in reprehenderit</li>
                </ul>
                <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </AccordionItem>

              <AccordionItem 
                id="bulk-orders" 
                title="Pedidos al Mayoreo"
                tag="bulk-orders"
              >
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                <ul>
                  <li>Lorem ipsum dolor sit amet consectetur adipiscing</li>
                  <li>Sed do eiusmod tempor incididunt ut labore et dolore</li>
                  <li>Ut enim ad minim veniam quis nostrud exercitation</li>
                  <li>Duis aute irure dolor in reprehenderit voluptate</li>
                  <li>Excepteur sint occaecat cupidatat non proident</li>
                </ul>
                <p>Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'terms':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Términos y Condiciones de Uso - Diambars Sublim
            </div>
            <div className='about-container'>
              <AccordionItem id="terms-general" title="Términos Generales">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </AccordionItem>
              
              <AccordionItem id="terms-services" title="Uso de Servicios">
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.</p>
                <ul>
                  <li>Lorem ipsum dolor sit amet consectetur</li>
                  <li>Sed do eiusmod tempor incididunt</li>
                  <li>Ut enim ad minim veniam quis nostrud</li>
                </ul>
              </AccordionItem>
              
              <AccordionItem id="terms-liability" title="Responsabilidades">
                <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
                <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Política de Privacidad - Protección de tus datos personales
            </div>
            <div className='about-container'>
              <AccordionItem id="privacy-collection" title="Recolección de Datos">
                <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.</p>
                <ul>
                  <li>Cupiditate non provident similique sunt</li>
                  <li>In culpa qui officia deserunt mollitia</li>
                  <li>Animi id est laborum et dolorum fuga</li>
                </ul>
              </AccordionItem>
              
              <AccordionItem id="privacy-usage" title="Uso de la Información">
                <p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime.</p>
                <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
              </AccordionItem>
              
              <AccordionItem id="privacy-protection" title="Protección de Datos">
                <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      case 'cookies':
        return (
          <div className="about-main-container">
            <div className="about-main-text">
              Política de Cookies - Información sobre el uso de cookies en nuestro sitio web
            </div>
            <div className='about-container'>
              <AccordionItem id="cookies-what" title="¿Qué son las Cookies?">
                <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.</p>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
              </AccordionItem>
              
              <AccordionItem id="cookies-types" title="Tipos de Cookies">
                <p>Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas.</p>
                <ul>
                  <li>Cookies técnicas o funcionales</li>
                  <li>Cookies de análisis o medición</li>
                  <li>Cookies de personalización</li>
                  <li>Cookies publicitarias o marketing</li>
                </ul>
              </AccordionItem>
              
              <AccordionItem id="cookies-management" title="Gestión de Cookies">
                <p>Sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est.</p>
                <p>Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore.</p>
              </AccordionItem>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="about-page">
      <img src={bgLogo} alt="Logo de fondo" className="about-bg-logo" />

      {/* Sistema de pestañas */}
      <div className="about-tabs-container">
        <div className="about-tabs">
          <button 
            className={activeTab === 'about' ? 'active' : ''} 
            onClick={() => handleTabSwitch('about')}
          >
            Conócenos
          </button>
          <button 
            className={activeTab === 'terms' ? 'active' : ''} 
            onClick={() => handleTabSwitch('terms')}
          >
            Términos y Condiciones
          </button>
          <button 
            className={activeTab === 'privacy' ? 'active' : ''} 
            onClick={() => handleTabSwitch('privacy')}
          >
            Política de Privacidad
          </button>
          <button 
            className={activeTab === 'cookies' ? 'active' : ''} 
            onClick={() => handleTabSwitch('cookies')}
          >
            Política de Cookies
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {renderTabContent()}
      
      <ContactButton />
      <Footer />
    </div>
  );
};

export default About;