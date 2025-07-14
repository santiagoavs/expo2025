import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './navBar.css';

const navItems = [
  { path: '/', name: 'Inicio', icon: '/icons/home.png', iconActive: '/icons/homeW.png' },
  { path: '/catalogue', name: 'Catálogo', icon: '/icons/catalogue.png', iconActive: '/icons/catalogueW.png' },
  { path: '/about', name: 'Acerca de', icon: '/icons/info.png', iconActive: '/icons/infoW.png' },
  { path: '/contact', name: 'Contáctanos', icon: '/icons/contact.png', iconActive: '/icons/contactW.png' },
  { path: '/reviews', name: 'Reseñas', icon: '/icons/forum.png', iconActive: '/icons/forumW.png' },
  { path: '/profile', name: 'Perfil', icon: '/icons/user.png', iconActive: '/icons/userW.png' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <div className="contenedor-nav desktop-only">
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

      {/* Botón hamburguesa */}
      <div className="mobile-only hamburger" onClick={toggleSidebar}>
        <img src="/icons/menu.png" alt="Menú" />
      </div>

      {/* Sidebar móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
          >
            <div className="sidebar-header">
              <img src="/images/navbar/logo.png" alt="Logo" className="sidebar-logo" />
              <button onClick={closeSidebar} className="close-btn">✖</button>
            </div>
            <ul className="sidebar-links">
              {navItems.map((item) => (
                <li key={item.path} onClick={closeSidebar}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 'sidebar-item ' + (isActive ? 'active' : '')}
                  >
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="nav-icon-img"
                    />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
