import { Routes, Route } from 'react-router-dom';
import Navbar from './components/UI/navBar/navBar';
import Home from './pages/home/home'
import Catalogue from './pages/catalogue/catalogue'
import CategoryView from './pages/catalogue/categoryView';

function App() {
  return (
    <>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<h1>Información</h1>} />
          <Route path="/catalogue" element={<Catalogue/>} />
          <Route path="/catalogue/:categoria" element={<CategoryView />} />
          <Route path="/contact" element={<h1>Contáctanos</h1>} />
          <Route path="/forum" element={<h1>Galería</h1>} />
          <Route path="/profile" element={<h1>Perfil</h1>} />
        </Routes>
    </>
  );
}

export default App;
