'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  language?: 'en' | 'am';
}

// Translations
const translations = {
  en: {
    adminLogin: 'Admin Login',
    enterCredentials: 'Enter your credentials',
    emailPlaceholder: 'admin@dreammore.com',
    passwordPlaceholder: 'Password',
    login: 'Login',
    loggingIn: 'Logging in...',
    secureAccess: 'Secure admin access',
    invalidCredentials: 'Invalid credentials',
    loginFailed: 'Login failed. Please try again.',
  },
  am: {
    adminLogin: 'የአስተዳዳሪ መግቢያ',
    enterCredentials: 'የመግቢያ መረጃዎን ያስገቡ',
    emailPlaceholder: 'admin@dreammore.com',
    passwordPlaceholder: 'የይለፍ ቃል',
    login: 'ግባ',
    loggingIn: 'እየገባ ነው...',
    secureAccess: 'ደህንነቱ የተጠበቀ የአስተዳዳሪ መግቢያ',
    invalidCredentials: 'የተሳሳተ መረጃ',
    loginFailed: 'መግቢያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  }
};

export default function AdminLogin({ isOpen, onClose, onLoginSuccess, language = 'en' }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess();
      } else {
        setError(data.message || t.invalidCredentials);
      }
    } catch {
      setError(t.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <i className="fas fa-times text-lg"></i>
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
            <Image src="/logo.jpg" alt="Logo" width={64} height={64} className="object-cover w-full h-full" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900">{t.adminLogin}</h2>
        <p className="text-xs text-center text-gray-500 mb-4">{t.enterCredentials}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder={t.emailPlaceholder}
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder={t.passwordPlaceholder}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <><i className="fas fa-spinner fa-spin"></i>{t.loggingIn}</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i>{t.login}</>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-3">
          <i className="fas fa-shield-alt text-orange-500 mr-1"></i>{t.secureAccess}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}