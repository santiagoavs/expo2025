/*
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/protectedRoute';
import LoginPage from './page/loginPage/login';
import RecoveryPasswordPage from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmationPage from './page/codeConfirmationPage/codeConfirmation';
import NewPasswordPage from './page/newPasswordPage/newPassword';
import WelcomePage from './page/welcomePage/welcome';
import CatalogManagementPage from './page/catalogManagementPage/catalogManagement';
import ProductCreation from './page/productCreationPage/ProductCreation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
          <Route path="/code-confirmation" element={<CodeConfirmationPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/catalog-management" element={<CatalogManagementPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'warehouse', 'employee']} />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<WelcomePage />} />

            <Route path="/product-creation" element={<ProductCreation />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './page/loginPage/login';
import RecoveryPasswordPage from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmationPage from './page/codeConfirmationPage/codeConfirmation';
import NewPasswordPage from './page/newPasswordPage/newPassword';
import WelcomePage from './page/welcomePage/welcome';
import CatalogManagementPage from './page/catalogManagementPage/catalogManagement';
import { CategoryProvider } from './context/categoryContext/categoryContext'; // ✅ Solo el contexto
import CategoryPage from './page/categoryPage/category'; // ✅ Página separada
import ProductCreation from './page/productCreationPage/ProductCreation';

function App() {
  return (
    <CategoryProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
          <Route path="/code-confirmation" element={<CodeConfirmationPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          
          {/* Rutas ahora públicas sin protección */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/dashboard" element={<WelcomePage />} />
          <Route path="/catalog-management" element={<CatalogManagementPage />} />
          <Route path="/product-creation" element={<ProductCreation />} />
          <Route path="/category" element={<CategoryPage />} /> {/* ✅ Nueva ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </CategoryProvider>
  );
}

export default App;
