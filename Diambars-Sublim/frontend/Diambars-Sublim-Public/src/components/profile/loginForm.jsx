import { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import './loginForm.css';

export default function LoginForm() {
  const { login } = useContext(AuthContext);

  // Estado para alternar entre login y registro
  const [isLogin, setIsLogin] = useState(false);

  // Estado para manejar datos del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  // Maneja los cambios en los inputs
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Enviar formulario (login o registro)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin
      ? 'http://localhost:3000/api/login'
      : 'http://localhost:3000/api/register';

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert('Credenciales inválidas o error en el formulario');
        return;
      }

      const data = await res.json();
      login(data); // Guarda token y usuario en contexto
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-form-container">
      {/* Tabs para cambiar entre registro e inicio de sesión */}
      <div className="tabs">
        <button onClick={() => setIsLogin(false)} className={!isLogin ? 'active' : ''}>Registro</button>
        <button onClick={() => setIsLogin(true)} className={isLogin ? 'active' : ''}>Acceso</button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <h2>{isLogin ? 'Inicia sesión' : 'Ingresa tus datos'}</h2>

        {!isLogin && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="phone-wrapper">
              <span>+503</span>
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </>
        )}

        {isLogin && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" className="main-button">
          {isLogin ? 'Iniciar sesión' : 'Siguiente'}
        </button>

        <div className="divider">{isLogin ? 'O inicia sesión con' : 'O regístrate con'}</div>

        <button type="button" className="google-button">
          <img src="/icons/google.png" alt="Google" />
        </button>
      </form>
    </div>
  );
}
