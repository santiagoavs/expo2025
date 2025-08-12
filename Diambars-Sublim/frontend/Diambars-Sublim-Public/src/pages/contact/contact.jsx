import './contact.css';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';

// Iconos SVG simples
const LocationIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const Contact = () => {
  return (
    <>
      <main className="contact-page">
        <div className="contact-container">
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className='contact-info-container'>
              <div className="contact-info-item">
                <LocationIcon />
                <div className="contact-info-content">
                  <h3>Location</h3>
                  <p>123 Business Street<br />Ciudad, País 12345</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <PhoneIcon />
                <div className="contact-info-content">
                  <h3>Teléfono</h3>
                  <p>+503 0000-0000</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <ClockIcon />
                <div className="contact-info-content">
                  <h3>Hours</h3>
                  <p>Lun - Vie: 9:00 AM - 6:00 PM<br />Sáb: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="contact-form-container">
              <div className="form-header">
                <h1 className="contact-title">¿Dudas o consultas?</h1>
                <h4 className="contact-subtitle">¡Contáctanos!</h4>
              </div>
              
              <form className="contact-form">
                <h2 className='contact-label'>Nombre completo</h2>
                  <input type="text" name="fullName" required />
                <h2 className='contact-label'>Correo electrónico</h2>
                  <input type="email" name="email" required />
                <h2 className='contact-label'>Comentario o mensaje</h2>
                  <textarea name="message" rows="4" required />

                <button type="submit" className="send-button">Enviar</button>
              </form>
            </div>
          </div>
        </div>

        {/* Imagen de oficina flotante */}
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format" 
          alt="Oficina moderna"
          className="office-image"
        />
      </main>

      <ContactButton />
      <Footer />
    </>
  );
};

export default Contact;