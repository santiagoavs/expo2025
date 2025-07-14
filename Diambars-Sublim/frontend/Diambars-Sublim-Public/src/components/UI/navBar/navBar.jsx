import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './navBar.css';

const navItems = [
  { path: '/', name: 'Inicio', icon: '/icons/home.png', iconActive: '/icons/homeW.png' },
  { path: '/catalogue', name: 'Catálogo', icon: '/icons/catalogue.png', iconActive: '/icons/catalogueW.png' },
  { path: '/info', name: 'Acerca de', icon: '/icons/info.png', iconActive: '/icons/infoW.png' },
  { path: '/contact', name: 'Contáctanos', icon: '/icons/contact.png', iconActive: '/icons/contactW.png' },
  { path: '/reviews', name: 'Reseñas', icon: '/icons/forum.png', iconActive: '/icons/forumW.png' },
  { path: '/profile', name: 'Perfil', icon: '/icons/user.png', iconActive: '/icons/userW.png' },
];

export default function Navbar() {
  return (
    <div className="contenedor-nav">
        <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/navbar/logo.png" alt="Logo" className="navbar-logo-img" />
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
                  <img
                    src={isActive ? item.iconActive : item.icon}
                    alt={item.name}
                    className="nav-icon-img"
                  />
                </motion.div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    </div>
  
  );
}

