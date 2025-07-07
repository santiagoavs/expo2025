import './ContactButton.css';

export default function ContactButton() {
  return (
    <a
      href="https://wa.me/XXXXXXXXXXX" // <- reemplaza por tu número de WhatsApp
      className="contact-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="/contact-button.png" alt="Contáctanos" />
    </a>
  );
}
