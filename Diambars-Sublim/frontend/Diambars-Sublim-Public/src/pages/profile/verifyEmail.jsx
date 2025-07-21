// src/pages/verify-email.jsx
import { useLocation } from 'react-router-dom';
import './verifyEmail.css';

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <main className="verify-email-page">
      <h2>Verifica tu correo</h2>
      <p>
        Te hemos enviado un correo a <strong>{email}</strong>. Haz clic en el enlace que contiene para activar tu cuenta.
      </p>
      <p>Una vez verificado, podrás iniciar sesión con normalidad.</p>
    </main>
  );
}
