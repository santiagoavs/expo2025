import React from 'react';
import './contact.css';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';
import BonziBuddy from '../../components/UI/bonziBuddy/bonziBuddy';

const Contact = () => {
  return (
    <main className="contact-page">
      <h1 className="contact-title">Contáctanos</h1>
      <BonziBuddy />
      <form className="contact-form">
        <label>
          Correo electrónico:
          <input type="email" name="email" required />
        </label>

        <label>
          Teléfono:
          <input type="tel" name="phone" required />
        </label>

        <label>
          Asunto:
          <select name="subject" required>
            <option value="">Selecciona un asunto</option>
            <option value="pedido">Información sobre pedido</option>
            <option value="personalizado">Producto personalizado</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <label>
          Comentario:
          <textarea name="message" rows="5" required />
        </label>

        <button type="submit" className="send-button">Enviar</button>
      </form>

      <ContactButton />
      <Footer />
    </main>
  );
};

export default Contact;
