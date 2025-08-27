import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faGithub
} from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para el newsletter
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Sección principal de la marca */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="images/footer/Logo-B&W.png" alt="Diambars Sublim Logo" className="footer-logo-img" />
            <h2>Diambars Sublim</h2>
          </div>
          <p className="footer-tagline">Calidad superior en sublimación</p>
          <p className="footer-description">
            Nos especializamos en la creatividad de nuestros clientes; si puedes imaginarlo, puedes hacerlo. En Diambars Sublim eres
            tú el que decide lo que quiere, desde qué material utilizaremos para fabricar tu producto, hasta las ideas más únicas
            para la personalización de los mismos. No te quedes con las ganas, coméntanos hasta el más mínimo detalle, nosotros 
            hacemos el resto.
          </p>
          <div className="footer-contact">
            <div className="contact-item">
              <span className="contact-label-footer">Teléfono:</span>
              <span>+503 7016-4304</span>
            </div>
            <div className="contact-item">
              <span className="contact-label-footer">Email:</span>
              <span>diambars.sublim@gmail.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label-footer">Dirección:</span>
              <span>Avenida Aguilares 218 San Salvador CP, San Salvador 1101</span>
            </div>
          </div>
        </div>

        {/* Sección de navegación principal */}
        <div className="footer-section">
          <h4>Explora</h4>
          <div className="footer-links">
            <Link to="/catalogue">Catálogo</Link>
            <Link to="/about">Acerca de nosotros</Link>
            <Link to="/contact">Contáctanos</Link>
            <Link to="/reviews">Reseñas</Link>
          </div>
        </div>

        {/* Sección de servicios */}
        <div className="footer-section">
          <h4>Servicios</h4>
          <div className="footer-links">
            <Link to="/profile">Mi Cuenta</Link>
            <a href="#custom-orders">Pedidos personalizados</a>
            <a href="#bulk-orders">Pedidos al mayoreo</a>
            <a href="/design-hub">Revisa y administra tus diseños</a>
          </div>
        </div>

        {/* Sección de redes sociales y newsletter */}
        <div className="footer-section social-section">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a 
              href="https://facebook.com/Diambars.Sublim" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Facebook"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a 
              href="https://instagram.com/Diambars.Sublim" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a 
              href="https://github.com/santiagoavs/expo2025/graphs/contributors" 
              target="_blank" 
              rel="noopener noreferrer"
              title="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
          
          <div className="newsletter">
            <p>Introducte tu correo para recibir notificaciones de ofertas exclusivas y novedades.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="Tu email aquí"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                Recibir notificaciones
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Diambars Sublim. Todos los derechos reservados.</p>
        </div>
        <div className="footer-legal">
          <a href="/privacy">Política de Privacidad</a>
          <a href="/terms">Términos y Condiciones</a>
          <a href="/cookies">Política de Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;