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
  UserList,
  Folders,
  ChartBar,
  Star,
  PaintBrush,
  ShoppingCart,
  FileText,
  CreditCard,
  ChartPie,
  Gear,
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

  // EXACTAMENTE LOS MISMOS APARTADOS QUE EL NAVBAR
  const navigationSections = {
    principales: {
      title: "Navegación Principal",
      icon: <House size={16} weight="duotone" />,
      isQuickAccess: true,
      links: [
        { to: "/dashboard", label: "Inicio", icon: <House size={14} />, description: "Panel principal" }
      ]
    },
    personal: {
      title: "Personal",
      icon: <Users size={16} weight="duotone" />,
      links: [
        { to: "/employees", label: "Empleados", icon: <UserList size={14} />, description: "Gestión de personal" },
        { to: "/users", label: "Usuarios", icon: <Users size={14} />, description: "Administración de usuarios" }
      ]
    },
    gestion: {
      title: "Gestión",
      icon: <Folders size={16} weight="duotone" />,
      links: [
        { to: "/catalog-management", label: "Productos", icon: <ChartBar size={14} />, description: "Gestión de productos" },
        { to: "/category-management", label: "Categorías", icon: <Folders size={14} />, description: "Organización" },
        { to: "/address-management", label: "Direcciones", icon: <MapPin size={14} />, description: "Direcciones de envío" },
        { to: "/ReviewsManagement", label: "Reseñas", icon: <Star size={14} />, description: "Opiniones" }
      ]
    },
    herramientas: {
      title: "Herramientas",
      icon: <PaintBrush size={16} weight="duotone" />,
      links: [
        { to: "/design-management", label: "Editor de Diseños", icon: <PaintBrush size={14} />, description: "Herramientas de diseño" },
        { to: "/orders", label: "Pedidos", icon: <ShoppingCart size={14} />, description: "Control de pedidos" }
      ]
    },
    analisis: {
      title: "Análisis",
      icon: <ChartBar size={16} weight="duotone" />,
      links: [
        { to: "/reports", label: "Reportes", icon: <FileText size={14} />, description: "Informes detallados" },
        { to: "/payment-methods", label: "Métodos de Pago", icon: <CreditCard size={14} />, description: "Gestión de pagos" }
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
              <span className="footer-private__brand-subtitle">administración</span>
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

          {/* Estado del sistema */}
          <div className="footer-private__system-status">
            <div className="footer-private__status-item">
              <ChartPie size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--success" />
              <span className="footer-private__status-text">Sistema Operativo</span>
            </div>
            <div className="footer-private__status-item">
              <Clock size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--info" />
              <span className="footer-private__status-text">Última actualización: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Sección central - Navegación IDÉNTICA al navbar */}
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
                  {section.links.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.to} 
                      className="footer-private__nav-link"
                      title={link.description}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {link.icon}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{link.label}</span>
                          <span style={{ fontSize: '11px', opacity: '0.7', marginTop: '2px' }}>
                            {link.description}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enlace directo a perfil */}
          <div className="footer-private__quick-links">
            <a href="/profile" className="footer-private__quick-link">
              <Gear size={16} weight="duotone" />
              Mi Perfil
            </a>
            <a href="/settings" className="footer-private__quick-link">
              <Shield size={16} weight="duotone" />
              Configuración
            </a>
          </div>
        </div>

        {/* Sección derecha - Contacto y redes sociales */}
        <div className="footer-private__section footer-private__section--status">
          <h4 className="footer-private__section-title">Contacto Rápido</h4>

          <div className="footer-private__system-status">
            <div className="footer-private__status-item">
              <Clock size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--info" />
              <span className="footer-private__status-text">
                Horario: Lunes a Viernes<br />
                8:00 AM - 6:00 PM
              </span>
            </div>
            
            <div className="footer-private__status-item">
              <ChartBar size={16} weight="duotone" className="footer-private__status-icon footer-private__status-icon--success" />
              <span className="footer-private__status-text">
                Soporte Técnico<br />
                24/7 Disponible
              </span>
            </div>
          </div>

          <div className="footer-private__social">
            <h5 className="footer-private__social-title">Soporte Inmediato</h5>
            <div className="footer-private__social-icons">
              <a 
                href="https://wa.me/50322345678" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-private__social-link footer-private__social-link--whatsapp"
                title="Contactar por WhatsApp"
              >
                <WhatsappLogo size={20} weight="duotone" />
                <span className="footer-private__whatsapp-text">WhatsApp</span>
              </a>
              
              <a 
                href="mailto:admin@diambars.com" 
                className="footer-private__social-link"
                title="Enviar correo"
              >
                <EnvelopeSimple size={20} weight="duotone" />
              </a>
            </div>
          </div>

          {/* Información adicional */}
        
        </div>
      </div>

      {/* Barra inferior de copyright */}
      <div className="footer-private__bottom">
        <div className="footer-private__bottom-content">
          <div className="footer-private__copyright">
            <span>© {currentYear} DIAMBARS Administración. Todos los derechos reservados.</span>
            <span className="footer-private__version">Panel de Administración v2.1.0</span>
          </div>
          <div className="footer-private__made-with">
            <span>Desarrollado</span>
            <span>para Diambars Sublimado</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;