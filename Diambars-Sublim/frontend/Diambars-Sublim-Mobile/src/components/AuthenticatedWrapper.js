// src/components/AuthenticatedWrapper.js - Wrapper para pantallas autenticadas con navbar
import React from 'react';
import GlobalNavbar from './GlobalNavbar';

const AuthenticatedWrapper = ({ children, title, subtitle }) => {
  return (
    <GlobalNavbar title={title} subtitle={subtitle}>
      {children}
    </GlobalNavbar>
  );
};

export default AuthenticatedWrapper;
