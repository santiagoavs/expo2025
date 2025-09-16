// src/pages/verifyEmail/verificationResultPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/authContext';
import './verificationResultPage.css';

export default function VerificationResultPage({ debug }) {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

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
        
        const data = await apiClient.get(`/verify-email/${token}`);
        console.log('[VerificationResult] Datos de respuesta:', data);

        setStatus('success');
        setMessage(data.message || 'Tu correo ha sido verificado correctamente.');
        
        // Refrescar los datos del usuario después de la verificación exitosa
        await refreshUser();
        
        // Opcional: Redirigir automáticamente después de unos segundos
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (error) {
        console.error('[VerificationResult] Error de conexión:', error);
        setStatus('error');
        setMessage(error.message || 'Error de conexión. Por favor, intenta más tarde.');
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
              onClick={async () => {
                await refreshUser();
                navigate('/profile');
              }} 
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