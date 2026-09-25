import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, Shield, Calendar, Phone } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Barbers', path: '/barbers' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#121314]/95 backdrop-blur-md border-b border-[#2E3035]">
      {/* Top Bar Contract: Zone 1 (Brand), Zone 2 (4-6 links), Zone 3 (1-2 actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-left focus:outline-none group"
        >
          <span className="font-serif text-2xl sm:text-3xl tracking-widest text-[#F5F2EA] group-hover:text-[#C5A059] transition-colors uppercase font-medium">
            U.S. BARBER
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-[#B8B5AE]">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? 'text-[#C5A059] font-semibold'
                    : 'hover:text-[#F5F2EA]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A059] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('/account')}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                  currentPath === '/account'
                    ? 'text-[#C5A059] bg-[#202124]'
                    : 'text-[#B8B5AE] hover:text-[#F5F2EA]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Account
              </button>
              <button
                onClick={() => logout()}
                className="text-xs text-[#B8B5AE] hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('/auth/login')}
              className="text-xs font-medium text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors px-2 py-1.5"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => handleNavClick('/book')}
            className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-all shadow-sm rounded-none"
          >
            BOOK NOW
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleNavClick('/book')}
            className="px-3.5 py-1.5 bg-[#C5A059] text-[#121314] font-semibold text-xs tracking-wider uppercase rounded-none"
          >
            BOOK
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F5F2EA] hover:text-[#C5A059] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1A1B1D] border-b border-[#2E3035] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-left text-base font-medium py-2 transition-colors ${
                  currentPath === link.path ? 'text-[#C5A059]' : 'text-[#B8B5AE] hover:text-[#F5F2EA]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#2E3035] flex flex-col space-y-3">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('/account')}
                  className="flex items-center gap-2 text-sm text-[#F5F2EA] font-medium py-1"
                >
                  <User className="w-4 h-4 text-[#C5A059]" />
                  Customer Account ({user.email})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-sm text-red-400 py-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('/auth/login')}
                className="text-left text-sm text-[#B8B5AE] hover:text-[#F5F2EA] py-1"
              >
                Customer Sign In / Register
              </button>
            )}

            <a
              href="tel:+14107885156"
              className="flex items-center gap-2 text-xs text-[#B8B5AE] pt-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              (410) 788-5156 · Catonsville, MD
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
