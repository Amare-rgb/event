'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Translations
const translations = {
  en: {
    // Header
    contactUs: 'Contact Us',
    home: 'Home',
    // Hero
    getInTouch: 'Get in Touch',
    heroDescription: 'Have questions about our event or services? We\'d love to hear from you! Reach out to us through any of the channels below.',
    // Contact Info
    contactInformation: 'Contact Information',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    location: 'Location',
    // Form
    sendMessage: 'Send Us a Message',
    yourName: 'Your Name *',
    emailAddress: 'Email Address *',
    subject: 'Subject',
    message: 'Message *',
    enterName: 'Enter your name',
    enterEmail: 'Enter your email',
    enterSubject: 'What\'s this about?',
    writeMessage: 'Write your message here...',
    send: 'Send Message',
    sending: 'Sending...',
    // Success/Error
    successMessage: 'Thank you! Your message has been sent successfully.',
    errorMessage: 'Failed to send message. Please try again.',
    // Social
    connectWithUs: 'Connect With Us',
    findUs: 'Find Us',
    // Footer
    rightwork: 'Rightwork at right time',
  },
  am: {
    // Header
    contactUs: 'አግኙን',
    home: 'መነሻ',
    // Hero
    getInTouch: 'ያግኙን',
    heroDescription: 'ስለ ዝግጅታችን ወይም አገልግሎቶቻችን ጥያቄ አለዎት? ከእኛ ጋር መገናኘት እንወዳለን! ከታች ባሉት ማንኛውም ቻናሎች ያግኙን።',
    // Contact Info
    contactInformation: 'የእውቂያ መረጃ',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    whatsapp: 'ዋትስአፕ',
    telegram: 'ቴሌግራም',
    location: 'አድራሻ',
    // Form
    sendMessage: 'መልእክት ይላኩልን',
    yourName: 'ስምዎ *',
    emailAddress: 'ኢሜይል አድራሻ *',
    subject: 'ርዕስ',
    message: 'መልእክት *',
    enterName: 'ስምዎን ያስገቡ',
    enterEmail: 'ኢሜይልዎን ያስገቡ',
    enterSubject: 'ይህ ስለ ምንድነው?',
    writeMessage: 'መልእክትዎን እዚህ ይጻፉ...',
    send: 'መልእክት ላክ',
    sending: 'እየተላከ ነው...',
    // Success/Error
    successMessage: 'እናመሰግናለን! መልእክትዎ በተሳካ ሁኔታ ተልኳል።',
    errorMessage: 'መልእክት መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    // Social
    connectWithUs: 'ያገናኙን',
    findUs: 'ያግኙን',
    // Footer
    rightwork: 'በትክክለኛው ጊዜ ትክክለኛ ስራ',
  }
};

export default function ContactPage() {
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus({
        type: 'success',
        message: t.successMessage
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: t.errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: '', title: t.email, details: 'suport@dreammoredigitals.com', link: 'mailto:suport@dreammoredigitals.com' },
    { icon: '', title: t.phone, details: '+251 993 132 122', link: 'tel:+251993132122' },
    { icon: '', title: t.whatsapp, details: '+251 993 132 122', link: 'https://wa.me/251993132122' },
    { icon: '', title: t.telegram, details: '@Dreammore21', link: 'https://t.me/Dreammore21' },
    { icon: '', title: t.location, details: language === 'en' ? 'Bahirdar, Ethiopia' : 'ባህር ዳር፣ ኢትዮጵያ', link: 'https://maps.google.com/?q=Bahirdar,Ethiopia' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-md">
                <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="hidden xs:block">
                <span className="text-lg md:text-xl font-extrabold text-gray-900">DreamMore</span>
                <span className="hidden sm:block text-[10px] text-gray-500">{t.rightwork}</span>
              </div>
            </Link>

            <div className="hidden lg:block text-center">
              <span className="text-sm font-bold text-orange-600">{t.contactUs}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>{language === 'en' ? '🇪🇹' : '🇬🇧'}</span>
                <span className="hidden xs:inline">{language === 'en' ? 'አማርኛ' : 'English'}</span>
              </button>

              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>Home</span>
                <span className="hidden xs:inline">{t.home}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            {t.getInTouch}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            {t.heroDescription}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left - Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span></span> {t.contactInformation}
              </h2>
              <div className="space-y-2">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : undefined}
                    rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition group"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase">{item.title}</p>
                      <p className="text-sm text-gray-900 font-medium group-hover:text-orange-600 transition">
                        {item.details}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-orange-500">→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100/50">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span></span> {t.connectWithUs}
              </h3>
              <div className="flex flex-wrap gap-2">
                <a href="https://t.me/Dreammore21" target="_blank" rel="noopener noreferrer" className="bg-white px-4 py-2 rounded-full shadow hover:shadow-lg transition hover:scale-105 text-sm flex items-center gap-2">
                  <span></span> {t.telegram}
                </a>
                <a href="https://wa.me/251993132122" target="_blank" rel="noopener noreferrer" className="bg-white px-4 py-2 rounded-full shadow hover:shadow-lg transition hover:scale-105 text-sm flex items-center gap-2">
                  <span></span> {t.whatsapp}
                </a>
                <a href="https://www.tiktok.com/@dreammorecompany" target="_blank" rel="noopener noreferrer" className="bg-white px-4 py-2 rounded-full shadow hover:shadow-lg transition hover:scale-105 text-sm flex items-center gap-2">
                  <span></span> TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✉️</span> {t.sendMessage}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.yourName}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder={t.enterName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailAddress}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder={t.enterEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.subject}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder={t.enterSubject}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.message}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                  placeholder={t.writeMessage}
                />
              </div>

              {submitStatus.type === 'success' && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-green-700 text-sm">{submitStatus.message}</p>
                </div>
              )}

              {submitStatus.type === 'error' && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-red-700 text-sm">{submitStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {t.sending}
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    {t.send}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-8 md:mt-10 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-4 md:p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🗺️</span> {t.findUs}
            </h3>
            <div className="relative w-full h-[200px] md:h-[280px] bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126866.5!2d37.35!3d11.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8b1a8e8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sBahir%20Dar%2C%20Ethiopia!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              📍 {language === 'en' ? 'Bahirdar, Ethiopia' : 'ባህር ዳር፣ ኢትዮጵያ'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out; }
        
        @media (min-width: 480px) {
          .xs\\:block { display: block; }
          .xs\\:inline { display: inline; }
        }
        @media (max-width: 479px) {
          .xs\\:block { display: none; }
          .xs\\:inline { display: none; }
        }
      `}</style>
    </div>
  );
}