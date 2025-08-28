// src/components/Footer/Footer.jsx
import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  EnvelopeSimple, 
  WhatsappLogo,
  Shield,
  Clock,
  House,
  Users,
  Folders,
  PaintBrush,
  ChartBar,
  Calculator,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (section) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationSections = {
    principales: {
      title: "Accesos Rápidos",
      icon: <House size={16} weight="duotone" />,
      isQuickAccess: true,
      links: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/quotes", label: "Cotización" },
        { to: "/design-management", label: "Editor de Diseños" }
      ]
    },
    personal: {
      title: "Personal",
      icon: <Users size={16} weight="duotone" />,
      links: [
        { to: "/employees", label: "Empleados" },
        { to: "/users", label: "Usuarios" }
      ]
    },
    gestion: {
      title: "Gestión",
      icon: <Folders size={16} weight="duotone" />,
      links: [
        { to: "/catalog-management", label: "Catálogo" },
        { to: "/orders", label: "Pedidos" },
        { to: "/category-management", label: "Categorías" },
        { to: "/reviews", label: "Reseñas" }
      ]
    },
    herramientas: {
      title: "Herramientas",
      icon: <PaintBrush size={16} weight="duotone" />,
      links: [
        { to: "/manual-orders", label: "Pedido Manual" }
      ]
    },
    analisis: {
      title: "Análisis",
      icon: <ChartBar size={16} weight="duotone" />,
      links: [
        { to: "/payment-dashboard", label: "Dashboard de Pagos" },
        { to: "/reports", label: "Reportes" },
        { to: "/address-dashboard", label: "Dashboard de Direcciones" }
      ]
    }
  };

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

        {/* Sección central - Navegación completa con dropdowns */}
        <div className="footer-private__section footer-private__section--navigation">
          <h4 className="footer-private__section-title">Navegación del Sistema</h4>
          
          <div className="footer-private__navigation-sections">
            {Object.entries(navigationSections).map(([key, section]) => (
              <div 
                key={key} 
                className={`footer-private__nav-section ${
                  section.isQuickAccess ? 'footer-private__nav-section--quick-access' : ''
                }`}
              >
                <div 
                  className="footer-private__nav-header"
                  onClick={() => toggleDropdown(key)}
                >
                  <div className="footer-private__nav-title">
                    {section.icon}
                    <span>{section.title}</span>
                    {section.isQuickAccess && (
                      <span className="footer-private__quick-badge"></span>
                    )}
                  </div>
                  <div className="footer-private__nav-toggle">
                    {openDropdowns[key] ? 
                      <CaretUp size={14} weight="bold" /> : 
                      <CaretDown size={14} weight="bold" />
                    }
                  </div>
                </div>
                
                <div className={`footer-private__nav-links ${openDropdowns[key] ? 'footer-private__nav-links--open' : ''}`}>
                  {section.links.map((link) => (
                    <a 
                      key={link.to} 
                      href={link.to} 
                      className="footer-private__nav-link"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enlace directo a perfil */}
          <div className="footer-private__quick-links">
            <a href="/profile" className="footer-private__quick-link">
              <Shield size={16} weight="duotone" />
              Mi Perfil
            </a>
          </div>
        </div>

        {/* Sección derecha - Estado del sistema y WhatsApp */}
        <div className="footer-private__section footer-private__section--status">
          <h4 className="footer-private__section-title">Estado del Sistema</h4>
          
          <div className="footer-private__system-status">            
            <div className="footer-private__status-item">
              <Clock size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--info" />
              <span className="footer-private__status-text">Última actualización: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="footer-private__social">
            <h5 className="footer-private__social-title">Contacto</h5>
            <div className="footer-private__social-icons">
              <a 
                href="https://wa.me/50322345678" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link footer-private__social-link--whatsapp"
                title="WhatsApp"
              >
                <WhatsappLogo size={20} weight="duotone" />
                <span className="footer-private__whatsapp-text">WhatsApp</span>
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