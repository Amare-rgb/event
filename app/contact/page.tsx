// app/contact/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactPage() {
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
      // Here you would send the form data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      details: 'suport@dreammoredigitals.com',
      link: 'mailto:suport@dreammoredigitals.com'
    },
    {
      icon: '📱',
      title: 'Phone',
      details: '+251 993 132 122',
      link: 'tel:+251993132122'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      details: '+251 993 132 122',
      link: 'https://wa.me/251993132122'
    },
    {
      icon: '✈️',
      title: 'Telegram',
      details: '@Dreammore21',
      link: 'https://t.me/Dreammore21'
    },
    {
      icon: '📍',
      title: 'Location',
      details: 'Bahirdar, Ethiopia',
      link: 'https://maps.google.com/?q=Bahirdar,Ethiopia'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
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
                    <span className="text-orange-500 text-[6px] md:text-[10px]">⏰</span>
                    Rightwork at right time
                  </span>
                </div>
              </div>
            </Link>

            <div className="hidden lg:block flex-1 text-center">
              <span className="text-sm font-extrabold text-orange-600 tracking-wide">
                Contact Us
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105 whitespace-nowrap"
              >
                <span>🏠</span>
                <span className="hidden xs:inline">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12 fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our event or services? Wed love to hear from you! 
            Reach out to us through any of the channels below.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side - Contact Information */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📌</span>
                Contact Information
              </h2>
              
              <div className="space-y-3">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : undefined}
                    rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.title}
                      </p>
                      <p className="text-sm md:text-base text-gray-900 font-medium group-hover:text-orange-600 transition-colors">
                        {item.details}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-orange-500 transition-colors">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media / Quick Links */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-orange-100/50">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🌐</span>
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://t.me/Dreammore21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <span>✈️</span>
                  Telegram
                </a>
                <a
                  href="https://wa.me/251993132122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <span>💬</span>
                  WhatsApp
                </a>
                <a
                  href="https://www.tiktok.com/@dreammorecompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <span>🎵</span>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✉️</span>
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              {submitStatus.type === 'success' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-green-700 text-sm">{submitStatus.message}</p>
                </div>
              )}

              {submitStatus.type === 'error' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-700 text-sm">{submitStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 md:mt-12 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🗺️</span>
              Find Us
            </h3>
            <div className="relative w-full h-[200px] md:h-[300px] bg-gray-200 rounded-lg overflow-hidden">
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
              📍 Bahirdar, Ethiopia
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.8s ease-out; }
        
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