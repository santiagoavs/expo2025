import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './page/welcomePage/welcome';
import LoginPage from './page/loginPage/login'; // Importado con la misma estructura

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Otras rutas pueden ir aquí */}
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;