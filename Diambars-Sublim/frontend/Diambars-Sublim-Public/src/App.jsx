import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/UI/navBar/navBar';
import Home from './pages/home/home'

function App() {
  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<h1>Información</h1>} />
          <Route path="/catalogo" element={<h1>Catálogo</h1>} />
          <Route path="/contact" element={<h1>Contáctanos</h1>} />
          <Route path="/forum" element={<h1>Galería</h1>} />
          <Route path="/perfil" element={<h1>Perfil</h1>} />
        </Routes>
    </Router>
  );
}

export default App;
