// src/pages/verifyEmail/verificationResultPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './verificationResultPage.css';

export default function VerificationResultPage({ debug }) {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (debug) {
      // Simulación de resultado de verificación para desarrollo
      setTimeout(() => {
        setStatus('success');
        setMessage('Tu correo ha sido verificado correctamente.');
      }, 1000);
      return;
    }

    const verifyToken = async () => {
      try {
        console.log('[VerificationResult] Verificando token:', token);
        
        // Usar el endpoint correcto del backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/verify-email/${token}`, {
          method: 'GET',
          credentials: 'include', // Importante para cookies
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('[VerificationResult] Respuesta del servidor:', response.status);
        
        const data = await response.json();
        console.log('[VerificationResult] Datos de respuesta:', data);

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Tu correo ha sido verificado correctamente.');
          
          // Opcional: Redirigir automáticamente después de unos segundos
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al verificar el correo electrónico.');
        }
      } catch (error) {
        console.error('[VerificationResult] Error de conexión:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta más tarde.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Token de verificación no válido.');
    }
  }, [token, debug, navigate]);

  if (status === 'loading') {
    return (
      <div className="verification-loading">
        <div className="spinner"></div>
        <p>Verificando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="verification-result-page">
      <div className="verification-result-card">
        <div className={`verification-icon ${status}`}>
          {status === 'success' ? '✅' : '❌'}
        </div>
        
        <h1>{status === 'success' ? '¡Verificación exitosa!' : 'Error de verificación'}</h1>
        
        <p className="verification-message">{message}</p>
        
        {status === 'success' ? (
          <div className="verification-actions">
            <button 
              onClick={() => navigate('/profile')} 
              className="success-button"
            >
              Ir al perfil
            </button>
            <p className="auto-redirect-notice">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        ) : (
          <div className="verification-actions">
            <button 
              onClick={() => navigate('/profile')} 
              className="retry-button"
            >
              Volver al login
            </button>
            <button 
              onClick={() => navigate('/verifyEmail', { 
                state: { 
                  email: 'tu correo',
                  fromLogin: false 
                } 
              })} 
              className="resend-button"
            >
              Solicitar nuevo correo
            </button>
          </div>
        )}
      </div>  
    </div>
  );
}