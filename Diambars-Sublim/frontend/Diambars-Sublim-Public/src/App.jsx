import { Routes, Route } from 'react-router-dom';
import Navbar from './components/UI/navBar/navBar';
import Home from './pages/home/home'
import Catalogue from './pages/catalogue/catalogue'
import CategoryView from './pages/catalogue/categoryView';
import Profile from './pages/profile/profile'
import Reviews from './pages/reviews/reviews'
import AboutUs from './pages/about/about'
import Contact from './pages/contact/contact'
import VerifyEmail from './pages/profile/verifyEmail';

function App() {
  return (
    <>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs/>} />
          <Route path="/catalogue" element={<Catalogue/>} />
          <Route path="/catalogue/:categoria" element={<CategoryView/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/reviews" element={<Reviews/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/verifyEmail" element={<VerifyEmail/>} />
        </Routes>
    </>
  );
}

export default App;
