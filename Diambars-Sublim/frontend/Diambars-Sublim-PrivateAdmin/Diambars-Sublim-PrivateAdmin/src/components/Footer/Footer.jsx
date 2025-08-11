// src/components/Footer/Footer.jsx
import React from 'react';
import { 
  Phone, 
  MapPin, 
  EnvelopeSimple, 
  InstagramLogo, 
  FacebookLogo, 
  TwitterLogo, 
  LinkedinLogo, 
  Heart,
  Shield,
  Clock
} from '@phosphor-icons/react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-private">
      <div className="footer-private__container">
        
        {/* Sección izquierda - Información de contacto */}
        <div className="footer-private__section footer-private__section--info">
          <div className="footer-private__brand">
            <div className="footer-private__logo">
              <img src="/logo.png" alt="Diambars Logo" className="footer-private__logo-img" />
            </div>
            <div className="footer-private__brand-text">
              <h3 className="footer-private__brand-name">DIAMBARS</h3>
              <span className="footer-private__brand-subtitle">sublimado</span>
            </div>
          </div>
          
          <div className="footer-private__contact">
            <div className="footer-private__contact-item">
              <Phone size={16} weight="duotone" className="footer-private__contact-icon" />
              <div className="footer-private__contact-content">
                <span className="footer-private__contact-label">Teléfono</span>
                <span className="footer-private__contact-value">+503 2234-5678</span>
              </div>
            </div>
            
            <div className="footer-private__contact-item">
              <MapPin size={16} weight="duotone" className="footer-private__contact-icon" />
              <div className="footer-private__contact-content">
                <span className="footer-private__contact-label">Ubicación</span>
                <span className="footer-private__contact-value">San Salvador, El Salvador</span>
              </div>
            </div>
            
            <div className="footer-private__contact-item">
              <EnvelopeSimple size={16} weight="duotone" className="footer-private__contact-icon" />
              <div className="footer-private__contact-content">
                <span className="footer-private__contact-label">Correo</span>
                <span className="footer-private__contact-value">admin@diambars.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección central - Enlaces útiles */}
        <div className="footer-private__section footer-private__section--links">
          <h4 className="footer-private__section-title">Enlaces Útiles</h4>
          <div className="footer-private__links-grid">
            <div className="footer-private__links-column">
              <a href="/catalog-management" className="footer-private__link">
                Gestión de Catálogo
              </a>
              <a href="/orders" className="footer-private__link">
                Pedidos
              </a>
              <a href="/employees" className="footer-private__link">
                Empleados
              </a>
            </div>
            <div className="footer-private__links-column">
              <a href="/users" className="footer-private__link">
                Usuarios
              </a>
              <a href="/category-management" className="footer-private__link">
                Categorías
              </a>
              <a href="/profile" className="footer-private__link">
                Perfil
              </a>
            </div>
          </div>
        </div>

        {/* Sección derecha - Estado del sistema y redes */}
        <div className="footer-private__section footer-private__section--status">
          <h4 className="footer-private__section-title">Estado del Sistema</h4>
          
          <div className="footer-private__system-status">            
            <div className="footer-private__status-item">
              <Clock size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--info" />
              <span className="footer-private__status-text">Última actualización: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="footer-private__social">
            <h5 className="footer-private__social-title">Síguenos</h5>
            <div className="footer-private__social-icons">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link"
                title="Facebook"
              >
                <FacebookLogo size={18} weight="duotone" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link"
                title="Instagram"
              >
                <InstagramLogo size={18} weight="duotone" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link"
                title="Twitter"
              >
                <TwitterLogo size={18} weight="duotone" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link"
                title="LinkedIn"
              >
                <LinkedinLogo size={18} weight="duotone" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior de copyright */}
      <div className="footer-private__bottom">
        <div className="footer-private__copyright">
          <span>© {currentYear} DIAMBARS Sublimado. Todos los derechos reservados.</span>
          <span className="footer-private__version">Panel de Administración v2.1.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;