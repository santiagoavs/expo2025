// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
 
import LoginPage from './page/loginPage/login';
import RecoveryPasswordPage from './page/recoveryPasswordPage/recoveryPassword';
import CodeConfirmationPage from './page/codeConfirmationPage/codeConfirmation';
import NewPasswordPage from './page/newPasswordPage/newPassword';
 
import CatalogManagementPage from './page/catalogManagementPage/catalogManagement';
import CategoryPage from './page/categoryPage/category';
import ProductCreation from './page/productCreationPage/productCreation';
import CustomProductDesigner from './page/customProductDesignerPage/customProductDesigner';
import AddYourArtwork from './page/addYourArtworkPage/addYourArtwork';
import DeliveryAddress from './page/deliveryAddressPage/deliveryAddress';
import ReviewAndSubmit from './page/reviewAndSubmitPage/reviewAndSubmit';
import SplashScreen from './page/SplashScreen/SplashScreen';
 
import ProtectedRoute from './context/protectedRoute';
 
// Componente interno que maneja el estado del splash
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, loading } = useAuth();
 
  const handleSplashComplete = () => {
    setShowSplash(false);
  };
 
  // Solo mostrar splash al inicio, no si ya hay una sesión activa
  useEffect(() => {
    // Si el usuario ya está autenticado, saltar el splash
    if (!loading && isAuthenticated) {
      setShowSplash(false);
    }
  }, [loading, isAuthenticated]);
 
  // Mostrar splash screen
  if (showSplash && !isAuthenticated) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
 
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
      <Route path="/code-confirmation" element={<CodeConfirmationPage />} />
      <Route path="/new-password" element={<NewPasswordPage />} />
     
      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['admin', 'manager', 'warehouse', 'employee']}
          />
        }
      >
        <Route path="/" element={<Navigate to="/catalog-management" replace />} />
        <Route path="/catalog-management" element={<CatalogManagementPage />} />
        <Route path="/product-creation" element={<ProductCreation />} />
        <Route path="/category-page" element={<CategoryPage />} />
       
        <Route path="/custom-product-designer" element={<CustomProductDesigner />} />
        <Route path="/custom-product-designer/add-artwork" element={<AddYourArtwork />} />
        <Route path="/custom-product-designer/delivery-address" element={<DeliveryAddress />} />
        <Route path="/custom-product-designer/review-submit" element={<ReviewAndSubmit />} />
      </Route>
     
      {/* Ruta catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
 
// Componente principal
function App() {
  console.log("[App] Renderizando aplicación");
 
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
 
export default App;