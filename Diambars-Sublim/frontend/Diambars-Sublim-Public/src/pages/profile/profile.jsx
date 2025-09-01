import React, { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import LoginForm from '../../components/profile/loginForm';
import UserInfo from '../../components/profile/userInfo';
import PaymentMethods from '../../components/profile/paymentMethods';
import ShippingAddresses from '../../components/profile/shippingAddresses';
import ContactButton from '../../components/UI/contactButton/contactButton';
import Footer from '../../components/UI/footer/footer';
import './profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext); //Verificamos si hay usuario autenticado

  if (!user) {
    //Si no está autenticado, mostramos el login
    return (
      <main className="profile-page">
        <div className='login-container'>
        <LoginForm />
        </div>
        <Footer />
      </main>
    );
  }

  //Si ya está autenticado, mostramos el perfil
  return (
    <main className="profile-page">
      <section className="profile-container">
        <div className="left-column">
          <UserInfo />
        </div>
        <div className="right-column">
          <PaymentMethods />
          <ShippingAddresses />
        </div>
      </section>
      <ContactButton />
      <Footer />
    </main>
  );
};

export default Profile;
