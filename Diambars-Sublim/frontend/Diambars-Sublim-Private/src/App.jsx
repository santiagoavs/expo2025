import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import LoginPage from './page/LoginPage/Login';
import RecoveryPasswordPage from './page/RecoveryPasswordPage/RecoveryPassword';
import CodeConfirmationPage from './page/CodeConfirmationPage/CodeConfirmation';
import NewPasswordPage from './page/NewPasswordPage/NewPassword';
import WelcomePage from './page/WelcomePage/Welcome';
import CatalogManagementPage from './page/CatalogManagementPage/CatalogManagement';
import CategoryPage from './page/CategoryPage/Category';
import ProductCreation from './page/ProductCreationPage/ProductCreation';
import EditCategory from './page/CategoryPage/EditCategory';
import NewCategory from './components/NewCategory/NewCategory';
import CustomProductDesigner from './page/CustomProductDesignerPage/CustomProductDesigner'; // 🧩 Paso 1
import AddYourArtwork from './page/AddYourArtworkPage/AddYourArtwork'; // 🎨 Paso 2
import DeliveryAddress from './page/DeliveryAddressPage/DeliveryAddress'; // 📦 Paso 3
import ReviewAndSubmit from './page/ReviewAndSubmitPage/ReviewAndSubmit'; // ✅ Paso 4
import ProtectedRoute from "./components/ProtectedRoute"

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
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'warehouse', 'employee']} />}>
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </CategoryProvider>
  );
}

export default App;
