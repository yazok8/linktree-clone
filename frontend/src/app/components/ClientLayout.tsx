"use client";

import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

interface ClientLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

  const handleSignUp = (): void => {
    setShowSignupModal(true);
  };

  const handleLogin = (): void => {
    setShowLoginModal(true);
  };

  const closeModals = (): void => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const switchToLogin = (): void => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const switchToSignup = (): void => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  return (
    <>
      {showHeader && !user && (
        <Header 
          onSignUp={handleSignUp}
          onLogin={handleLogin}
        />
      )}
      
      {children}
      
      {showLoginModal && (
        <LoginModal 
          onClose={closeModals}
          onSwitchToSignup={switchToSignup}
        />
      )}

      {showSignupModal && (
        <SignupModal 
          onClose={closeModals}
          onSwitchToLogin={switchToLogin}
        />
      )}
      <Footer />
    </>
  );
};

export default ClientLayout;