'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LoginPageProps {
  language?: 'en' | 'am';
}

// Translations
const translations = {
  en: {
    // Header
    welcomeBack: 'Welcome Back',
    loginTo: 'Login to your DreamMore account',
    // Form Labels
    fullName: 'Full Name *',
    email: 'Email Address *',
    // Placeholders
    fullNamePlaceholder: 'Abebe Kebede',
    emailPlaceholder: 'abebe@dreammore.com',
    // Buttons
    login: 'Login',
    loggingIn: 'Logging in...',
    // Messages
    loginSuccess: 'Login Successful!',
    redirecting: 'Redirecting to DreamMore official website...',
    nameError: 'Please enter your full name',
    emailError: 'Please enter a valid email address',
    networkError: 'Network error. Please try again.',
    // Footer
    needHelp: 'Need help? Contact support',
  },
  am: {
    // Header
    welcomeBack: 'እንኳን በደህና መጡ',
    loginTo: 'ወደ DreamMore አካውንትዎ ይግቡ',
    // Form Labels
    fullName: 'ሙሉ ስም *',
    email: 'ኢሜይል አድራሻ *',
    // Placeholders
    fullNamePlaceholder: 'አበበ ከበደ',
    emailPlaceholder: 'abebe@dreammore.com',
    // Buttons
    login: 'ግባ',
    loggingIn: 'እየገባ ነው...',
    // Messages
    loginSuccess: 'መግባት ተሳክቷል!',
    redirecting: 'ወደ DreamMore ኦፊሻል ድርጣቢያ እየተዘዋወሩ ነው...',
    nameError: 'እባክዎ ሙሉ ስምዎን ያስገቡ',
    emailError: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
    networkError: 'የአውታረ መረብ ችግር። እባክዎ እንደገና ይሞክሩ።',
    // Footer
    needHelp: 'እርዳታ ይፈልጋሉ? ድጋፍን ያግኙ',
  }
};

export default function LoginPage({ language = 'en' }: LoginPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[language];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Full Name - required
    if (!formData.fullName.trim()) {
      newErrors.fullName = t.nameError;
    }
    
    // Email - required and valid format
    if (!formData.email.trim()) {
      newErrors.email = t.emailError;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    setIsSuccess(false);

    try {
      // Simulate login API call
      // In production, you would validate against your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Successful login
      setMessage({ 
        text: '✅ ' + t.loginSuccess, 
        type: 'success' 
      });
      setIsSuccess(true);
      
      // Redirect to official website after success
      setTimeout(() => {
        window.location.href = 'https://www.dreammoredigitals.com/';
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        text: '❌ ' + t.networkError, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>
          
          {/* Logo and Header */}
          <div className="text-center mb-8 mt-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-orange-100">
                <Image 
                  src="/logo.jpg" 
                  alt="DreamMore Logo" 
                  width={80} 
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              DreamMore
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              {t.welcomeBack}
            </p>
            <p className="text-gray-500 text-xs">
              {t.loginTo}
            </p>
          </div>

          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.fullNamePlaceholder}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.emailPlaceholder}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.loggingIn}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t.login}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.loginSuccess}</h3>
              <p className="text-gray-600 text-sm">{t.redirecting}</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <Link 
              href="mailto:support@dreammoredigitals.com"
              className="text-xs text-gray-500 hover:text-orange-600 transition"
            >
              {t.needHelp}
            </Link>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Trusted by 50+ clients globally
            </span>
          </p>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 2s ease-in-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}