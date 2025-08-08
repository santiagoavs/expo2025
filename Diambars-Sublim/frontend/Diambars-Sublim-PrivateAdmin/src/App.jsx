// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/Login';
import CatalogManagement from './pages/CatalogManagement/CatalogManagement';
import SplashScreen from './components/SplashScreen/SplashScreen';
import RecoveryPasswordPage from './pages/RecoveryPassword/RecoveryPasswordPage';
import CodeConfirmationPage from './pages/CodeConfirmatioPage/CodeConfirmationPage';
import NewPasswordPage from './pages/NewPassword/NewPasswordPage';
import './App.css';

// Componente interno que maneja el estado del splash
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  const handleSplashComplete = () => {
    console.log("[AppContent] Splash completed, hiding splash");
    setShowSplash(false);
  };

  // Debug logs
  useEffect(() => {
    console.log("[AppContent] State - showSplash:", showSplash, "loading:", loading, "isAuthenticated:", isAuthenticated);
  }, [showSplash, loading, isAuthenticated]);

  console.log("[AppContent] Rendering main routes");
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas de recuperación de contraseña - Todas públicas */}
      <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
      <Route path="/code-confirmation" element={<CodeConfirmationPage />} />
      <Route path="/new-password" element={<NewPasswordPage />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/catalog-management" 
        element={
          isAuthenticated ? <CatalogManagement /> : <Navigate to="/login" replace />
        } 
      />
      
      {/* Ruta principal redirige según autenticación */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/catalog-management" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* Ruta catch-all */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? 
            <Navigate to="/catalog-management" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
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