// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/Login';
import WelcomeDashboard from './pages/Dashboard/WelcomeDashboard';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import CatalogManagement from './pages/CatalogManagement/CatalogManagement';
import DesignManagement from './pages/DesignManagement/DesignManagement';
import SplashScreen from './components/SplashScreen/SplashScreen';
import RecoveryPasswordPage from './pages/RecoveryPassword/RecoveryPasswordPage';
import CodeConfirmationPage from './pages/CodeConfirmatioPage/CodeConfirmationPage';
import NewPasswordPage from './pages/NewPassword/NewPasswordPage';
import Navbar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import './App.css';
import CategoryManagement from './pages/CategoryManagement/CategoryManagement';
import Users from './pages/Users/Users';
import Orders from './pages/Orders/Orders';
import Employees from './pages/Employees/Employees';
import Profile from './pages/Profile/Profile';
import ReviewsManagement from './pages/ReviewsManagement/ReviewsManagement';
import ReportsPage from './pages/ReportsPage/ReportsPage';
import PaymentMethods from './pages/PaymentsMethods/PaymentMethods';
import AddressManagement from './pages/AddressManagement/AddressManagement';
import QualityApprovalPage from './pages/QualityApproval/QualityApprovalPage';
//Ruta catch-all
import NotFound404 from './pages/NotFound404/NotFound404';

// Layout para páginas con autenticación (incluye Navbar y Footer)
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Layout para páginas públicas (sin Navbar y Footer)
const PublicLayout = ({ children }) => {
  return (
    <div className="app-layout app-layout--public">
      {children}
    </div>
  );
};

// Layout para páginas públicas con Footer (sin Navbar)
const PublicLayoutWithFooter = ({ children }) => {
  return (
    <div className="app-layout app-layout--public">
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Componente interno que maneja el estado del splash
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashCompleted, setSplashCompleted] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const handleSplashComplete = () => {
    console.log("[AppContent] Splash completed");
    setSplashCompleted(true);
    // Dar un pequeño delay antes de ocultar completamente el splash
    setTimeout(() => {
      setShowSplash(false);
    }, 100);
  };

  // Debug logs
  useEffect(() => {
    console.log("[AppContent] State - showSplash:", showSplash, "splashCompleted:", splashCompleted, "loading:", loading, "isAuthenticated:", isAuthenticated);
  }, [showSplash, splashCompleted, loading, isAuthenticated]);

  // Mostrar splash hasta que se complete Y la autenticación termine de cargar
  if (showSplash || (!splashCompleted || loading)) {
    console.log("[AppContent] Rendering SplashScreen");
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  console.log("[AppContent] Rendering main routes");
  return (
    <Routes>
      {/* Rutas públicas (sin navbar y footer) */}
      <Route 
        path="/login" 
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        } 
      />
      <Route 
        path="/recovery-password" 
        element={
          <PublicLayout>
            <RecoveryPasswordPage />
          </PublicLayout>
        } 
      />
      <Route 
        path="/code-confirmation" 
        element={
          <PublicLayout>
            <CodeConfirmationPage />
          </PublicLayout>
        } 
      />
      <Route 
        path="/new-password" 
        element={
          <PublicLayout>
            <NewPasswordPage />
          </PublicLayout>
        } 
      />
      <Route 
        path="/quality-approval/:orderId" 
        element={
          <PublicLayoutWithFooter>
            <QualityApprovalPage />
          </PublicLayoutWithFooter>
        } 
      />
      
      {/* Rutas protegidas (con navbar y footer) */}
      <Route 
        path="/Dashboard" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <WelcomeDashboard/>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/analytics" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <AnalyticsDashboard/>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/ReviewsManagement" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <ReviewsManagement/>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/reports" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <ReportsPage/>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/payment-methods" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <PaymentMethods/>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/catalog-management" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <CatalogManagement />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/category-management" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <CategoryManagement />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/design-management" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <DesignManagement />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/design-management" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <DesignManagement />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/users" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Users />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/orders" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Orders />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/employees" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Employees />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/address-management" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <AddressManagement />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route  
        path="/profile" 
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Ruta principal redirige según autenticación */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/Dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* Ruta catch-all */}
      <Route 
  path="*" 
  element={
    <PublicLayout>
      <NotFound404 />
    </PublicLayout>
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