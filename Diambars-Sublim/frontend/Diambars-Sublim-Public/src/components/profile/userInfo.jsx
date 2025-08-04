import { useState, useEffect } from 'react';
import './UserInfo.css';
import { useAuth } from '../../context/authContext';

function UserInfo() {
  const { user, login, logout } = useAuth(); // Obtener el usuario del contexto
  
  console.log('UserInfo renderizado, user:', user); // Debug principal
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cargar los datos del usuario cuando el componente se monta o cuando user cambia
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // Solo el número sin el +503, ya que lo mostraremos por separado
      setPhone(user.phone || '');
      setEmail(user.email || '');
      // No cargamos la contraseña real por seguridad
      setPassword('••••••••');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Preparar los datos actualizados
      const updatedUserData = {
        ...user,
        name,
        phoneNumber: phone, // Usar phoneNumber que es como se guarda en la BD
        email,
        // No incluir password en la actualización a menos que sea necesario
      };

      console.log('Guardando datos:', updatedUserData);

      // Aquí puedes hacer la llamada a tu API para actualizar los datos
      // const response = await apiClient.put('/user/profile', updatedUserData);
      
      // Actualizar el contexto con los nuevos datos
      login(updatedUserData);
      
      // Mostrar mensaje de éxito
      alert('Datos guardados correctamente');
      
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error al guardar los datos');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Si no hay usuario logueado, mostrar un mensaje o redirigir
  if (!user) {
    return (
      <div className="user-info-container">
        <p>No hay usuario logueado</p>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      <div className="profile-picture-section">
        <img src="/images/profile/defaultPfp.png" alt="Foto de perfil" className="profile-image" />
        <div className="add-photo">↘ Añadir foto de perfil</div>
      </div>

      <div className="info-section">
        <div className="info-header">
          <h3>Tu información personal</h3>
          <a className='change-password-link' href="/changePassword">Cambiar contraseña</a>
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
              placeholder="+503 Número de teléfono"
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
              disabled // Deshabilitado por seguridad, se puede cambiar por separado
            />
            <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">👁️</span>
          </div>
        </div>
        
        <div className="email-status-row">
          <p className="email-warning">
            Confirmación de correo electrónico <span className="green-dot">●</span>
          </p>
          <button className="logout-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <button type="submit" className="save-button" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default UserInfo;