"use client";

import Link from 'next/link';
import NavLink from './NavLink';
import Modal from './Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFormType } from '@/types';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAuthForm, setCurrentAuthForm] = useState<AuthFormType>(AuthFormType.Login);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
    setCurrentAuthForm(AuthFormType.Login); 
    setIsMobileMenuOpen(false); 
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await fetch('http://localhost:4000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        logout();
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      window.location.href = "/";
    }
  };

  const handleToggleToSignup = () => setCurrentAuthForm(AuthFormType.Signup);
  const handleToggleToLogin = () => setCurrentAuthForm(AuthFormType.Login);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[var(--color-bg-navbar)] text-[var(--color-text-navbar)] p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-200"
            onClick={closeMobileMenu}
          >
            App Name
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink href="/">Home</NavLink>
            
            {isAuthenticated && (
              <NavLink href="/dashboard">Dashboard</NavLink>
            )}

            {(user?.role === 'OWNER' || user?.role === 'SUPERADMIN') && (
              <NavLink href="/admin">Admin</NavLink>
            )}

            <ThemeToggle />

            {!isAuthenticated ? (
              <button
                onClick={handleOpenAuthModal}
                className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 bg-[var(--color-primary)] text-[var(--color-text-button)] hover:bg-[var(--color-secondary)]"
              >
                Sign Up/Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 bg-[var(--color-danger)] text-[var(--color-text-button)] hover:bg-red-700"
              >
                Log Out
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="text-[var(--color-text-navbar)] hover:text-[var(--color-text-primary)] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[var(--color-border-primary)]">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                href="/"
                className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-navbar)]"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-navbar)]"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}

              {(user?.role === 'OWNER' || user?.role === 'SUPERADMIN') && (
                <Link
                  href="/admin"
                  className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-navbar)]"
                  onClick={closeMobileMenu}
                >
                  Admin
                </Link>
              )}

              {!isAuthenticated ? (
                <button
                  onClick={handleOpenAuthModal}
                  className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 bg-[var(--color-primary)] text-[var(--color-text-button)] hover:bg-[var(--color-secondary)] text-left"
                >
                  Sign Up/Login
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-lg px-4 py-2 rounded-lg transition-colors duration-200 bg-[var(--color-danger)] text-[var(--color-text-button)] hover:bg-red-700 text-left"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseAuthModal} 
        title={currentAuthForm === AuthFormType.Login ? "Log In" : "Sign Up"}
      >
        {currentAuthForm === AuthFormType.Login ? (
          <LoginForm onClose={handleCloseAuthModal} onToggleToSignup={handleToggleToSignup} />
        ) : (
          <SignupForm onClose={handleCloseAuthModal} onToggleToLogin={handleToggleToLogin} />
        )}
      </Modal>
    </>
  );
}