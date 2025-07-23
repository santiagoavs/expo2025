import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/UI/footer/footer';
import { resendVerificationEmail } from '../../api/resendVerificatonService.js';
import './verifyEmail.css';

export default function VerifyEmailPage() {
  const { state } = useLocation();
  const email = state?.email || 'tu correo';
  const fromLogin = state?.fromLogin || false;
  const navigate = useNavigate();
  
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(''); // 'success', 'error', ''
  const [autoSentStatus, setAutoSentStatus] = useState(''); // Para el envío automático

  // Enviar correo automáticamente si viene desde login
  useEffect(() => {
    if (fromLogin && email !== 'tu correo') {
      console.log('=== DEBUG AUTOMÁTICO ===');
      console.log('Email a enviar:', email);
      console.log('fromLogin:', fromLogin);
      console.log('state completo:', state);
      
      const sendVerificationEmail = async () => {
        try {
          await resendVerificationEmail(email);
          setAutoSentStatus('success');
          console.log('Correo de verificación enviado automáticamente');
        } catch (error) {
          setAutoSentStatus('error');
          console.error('Error al enviar correo automáticamente:', error);
        }
      };

      sendVerificationEmail();
    }
  }, [fromLogin, email]);

  const handleResendEmail = async () => {
    console.log('=== DEBUG MANUAL ===');
    console.log('Email a enviar:', email);
    console.log('fromLogin:', fromLogin);
    console.log('state completo:', state);
    
    if (email === 'tu correo') return;
    
    setIsResending(true);
    setResendStatus('');
    
    try {
      await resendVerificationEmail(email);
      setResendStatus('success');
    } catch (error) {
      setResendStatus('error');
      console.error('Error al reenviar correo:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="verify-page">
      <div className="verify-card">
        <h1>¡Verifica tu correo!</h1>
        <p>
          {fromLogin ? 'Hemos reenviado' : 'Hemos enviado'} un email a <strong>{email}</strong> con un enlace para activar tu cuenta.
          Revisa tu bandeja de entrada y haz clic en ese enlace.
        </p>

        {/* Mensaje de estado del envío automático */}
        {fromLogin && autoSentStatus === 'success' && (
          <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
            ✓ Correo de verificación enviado exitosamente
          </div>
        )}
        
        {fromLogin && autoSentStatus === 'error' && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            Error al enviar el correo. Intenta reenviarlo manualmente.
          </div>
        )}

        <p>Si no lo ves, revisa tu carpeta de spam o pide que te lo reenviemos:</p>
        
        <button
          className="resend-button"
          onClick={handleResendEmail}
          disabled={isResending || email === 'tu correo'}
        >
          {isResending ? 'Reenviando...' : 'Reenviar correo'}
        </button>

        {/* Mensaje de estado del reenvío manual */}
        {resendStatus === 'success' && (
          <div style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>
            ✓ Correo reenviado exitosamente
          </div>
        )}
        
        {resendStatus === 'error' && (
          <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
            Error al reenviar el correo. Intenta nuevamente.
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}