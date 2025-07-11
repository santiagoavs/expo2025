import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './page/welcomePage/welcome';
import LoginPage from './page/loginPage/login';
import CatalogManagement from './page/catalogManagementPage/catalogManagement';
import RecoveryPassword from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmation from './page/codeConfirmationPage/codeConfirmation';
import NewPassword from './page/newPasswordPage/newPassword';
import ProductCreation from './page/productCreationPage/productCreation'; // Nueva importación

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/catalog-management" element={<CatalogManagement />} />
        <Route path="/recovery-password" element={<RecoveryPassword />} />
        <Route path="/code-confirmation" element={<CodeConfirmation />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/product-creation" element={<ProductCreation />} /> {/* Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;