import React from 'react';
import UserInfo from '../../components/profile/userInfo';
import PaymentMethods from '../../components/profile/paymentMethods';
import ShippingAddresses from '../../components/profile/shippingAddresses';
import ContactButton from '../../components/UI/contactButton/contactButton';
import './profile.css';

const Profile = () => {
  return (
    <main className="profile-page">
      <h1 className="profile-title">Personaliza tu perfil</h1>
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
    </main>
  );
};

export default Profile;
