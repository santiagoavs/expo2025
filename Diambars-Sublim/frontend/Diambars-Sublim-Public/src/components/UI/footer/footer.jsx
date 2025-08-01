import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';
import './footer.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


  

const Footer = () => {

  return (
    
    <footer className="footer">
      <div className="footer-container">

      <div className="footer-left">
        
        <div className="telefono">
          <h4>Teléfono:</h4>
          <p>+52 55 1234 5678</p>
        </div>
        <div className="telefono">
          <h4>Ubicación:</h4>
          <p>📍 Calle Ficticia 123, CDMX</p>
        </div>
        <div className="telefono">
          <h4>Correo:</h4>
          <p>✉️ DiambarSublim@tuempresa.com</p>
        </div>
      </div>


        {/* CENTRO: Derechos de autor */}
        <div className="footer-center">
          <p>© {new Date().getFullYear()} Diambar-Sublim</p>
          <p>Todos los derechos reservados</p>
        </div>

        {/* DERECHA: Redes sociales con animación */}
        <div className="footer-right">
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram } size="2x" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} size="2x" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a>
          </div>
        </div>

      </div>
    </footer>
   
  );
};

export default Footer;