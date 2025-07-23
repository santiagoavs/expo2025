// VerificationResultPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function VerificationResultPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
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
  }, [token]);

  if (status === 'loading') return <div>Verificando...</div>;
  
  return (
    <div>
      <h1>{status === 'success' ? '¡Éxito!' : 'Error'}</h1>
      <p>{message}</p>
      {status === 'success' && <a href="/login">Ir al login</a>}
    </div>
  );
}