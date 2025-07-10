import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './page/welcomePage/welcome';
import LoginPage from './page/loginPage/login';
import CatalogManagement from './page/catalogManagementPage/catalogManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/catalog-management" element={<CatalogManagement />} />
        {/* Puedes agregar más rutas aquí según sea necesario */}
      </Routes>
    </Router>
  );
}

export default App;