/**
 * U.S. Barber — Web Application Entry Point
 * Routing, global authentication context, and layout wrapper.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BarbersPage } from './pages/BarbersPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [initialServiceId, setInitialServiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, serviceId?: string) => {
    if (serviceId) {
      setInitialServiceId(serviceId);
    } else {
      setInitialServiceId(undefined);
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#121314] text-[#F5F2EA] flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#121314]">
          {/* Public Navbar (Hidden on Admin screen for full workspace focus) */}
          {!isAdminRoute && (
            <Navbar currentPath={currentPath} onNavigate={(path) => navigate(path)} />
          )}

          {/* Main Route Switcher */}
          <main className="flex-1">
            {currentPath === '/' && (
              <HomePage onNavigate={(path, sId) => navigate(path, sId)} />
            )}

            {currentPath === '/services' && (
              <ServicesPage onNavigate={(path, sId) => navigate(path, sId)} />
            )}

            {currentPath === '/barbers' && (
              <BarbersPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/gallery' && (
              <GalleryPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/about' && (
              <AboutPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/contact' && (
              <ContactPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/book' && (
              <BookingPage
                initialServiceId={initialServiceId}
                onNavigate={(path) => navigate(path)}
              />
            )}

            {currentPath === '/auth/login' && (
              <LoginPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/auth/register' && (
              <RegisterPage onNavigate={(path) => navigate(path)} />
            )}

            {currentPath === '/account' && (
              <AccountPage onNavigate={(path) => navigate(path)} />
            )}

            {isAdminRoute && (
              <AdminPage
                onNavigateHome={() => navigate('/')}
                onNavigateLogin={() => navigate('/auth/login')}
              />
            )}
          </main>

          {/* Public Footer */}
          {!isAdminRoute && <Footer onNavigate={(path) => navigate(path)} />}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
