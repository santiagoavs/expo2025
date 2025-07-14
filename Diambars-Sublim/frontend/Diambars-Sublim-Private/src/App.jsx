import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './page/welcomePage/welcome';
import LoginPage from './page/loginPage/login';
import CatalogManagement from './page/catalogManagementPage/catalogManagement';
import RecoveryPassword from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmation from './page/codeConfirmationPage/codeConfirmation';
import NewPassword from './page/newPasswordPage/newPassword';
import ProductCreation from './page/productCreationPage/productCreation';
import CategoryPage from './page/categoryPage/category';
import { CategoryProvider } from './context/categoryContext/categoryContext'; // ✅ Importación añadida

function App() {
  return (
    <CategoryProvider> {/* ✅ Estado global envuelto */}
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog-management" element={<CatalogManagement />} />
          <Route path="/recovery-password" element={<RecoveryPassword />} />
          <Route path="/code-confirmation" element={<CodeConfirmation />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/product-creation" element={<ProductCreation />} />
          <Route path="/category" element={<CategoryPage />} /> {/* ✅ Nueva ruta */}
        </Routes>
      </Router>
    </CategoryProvider>
  );
}

export default App;
