import { useLocation, useNavigate } from 'react-router-dom';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';
import './verifyEmail.css';

export default function VerifyEmailPage() {
  const { state } = useLocation();
  const email = state?.email || 'tu correo';
  const navigate = useNavigate();

  return (
    <main className="verify-page">
      <div className="verify-card">
        <h1>¡Verifica tu correo!</h1>
        <p>
          Hemos enviado un email a <strong>{email}</strong> con un enlace para activar tu cuenta.
          Revisa tu bandeja de entrada y haz clic en ese enlace.
        </p>
        <p>Si no lo ves, revisa tu carpeta de spam o pide que te lo reenviemos:</p>
        <button
          className="resend-button"
          onClick={() => navigate('/resend-verification', { state: { email } })}
        >
          Reenviar correo
        </button>
      </div>

      <ContactButton />
      <Footer />
    </main>
  );
}