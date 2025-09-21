// src/app/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import LinktreeHomepage from './components/LinktreeHomepage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';


function HomePageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
        return;
      }

      const action = searchParams.get('action');
      const redirectFrom = searchParams.get('from');
      
      if (action === 'login' || redirectFrom === 'dashboard') {
        setShowLoginModal(true);
      } else if (action === 'signup') {
        setShowSignupModal(true);
      }
    }
  }, [user, loading, router, searchParams]);

  const handleSignUp = (): void => {
    setShowSignupModal(true);
  };

  const closeModals = (): void => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    url.searchParams.delete('from');
    window.history.replaceState({}, '', url.toString());
  };

  const switchToLogin = (): void => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const switchToSignup = (): void => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <LinktreeHomepage onSignUp={handleSignUp} />
      
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
    </>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}