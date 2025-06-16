import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaInfoCircle, FaRegImages, FaBookOpen, FaUser } from 'react-icons/fa';
import './navBar.css';

const navItems = [
  { path: '/', name: 'Inicio', icon: <FaHome /> },
  { path: '/catalogo', name: 'Catálogo', icon: <FaBookOpen /> },
  { path: '/info', name: 'Acerca de', icon: <FaInfoCircle /> },
  { path: '/galeria', name: 'Galería', icon: <FaRegImages /> },
  { path: '/perfil', name: 'Perfil', icon: <FaUser /> },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
        <span></span>
      </div>
      <ul className="navbar-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}
            >
              {({ isActive }) => (
                <motion.div
                  className="nav-content"
                  initial={{ width: 40 }}
                  animate={{ width: isActive ? 160 : 40 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="nav-text"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="nav-icon">{item.icon}</span>
                </motion.div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
