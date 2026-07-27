'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AdminSidebarProps {
  activeTab: 'users' | 'comments' | 'courses' | 'broadcast' | 'serviceUsers';
  setActiveTab: (tab: 'users' | 'comments' | 'courses' | 'broadcast' | 'serviceUsers') => void;
  usersCount: number;
  commentsCount: number;
  coursesCount: number;
  emailUsersCount: number;
  serviceUsersCount?: number;
  onLogout: () => void;
  language: 'en' | 'am';
  onToggleLanguage: () => void;
}

// Translations for sidebar
const translations = {
  en: {
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage Users',
    serviceUsers: 'Service Users',
    comments: 'Comments',
    courses: 'Courses',
    emailBroadcast: 'Email Broadcast',
    logout: 'Logout',
  },
  am: {
    adminPanel: 'የአስተዳዳሪ ፓነል',
    manageUsers: 'ተጠቃሚዎችን ያስተዳድሩ',
    serviceUsers: 'የአገልግሎት ተጠቃሚዎች',
    comments: 'አስተያየቶች',
    courses: 'ኮርሶች',
    emailBroadcast: 'የኢሜይል ስርጭት',
    logout: 'ውጣ',
  }
};

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  usersCount,
  commentsCount,
  coursesCount,
  emailUsersCount,
  serviceUsersCount = 0,
  onLogout,
  language,
  onToggleLanguage,
}: AdminSidebarProps) {
  const t = translations[language];

  return (
    <div className="w-56 min-h-screen p-3 bg-white border-r border-gray-200 shadow-sm flex-shrink-0 overflow-y-auto">
      {/* Logo and Header */}
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
        <Link href="/" className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md flex-shrink-0">
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                width={32} 
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 block leading-tight">DreamMore</span>
              <span className="text-[10px] text-gray-500">{t.adminPanel}</span>
            </div>
          </div>
        </Link>
        <button
          onClick={onToggleLanguage}
          className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition"
        >
          {language === 'en' ? 'አማ' : 'EN'}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-0.5">
        {/* Regular Users */}
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
            activeTab === 'users'
              ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span className="font-medium">{t.manageUsers}</span>
          <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {usersCount}
          </span>
        </button>

        {/* Service Users */}
        <button
          onClick={() => setActiveTab('serviceUsers')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
            activeTab === 'serviceUsers'
              ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span className="font-medium">{t.serviceUsers}</span>
          <span className="ml-auto bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {serviceUsersCount}
          </span>
        </button>
        
        {/* Comments */}
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
            activeTab === 'comments'
              ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t.comments}</span>
          <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {commentsCount}
          </span>
        </button>

        {/* Courses */}
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
            activeTab === 'courses'
              ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <span className="font-medium">{t.courses}</span>
          <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {coursesCount}
          </span>
        </button>

        {/* Email Broadcast */}
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
            activeTab === 'broadcast'
              ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="font-medium">{t.emailBroadcast}</span>
          <span className="ml-auto bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {emailUsersCount}
          </span>
        </button>
        
        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition w-full text-xs mt-4 border-t border-gray-200 pt-4"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1H3v9a1 1 0 01-1-1V3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t.logout}</span>
        </button>
      </nav>
    </div>
  );
}