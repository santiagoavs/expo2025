import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './passwordReset.css';

export default function PasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    email: '',
    token: '',
    isValid: false
  });
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  // Validar el estado al montar el componente
  useEffect(() => {
    const { email, token } = location.state || {};
    
    if (!token) {
      setMessage({
        text: 'Token de recuperación no encontrado. Por favor inicia el proceso nuevamente.',
        isError: true
      });
      return;
    }

    setState({
      email: email || '',
      token,
      isValid: true
    });
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!state.isValid) {
      setMessage({
        text: 'Proceso de recuperación inválido',
        isError: true
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({
        text: 'Las contraseñas no coinciden',
        isError: true
      });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({
        text: 'La contraseña debe tener al menos 6 caracteres',
        isError: true
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const data = await apiClient.post('/password-recovery/reset-password', { 
        newPassword: form.newPassword, 
        token: state.token 
      });

      setMessage({
        text: data.message || 'Contraseña restablecida correctamente',
        isError: false
      });
      
      // Redirigir después de 2 segundos
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setMessage({
        text: err.message || 'Error al conectar con el servidor',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (!state.isValid) {
    return (
      <main className='password-reset-page'>
        <div className="password-reset-container">
          <h2>Error en el proceso</h2>
          <div className='password-reset-content'>
          <p className="reset-error-msg">{message.text || 'Token no válido'}</p>
          <button
            onClick={() => navigate('/passwordRecovery')}
            className="reset-password-button"
          >
            Volver a solicitar recuperación
          </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='password-reset-page'>
      <div className="password-reset-container">
        <h2>Restablecer contraseña</h2>
        <div className='password-reset-content'>
        {state.email && (
          <p className='password-reset-text'>Ingresa una nueva contraseña para tu cuenta <strong>{state.email}</strong>
          </p>
        )}
        
        <form onSubmit={handleResetPassword} className="password-reset-form">
          <input
            type="password"
            name="newPassword"
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar nueva contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />

          {message.text && (
            <p className={message.isError ? 'reset-error-msg' : 'reset-success-msg'}>
              {message.text}
            </p>
          )}

          <button 
            className='reset-password-button' 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Actualizar credenciales'}
          </button>
        </form>
        </div>
      </div>
    </main>
  );
}