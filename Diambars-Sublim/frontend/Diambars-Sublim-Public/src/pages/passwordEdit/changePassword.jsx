import { useState } from 'react';
import './changePassword.css';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user || !user.id) {
      setError('No hay sesión activa');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://expo2025-8bjn.onrender.com/api/users/${user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al cambiar la contraseña');
      } else {
        setMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='change-password-page'>
    <div className="change-password-container">
      <h2>Cambiar contraseña</h2>
      <form onSubmit={handleChangePassword} className="change-password-form">
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <a className='forgot-password-link' href="/passwordRecovery">¿Olvidaste tu contraseña?</a>
        <button className='change-password-button' type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Actualizar datos'}
        </button>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
        <button onClick={() => navigate('/profile')} className="back-to-profile-button">
        Ir al perfil
        </button>
      </form>
    </div>
    </main>
  );
}
