import React from 'react';
import './about.css';
import bgLogo from '/images/aboutUs/bgLogo.png';
import Footer from '../../components/UI/footer/footer';
import ContactButton from '../../components/UI/contactButton/contactButton';

const About = () => {
  return (
    <div className="about-page">
      <img src={bgLogo} alt="Logo de fondo" className="about-bg-logo" />

      <h1 className="about-title">Conócenos</h1>
      <div className="about-main-container">
      <div className="about-main-text">
        En Diambars Sublim nos apasiona transformar objetos cotidianos en piezas únicas y memorables. Nacimos con la visión de ofrecer a nuestros clientes la libertad de expresar su estilo y creatividad a través de la técnica de sublimación, convirtiendo desde tazas y camisetas hasta llaveros, cojines y más, en verdaderos artículos personalizados.
      </div>
      <div className='about-container'>
      <div className="about-section">
        <h3>¿Nuestro propósito?</h3>
        <p>
          En Diambars Sublim nos apasiona transformar objetos cotidianos en piezas únicas y memorables. Nacimos con la visión de ofrecer a nuestros clientes la libertad de expresar su estilo y creatividad a través de la técnica de sublimación, convirtiendo desde tazas y camisetas hasta llaveros, cojines y más, en verdaderos artículos personalizados.
        </p>
      </div>

      <div className="about-section">
        <h3>¿Nuestras características?</h3>
        <ul>
          <li><strong>Calidad y detalle:</strong> Seleccionamos materiales premium y cuidamos cada etapa de impresión para asegurar resultados vibrantes y duraderos.</li>
          <li><strong>Creatividad colaborativa:</strong> Trabajamos codo a codo contigo, adaptándonos a tus ideas y proponiendo opciones para potenciar tu diseño.</li>
          <li><strong>Flexibilidad y variedad:</strong> Contamos con un catálogo amplio de objetos y admitimos tanto pedidos individuales como de gran volumen.</li>
          <li><strong>Compromiso y responsabilidad:</strong> Cumplimos plazos, cuidamos el medio ambiente con tintas y procesos eco-amigables, y ofrecemos asesoría personalizada en todo momento.</li>
        </ul>
      </div>
      <div className="about-section">
        <h3>¿Qué sublimamos?</h3>
        <ul>
          <li><strong>Textiles:</strong> camisetas, sudaderas, bolsas de tela, pañuelos y más.</li>
          <li><strong>Artículos de cerámica y vidrio:</strong> tazas, platos, vasos, jarras.</li>
          <li><strong>Accesorios:</strong> llaveros, carcasas de móvil, mousepads.</li>
          <li><strong>Decoración:</strong> cojines, tapetes, cuadros y puzzles.</li>
        </ul>
        <p>¿Y si tienes en mente algún objeto especial, ¡pregúntanos! Nos encanta explorar nuevas posibilidades.</p>
      </div>
      </div>
      </div>
      <ContactButton />
      <Footer />
    </div>
  );
};

export default About;
