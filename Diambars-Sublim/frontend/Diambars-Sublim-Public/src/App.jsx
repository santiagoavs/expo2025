import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../src/components/UI/navBar/navBar';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/info" element={<h1>Información</h1>} />
          <Route path="/catalogo" element={<h1>Catálogo</h1>} />
          <Route path="/contact" element={<h1>Contáctanos</h1>} />
          <Route path="/forum" element={<h1>Galería</h1>} />
          <Route path="/perfil" element={<h1>Perfil</h1>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
