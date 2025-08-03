import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './verificationResultPage.css'

export default function VerificationResultPage({ debug }) {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  if (debug) {
    // Simulación de resultado de verificación
    setTimeout(() => {
      setStatus('success'); // o 'error'
      setMessage('Tu correo ha sido verificado correctamente.');
    }, 1000);
    return;
  }

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/verify-email/${token}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (token) {
    verifyToken();
  }
}, [token, debug]);


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
      <h1>{status === 'success' ? '¡Éxito!' : 'Error'}</h1>
      <p>{message}</p>
      {status === 'success' && (
      <button onClick={() => navigate('/profile')} className="success-button">
        Ir al perfil
      </button>
      )}
    </div>  
    </div>
  );
}