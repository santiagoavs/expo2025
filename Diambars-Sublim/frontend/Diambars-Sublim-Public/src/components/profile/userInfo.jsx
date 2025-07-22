import { useState } from 'react';
import './UserInfo.css';
import { useAuth } from '../../context/authContext';

function UserInfo() {
  const [name, setName] = useState('Santiago Ávila');
  const [phone, setPhone] = useState('+503 7016-4304');
  const [email, setEmail] = useState('santiago4v5@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const { logout } = useAuth();

  const handleSave = () => {
    console.log('Guardando datos:', { name, phone, email, password });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="user-info-container">
      <div className="profile-picture-section">
        <img src="/images/profile/defaultPfp.png" alt="Foto de perfil" className="profile-image" />
        <div className="add-photo">↘ Añadir foto de perfil</div>
      </div>

      <div className="info-section">
        <div className="info-header">
          <h3>Tu información personal</h3>
          <a href="#">Restablecer contraseña</a>
        </div>

        <div className="info-grid">
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="underline-input"
              placeholder="Nombre"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="underline-input"
              placeholder="Teléfono"
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="underline-input"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="input-group password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="underline-input"
              placeholder="Contraseña"
            />
            <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">👁️</span>
          </div>
        </div>
        <div className="email-status-row">
            <p className="email-warning">
              Confirmación de correo electrónico <span className="red-dot">●</span>
            </p>
            <button className="logout-link" onClick={handleLogout}>Cerrar sesión</button>
          </div>

        <button type="submit" className="save-button" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default UserInfo;
