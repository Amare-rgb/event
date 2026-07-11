'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RegistrationForm from '@/app/components/RegistrationForm';
import AdminLogin from '@/app/components/AdminLogin';
import CommentsSection from '@/app/components/CommentsSection';

export default function Home() {
  const [usersCount, setUsersCount] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const slides = [
    { id: 1, src: '/logo.jpg', alt: 'DreamMore Logo', title: 'Welcom To DreamMore Event', description: 'Join us!' },
    { id: 2, src: '/naky.webp', alt: 'Event Image 2', title: 'Naky Hotel', description: 'Connect with leaders' },
    { id: 3, src: '/people-taking-part-business-event.jpg', alt: 'Business Event', title: 'Business 2026', description: 'Learn from the best' },
    { id: 4, src: '/secuss.webp', alt: 'Success', title: 'Success Stories', description: 'Be part of it' }
  ];

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

  // If showing comments, render CommentsSection
  if (showComments) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <AdminLogin 
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={handleAdminLoginSuccess}
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
                Back to Home
              </button>
            </div>
          </div>
        </header>
        <CommentsSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <AdminLogin 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Logo - Compact on mobile */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                  <Image 
                    src="/logo.jpg" 
                    alt="Logo" 
                    width={56} 
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-base md:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
                    DreamMore
                  </span>
                  <span className="hidden xs:flex text-[8px] md:text-xs text-gray-500 tracking-wider items-center gap-1">
                    <i className="fas fa-clock text-orange-500 text-[6px] md:text-[10px]"></i>
                    Rightwork at right time
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-block ml-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <i className="fas fa-ticket-alt mr-1"></i>2026
              </span>
            </Link>

            {/* Center - Text - Hidden on mobile */}
            <div className="hidden lg:block flex-1 text-center">
              <span className="text-sm font-extrabold text-orange-600 tracking-wide">
                Dream More Event Registration System
              </span>
            </div>

            {/* Right - Buttons - Full visibility on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Contact Button - NEW */}
              <Link
                href="/contact"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105 whitespace-nowrap"
              >
                <span className="inline">📞 Contact</span>
              </Link>

              {/* Comment Button */}
              <button
                onClick={() => setShowComments(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105 whitespace-nowrap"
              >
                <span className="inline">💬 Comment</span>
              </button>
              
              {/* Register Button - Always visible */}
              <button
                onClick={() => setShowRegistration(!showRegistration)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105 whitespace-nowrap"
              >
                <span className="inline">{showRegistration ? '✕ Close' : '📝 Register'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Rest of the content remains the same... */}
      {/* Main Content with Left Text and Right Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {showRegistration ? (
          <div className="py-4 md:py-8">
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Left Side - Text Content */}
            <div className="space-y-3 md:space-y-6 fade-in">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    DreamMore
                  </span>
                </h1>
                
                <div className="mt-2 md:mt-4 mb-2">
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 animate-pulse">
                    ✨ Dream More Event Attendance ✨
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
                  Digital Agency Event 2026
                </p>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 card-hover border border-gray-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center animate-pulse">
                    <i className="fas fa-rocket text-orange-600 text-sm md:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base md:text-xl font-bold text-gray-900">About DreamMore</h2>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">Empowering Digital Excellence</p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                  Dream More is a collaborative group of dynamic youth and active team members dedicated to education purpose, digital marketing, and a wide range of tech-related services. We prioritize a client-centred approach, supported by our versatile service offerings and an unwavering commitment to quality. With a focus on reliability, trust, and continuous innovation, our dedicated team adapts to meet the evolving demands of every client, ensuring that we consistently exceed expectations.
                </p>
              </div>

              {/* Event Description List */}
              <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 border border-orange-100/50">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <i className="fas fa-list-check text-orange-500"></i>
                  Event Highlights
                </h3>
                <ul className="space-y-1.5 md:space-y-2">
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>Network with industry leaders and professionals</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>Learn from top digital marketing experts</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>Explore innovative tech solutions and trends</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>Connect with like-minded professionals</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    <i className="fas fa-check-circle text-orange-500 mt-0.5 text-xs md:text-sm"></i>
                    <span>Gain valuable insights for business growth</span>
                  </li>
                </ul>
              </div>

              {/* Mobile Register Button - Visible only on mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  <span>🎫</span>
                  Register Now for Event 2026
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
                    <p className="text-[8px] sm:text-[10px] md:text-sm text-white/90 drop-shadow-lg">Join us for an unforgettable experience</p>
                    <button
                      onClick={() => setShowRegistration(true)}
                      className="mt-1 md:mt-2 bg-orange-500 hover:bg-orange-600 text-white text-[8px] sm:text-[10px] md:text-xs px-2 sm:px-3 md:px-5 py-1 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105"
                    >
                      <span>🎫</span>
                      <span>Register Now</span>
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
                  <span className="block text-[6px] md:text-[8px] text-white/80">Rightwork at right time</span>
                </div>
              </div>
              <p className="text-[7px] md:text-[10px] text-white/80">Empower digital agencies.</p>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">Quick Links</h4>
              <ul className="space-y-0.5 text-[7px] md:text-[10px]">
                <li>
                  <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5">
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5">
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    Contact
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5"
                  >
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    Admin
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowRegistration(true)} 
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-0.5"
                  >
                    <i className="fas fa-chevron-right text-[4px] text-white/60"></i>
                    Register
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">Event Info</h4>
              <ul className="space-y-0.5 text-[7px] md:text-[10px] text-white/80">
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-calendar text-white/60 w-2 text-[5px]"></i>
                  <span>July 11, 2026</span>
                </li>
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-map-marker-alt text-white/60 w-2 text-[5px]"></i>
                  <span>DreamMore Events</span>
                </li>
                <li className="flex items-center gap-0.5">
                  <i className="fas fa-clock text-white/60 w-2 text-[5px]"></i>
                  <span>8:00 (local Time)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[9px] md:text-xs font-semibold text-white mb-0.5">Connect</h4>
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
            <p className="text-[6px] md:text-[8px] text-white/80">© 2026 DreamMore. All rights reserved.</p>
            <div className="flex items-center gap-2 md:gap-3 text-[6px] md:text-[8px] text-white/80">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <span className="flex items-center gap-0.5">
                <i className="fas fa-shield-alt text-white/60 text-[5px] md:text-[6px]"></i>
                Secure
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
        
        /* Custom breakpoint for extra small screens */
        @media (min-width: 480px) {
          .xs\\:flex { display: flex; }
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
        @media (max-width: 479px) {
          .xs\\:flex { display: none; }
          .xs\\:inline { display: none; }
          .xs\\:hidden { display: inline; }
        }
      `}</style>
    </div>
  );
}