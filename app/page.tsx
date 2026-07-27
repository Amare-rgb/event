'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RegistrationForm from '@/app/components/RegistrationForm';
import AdminLogin from '@/app/components/AdminLogin';
import CommentsSection from '@/app/components/CommentsSection';

// Complete Translations - Fixed Amharic
const translations = {
  en: {
    // Navbar
    website: 'Website',
    contact: 'Contact',
    comment: 'Comment',
    register: 'Register',
    login: 'Login',
    close: 'Close',
    language: 'አማርኛ',
    rightwork: 'Rightwork at right time',
    menu: 'Menu',
    // Hero
    welcome: 'Welcome to',
    dreamMore: 'DreamMore',
    eventAttendance: '✨ Dream More Event Attendance ✨',
    digitalAgency: 'Digital Agency Event 2026',
    // About
    about: 'About DreamMore',
    empowering: 'Empowering Digital Excellence',
    aboutText: 'Dream More is a collaborative group of dynamic youth and active team members dedicated to education purpose, digital marketing, and a wide range of tech-related services. We prioritize a client-centred approach, supported by our versatile service offerings and an unwavering commitment to quality. With a focus on reliability, trust, and continuous innovation, our dedicated team adapts to meet the evolving demands of every client, ensuring that we consistently exceed expectations.',
    // Highlights
    highlights: 'Event Highlights',
    highlight1: 'Network with industry leaders and professionals',
    highlight2: 'Learn from top digital marketing experts',
    highlight3: 'Explore innovative tech solutions and trends',
    highlight4: 'Connect with like-minded professionals',
    highlight5: 'Gain valuable insights for business growth',
    // Register
    registerNow: 'Register Now for Event 2026',
    registerNowShort: 'Register Now',
    joinUs: 'Join us for an unforgettable experience',
    // Slider
    slide1Title: 'Welcome To DreamMore Event',
    slide1Desc: 'Join us!',
    slide2Title: 'Naky Hotel',
    slide2Desc: 'Connect with leaders',
    slide3Title: 'Business 2026',
    slide3Desc: 'Learn from the best',
    slide4Title: 'Success Stories',
    slide4Desc: 'Be part of it',
    // Footer
    empower: 'Empower digital agencies.',
    quickLinks: 'Quick Links',
    home: 'Home',
    admin: 'Admin',
    eventInfo: 'Event Info',
    connect: 'Connect',
    privacy: 'Privacy',
    terms: 'Terms',
    secure: 'Secure',
    rights: '© 2026 DreamMore. All rights reserved.',
    backToHome: 'Back to Home',
    // Event Date
    eventDate: 'July 11, 2026',
    eventLocation: 'DreamMore Events',
  
  },
  am: {
    // Navbar
    website: 'ድር ጣቢያ',
    contact: 'አግኙን',
    comment: 'አስተያየት',
    register: 'ይመዝገቡ',
    login: 'ግባ',
    close: 'ዝጋ',
    language: 'English',
    rightwork: 'በትክክለኛው ጊዜ ትክክለኛ ስራ',
    menu: 'ምናሌ',
    // Hero
    welcome: 'እንኳን ወደ',
    dreamMore: 'ድሪም ሞር በደህና መጡ',
    eventAttendance: '✨ የድሪም ሞር ክስተት መገኘት ✨',
    digitalAgency: 'የዲጂታል ኤጀንሲ ዝግጅት 2026',
    // About
    about: 'ስለ ድሪም ሞር',
    empowering: 'ዲጂታል ልቀትን ማበረታታት',
    aboutText: 'ድሪም ሞር ለትምህርት ዓላማ፣ ለዲጂታል ግብይት እና ለተለያዩ የቴክኖሎጂ አገልግሎቶች የተሰጠ ተለዋዋጭ ወጣቶች እና ንቁ የቡድን አባላት ትብብር ነው። እኛ ለደንበኞች ያማከለ አካሄድን፣ ሁለገብ የአገልግሎት አቅርቦቶቻችን እና ለጥራት ያለን ቁርጠኝነት ቅድሚያ እንሰጣለን። በአስተማማኝነት፣ በመተማመን እና ቀጣይነት ባለው ፈጠራ ላይ በማተኮር፣ የታመነ ቡድናችን የእያንዳንዱን ደንበኛ ተለዋዋጭ ፍላጎቶች ለማሟላት ይላመዳል።',
    // Highlights
    highlights: 'የዝግጅቱ ዋና ዋና ነጥቦች',
    highlight1: 'ከኢንዱስትሪ መሪዎች እና ባለሙያዎች ጋር መገናኘት',
    highlight2: 'ከከፍተኛ የዲጂታል ግብይት ባለሙያዎች መማር',
    highlight3: 'አዳዲስ የቴክኖሎጂ መፍትሄዎችን እና አዝማሚያዎችን ማሰስ',
    highlight4: 'ተመሳሳይ አስተሳሰብ ካላቸው ባለሙያዎች ጋር መገናኘት',
    highlight5: 'ለንግድ እድገት ጠቃሚ ግንዛቤዎችን ማግኘት',
    // Register
    registerNow: 'ለ2026 ዝግጅት አሁን ይመዝገቡ',
    registerNowShort: 'አሁን ይመዝገቡ',
    joinUs: 'ለማይረሳ ልምድ ይቀላቀሉን',
    // Slider
    slide1Title: 'እንኳን ወደ ድሪም ሞር ዝግጅት በደህና መጡ',
    slide1Desc: 'ይቀላቀሉን!',
    slide2Title: 'ናኪ ሆቴል',
    slide2Desc: 'ከመሪዎች ጋር ይገናኙ',
    slide3Title: 'ንግድ 2026',
    slide3Desc: 'ከምርጦቹ ይማሩ',
    slide4Title: 'የስኬት ታሪኮች',
    slide4Desc: 'የእሱ አካል ይሁኑ',
    // Footer
    empower: 'ዲጂታል ኤጀንሲዎችን ማበረታታት።',
    quickLinks: 'ፈጣን አገናኞች',
    home: 'መነሻ',
    admin: 'አስተዳዳሪ',
    eventInfo: 'የዝግጅት መረጃ',
    connect: 'ያገናኙ',
    privacy: 'ግላዊነት',
    terms: 'ውሎች',
    secure: 'ደህንነቱ',
    rights: '© 2026 ድሪም ሞር. ሁሉም መብቶች የተጠበቁ ናቸው።',
    backToHome: 'ወደ መነሻ ተመለስ',
    // Event Date
    eventDate: 'ሐምሌ 11, 2026',
    eventLocation: 'ድሪም ሞር ዝግጅቶች',
    eventTime: '8:00 (የአካባቢ ሰዓት)',
  }
};

export default function Home() {
  const [usersCount, setUsersCount] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Get current slides based on language
  const getSlides = () => [
    { id: 1, src: '/logo.jpg', alt: 'DreamMore Logo', title: t.slide1Title, description: t.slide1Desc },
    { id: 2, src: '/naky.webp', alt: 'Event Image 2', title: t.slide2Title, description: t.slide2Desc },
    { id: 3, src: '/people-taking-part-business-event.jpg', alt: 'Business Event', title: t.slide3Title, description: t.slide3Desc },
    { id: 4, src: '/secuss.webp', alt: 'Success', title: t.slide4Title, description: t.slide4Desc }
  ];

  const slides = getSlides();

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsersCount(data.users.length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleRegistrationSuccess = () => {
    setUsersCount(prev => prev + 1);
    setShowRegistration(false);
  };

  const handleAdminLoginSuccess = () => {
    window.location.href = '/admin/dashboard';
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // If showing comments, render CommentsSection with language prop
  if (showComments) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <AdminLogin 
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={handleAdminLoginSuccess}
          language={language}
        />
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="object-cover" />
                </div>
                <span className="text-lg font-extrabold text-gray-900">DreamMore</span>
              </Link>
              <button
                onClick={() => setShowComments(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                {t.backToHome}
              </button>
            </div>
          </div>
        </header>
        <CommentsSection language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <AdminLogin 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        language={language}
      />

      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo" 
                  width={40} 
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base md:text-xl font-extrabold text-gray-900 leading-tight">
                  DreamMore
                </span>
                <span className="hidden sm:block text-[8px] md:text-[10px] text-gray-500 leading-tight">
                  {t.rightwork}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <button
                onClick={toggleLanguage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap"
              >
                {t.language}
              </button>

              <Link
                href="https://www.dreammoredigitals.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap"
              >
                {t.website}
              </Link>

              <Link
                href="/contact"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap"
              >
                {t.contact}
              </Link>

              <button
                onClick={() => setShowComments(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap"
              >
                {t.comment}
              </button>

              {/* Login Button */}
              <Link
                href="/login"
                className="bg-green-50 hover:bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t.login}
              </Link>
              
              <button
                onClick={() => setShowRegistration(!showRegistration)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                {showRegistration ? t.close : t.register}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-all duration-300"
            >
              <span>{isMobileMenuOpen ? '✕' : '☰'}</span>
              <span>{t.menu}</span>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-2 pb-2 border-t border-gray-100 pt-2 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-all duration-300 text-left"
              >
                {t.language}
              </button>

              <Link
                href="https://www.dreammoredigitals.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.website}
              </Link>

              <Link
                href="/contact"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.contact}
              </Link>

              <button
                onClick={() => {
                  setShowComments(true);
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-all duration-300 text-left"
              >
                {t.comment}
              </button>

              {/* Mobile Login Button */}
              <Link
                href="/login"
                className="bg-green-50 hover:bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t.login}
              </Link>
              
              <button
                onClick={() => {
                  setShowRegistration(!showRegistration);
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm px-4 py-2 rounded-lg shadow-md transition-all duration-300 text-left"
              >
                {showRegistration ? t.close : t.register}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {showRegistration ? (
          <div className="py-4 md:py-8">
            <RegistrationForm onSuccess={handleRegistrationSuccess} language={language} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Left Side - Text Content */}
            <div className="space-y-3 md:space-y-6 fade-in">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
                  {t.welcome}{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {t.dreamMore}
                  </span>
                </h1>
                
                <div className="mt-2 md:mt-4 mb-2">
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 animate-pulse">
                    {t.eventAttendance}
                  </p>
                  <div className="flex justify-center lg:justify-start items-center gap-1 md:gap-2 mt-1 md:mt-2">
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium mx-1 md:mx-2">|</span>
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></span>
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></span>
                    <span className="inline-block w-1 h-1 md:w-2 md:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></span>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 max-w-3xl lg:max-w-full mx-auto lg:mx-0 font-medium">
                  {t.digitalAgency}
                </p>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 card-hover border border-gray-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center animate-pulse">
                    <i className="fas fa-rocket text-orange-600 text-sm md:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base md:text-xl font-bold text-gray-900">{t.about}</h2>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">{t.empowering}</p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                  {t.aboutText}
                </p>
              </div>

              {/* Event Description List */}
              <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 border border-orange-100/50">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <i className="fas fa-list-check text-orange-500"></i>
                  {t.highlights}
                </h3>
                <ul className="space-y-1.5 md:space-y-2">
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>{t.highlight1}</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>{t.highlight2}</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>{t.highlight3}</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>{t.highlight4}</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>{t.highlight5}</span>
                  </li>
                </ul>
              </div>

              {/* Mobile Register Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  <span>🎫</span>
                  {t.registerNow}
                </button>
              </div>
            </div>

            {/* Right Side - Image & Slider */}
            <div className="space-y-3 md:space-y-4">
              {/* Main Slider */}
              <div className="relative w-full overflow-hidden bg-gray-900 rounded-2xl md:rounded-3xl shadow-xl"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div 
                  ref={sliderRef}
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div
                      key={slide.id}
                      className="relative w-full flex-shrink-0 h-[180px] sm:h-[200px] md:h-[280px] lg:h-[350px]"
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        className="object-contain"
                        priority={slide.id === 1}
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-white px-4">
                          <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-0.5 drop-shadow-lg">
                            {slide.title}
                          </h2>
                          <p className="text-[10px] sm:text-xs md:text-sm text-white/90 drop-shadow-lg">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={prevSlide}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 md:p-2 transition z-10"
                  aria-label="Previous slide"
                >
                  <i className="fas fa-chevron-left text-xs md:text-sm"></i>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 md:p-2 transition z-10"
                  aria-label="Next slide"
                >
                  <i className="fas fa-chevron-right text-xs md:text-sm"></i>
                </button>

                <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 z-10">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index
                          ? 'bg-white w-3 md:w-6'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* download.jpeg Image */}
              <div className="relative w-full overflow-hidden bg-gray-900 rounded-xl md:rounded-2xl shadow-lg h-[160px] sm:h-[180px] md:h-[250px] lg:h-[300px]">
                <Image
                  src="/download.jpeg"
                  alt="Welcome to DreamMore Event"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                  <div className="p-3 md:p-4 text-white w-full">
                    <h3 className="text-xs sm:text-sm md:text-lg font-bold drop-shadow-lg">DreamMore Event 2026</h3>
                    <p className="text-[8px] sm:text-[10px] md:text-sm text-white/90 drop-shadow-lg">{t.joinUs}</p>
                    <button
                      onClick={() => setShowRegistration(true)}
                      className="mt-1 md:mt-2 bg-orange-500 hover:bg-orange-600 text-white text-[8px] sm:text-[10px] md:text-xs px-2 sm:px-3 md:px-5 py-1 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105"
                    >
                      <span>🎫</span>
                      <span>{t.registerNowShort}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 text-white border-t border-orange-400/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white/20">
                  <Image 
                    src="/logo.jpg" 
                    alt="DM" 
                    width={24} 
                    height={24}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-bold text-white">DreamMore</span>
                  <span className="block text-[6px] md:text-[8px] text-white/80">
                    {t.rightwork}
                  </span>
                </div>
              </div>
              <p className="text-[7px] md:text-[10px] text-white/80">{t.empower}</p>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">{t.quickLinks}</h4>
              <ul className="space-y-0.5 text-[7px] md:text-[10px]">
                <li>
                  <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5">
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    {t.home}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5">
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    {t.contact}
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5"
                  >
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    {t.admin}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowRegistration(true)} 
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5"
                  >
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    {t.register}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">{t.eventInfo}</h4>
              <ul className="space-y-0.5 text-[7px] md:text-[10px] text-white/80">
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-calendar text-white/60 w-2 text-[5px]"></i>
                  <span>{t.eventDate}</span>
                </li>
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-map-marker-alt text-white/60 w-2 text-[5px]"></i>
                  <span>{t.eventLocation}</span>
                </li>
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-clock text-white/60 w-2 text-[5px]"></i>
                  
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">{t.connect}</h4>
              <div className="flex gap-1.5">
                <a href="https://t.me/Dreammore21" target="_blank" rel="noopener noreferrer" className="w-5 h-5 md:w-6 md:h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white text-[7px] md:text-[8px]">
                  <i className="fab fa-telegram-plane"></i>
                </a>
                <a href="https://www.tiktok.com/@dreammorecompany" target="_blank" rel="noopener noreferrer" className="w-5 h-5 md:w-6 md:h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white text-[7px] md:text-[8px]">
                  <i className="fab fa-tiktok"></i>
                </a>
                <a href="#" className="w-5 h-5 md:w-6 md:h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white text-[7px] md:text-[8px]">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-1.5 pt-1.5 flex flex-col sm:flex-row justify-between items-center gap-1">
            <p className="text-[6px] md:text-[8px] text-white/80">{t.rights}</p>
            <div className="flex items-center gap-2 md:gap-3 text-[6px] md:text-[8px] text-white/80">
              <Link href="#" className="hover:text-white transition-colors">{t.privacy}</Link>
              <Link href="#" className="hover:text-white transition-colors">{t.terms}</Link>
              <span className="flex items-center gap-0.5">
                <i className="fas fa-shield-alt text-white/60 text-[5px] md:text-[6px]"></i>
                {t.secure}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>
    </div>
  );
}