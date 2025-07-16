import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/categoryContext';

import LoginPage from './page/loginPage/login';
import RecoveryPasswordPage from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmationPage from './page/codeConfirmationPage/codeConfirmation';
import NewPasswordPage from './page/newPasswordPage/newPassword';
import WelcomePage from './page/welcomePage/welcome';
import CatalogManagementPage from './page/catalogManagementPage/catalogManagement';
import CategoryPage from './page/categoryPage/category';
import ProductCreation from './page/productCreationPage/ProductCreation';
import EditCategory from './page/categoryPage/editCategory';
import NewCategory from './components/newCategory/newCategory';

import CustomProductDesigner from './page/customProductDesignerPage/customProductDesigner'; // 🧩 Paso 1
import AddYourArtwork from './page/addYourArtworkPage/addYourArtwork'; // 🎨 Paso 2
import DeliveryAddress from './page/deliveryAddressPage/deliveryAddress'; // 📦 Paso 3
import ReviewAndSubmit from './page/reviewAndSubmitPage/reviewAndSubmit'; // ✅ Paso 4

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

            {/* Rutas públicas */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<WelcomePage />} />
            <Route path="/catalog-management" element={<CatalogManagementPage />} />
            <Route path="/product-creation" element={<ProductCreation />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/category/new" element={<NewCategory />} />
            <Route path="/category/edit/:id" element={<EditCategory />} />

            {/* 🔁 Flujo del diseñador personalizado */}
            <Route path="/custom-product-designer" element={<CustomProductDesigner />} />
            <Route path="/custom-product-designer/add-artwork" element={<AddYourArtwork />} />
            <Route path="/custom-product-designer/delivery-address" element={<DeliveryAddress />} />
            <Route path="/custom-product-designer/review-submit" element={<ReviewAndSubmit />} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </CategoryProvider>
  );
}

export default App;
