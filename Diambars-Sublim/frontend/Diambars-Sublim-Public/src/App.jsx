import { Routes, Route, useSearchParams, Navigate } from 'react-router-dom';
import Navbar from './components/UI/navBar/navBar';
import Home from './pages/home/home'
import Catalogue from './pages/catalogue/catalogue'
import CategoryView from './pages/catalogue/categoryView';
import Profile from './pages/profile/profile'
import Reviews from './pages/reviews/reviews'
import AboutUs from './pages/about/about'
import Contact from './pages/contact/contact'
import VerifyEmail from './pages/profile/verifyEmail';
import VerificationResultPage from './pages/profile/verificationResultPage';
import ChangePassword from './pages/passwordEdit/changePassword';
import ForgotPassword from './pages/passwordEdit/forgotPassword';
import VerifyRecoveryCode from './pages/passwordEdit/verifyRecoveryCode';
import PasswordReset from './pages/passwordEdit/passwordReset';
import NotFoundPage from './pages/notFound/notFound';
import ComingSoonPage from './pages/comingSoon/comingSoon';
import DesignHub from '../src/pages/designs/designHub';
import ProtectedRoute from '../src/components/auth/protectedRoute';

// Componente para manejar productos desde URL
const DesignHubWithProduct = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  
  return <DesignHub initialProductId={productId} />;
};

function App() {
  return (
    <>
      <Navbar />
        <Routes>
          {/* Rutas existentes - SIN CAMBIOS */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs/>} />
          <Route path="/catalogue" element={<Catalogue/>} />
          <Route path="/catalogue/:categoria" element={<CategoryView/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/reviews" element={<Reviews/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/verifyEmail" element={<VerifyEmail/>} />
          <Route path="/verify-email/:token" element={<VerificationResultPage />} />
          <Route path="/verify-email/debug" element={<VerificationResultPage debug />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/passwordRecovery" element={<ForgotPassword />} />
          <Route path="/verifyRecoveryCode" element={<VerifyRecoveryCode />} />
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/notFound404" element={<NotFoundPage />} />

          {/* Redirección para rutas obsoletas o mal escritas */}
          <Route path="/notFound404" element={<Navigate to="*" />} />
          
          {/* Ruta predefinida para todas las rutas no definidas */}
          <Route path="*" element={<NotFoundPage />} />

          {/* NUEVAS rutas del sistema de diseños */}
          <Route 
            path="/design-hub" 
            element={
              <ProtectedRoute>
                <DesignHubWithProduct />
              </ProtectedRoute>
            } 
          />

          {/* Ruta para personalizar producto específico */}
          <Route 
            path="/customize/:productId" 
            element={
              <ProtectedRoute>
                <DesignHub />
              </ProtectedRoute>
            } 
          />

          {/* Alias para diseños */}
          <Route 
            path="/designs" 
            element={
              <ProtectedRoute>
                <DesignHubWithProduct />
              </ProtectedRoute>
            } 
          />
        </Routes>
    </>
  );
}

export default App;