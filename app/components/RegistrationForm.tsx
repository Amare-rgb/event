'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface RegistrationFormProps {
  onSuccess?: () => void;
  language?: 'en' | 'am';
}

// Service Categories
const SERVICE_CATEGORIES = {
  'TECHNOLOGY & SOFTWARE': [
    'Custom Software Development',
    'Website & Mobile App Development',
    'Startup Tech Solution',
    'Business Automation & IT Consultation'
  ],
  'CREATIVE & BRANDING': [
    'Brand Identity Design',
    'Graphic Design',
    'Content Creation'
  ],
  'DIGITAL BUSINESS': [
    'Digital Transformation & Consulting',
    'Digital Strategy Development',
    'Business Process Improvement',
    'Project Management Support'
  ],
  'DIGITAL MARKETING': [
    'Social Media Management',
    'Digital Marketing Strategy & Ads',
    'Video Production & Editing',
    'Photography & Drone Services'
  ]
};

const CATEGORY_NAMES = Object.keys(SERVICE_CATEGORIES);

// Translations
const translations = {
  en: {
    // Header
    eventRegistration: 'Event Registration',
    appName: 'DreamMore',
    // Form Labels
    firstName: 'First Name *',
    lastName: 'Last Name *',
    gender: 'Gender *',
    email: 'Email Address *',
    phone: 'Phone Number *',
    address: 'Address *',
    userType: 'User Type *',
    selectCourse: 'Select Course *',
    selectServiceCategory: 'Select Service Category *',
    selectService: 'Select Service *',
    organization: 'Organization / Company *',
    experience: 'Experience / Notes',
    chooseCourse: 'Select a course',
    chooseServiceCategory: 'Select a category',
    chooseService: 'Select a service',
    student: 'Student',
    serviceUser: 'Service User',
    noneCourse: 'None - No Course',
    noneService: 'None - No Service',
    noCourses: '⚠️ No courses available. Please contact administrator.',
    noServices: '⚠️ No services available. Please contact administrator.',
    noServicesInCategory: 'No services available in this category',
    loadingCourses: 'Loading courses...',
    loadingServices: 'Loading services...',
    // Placeholders
    firstNamePlaceholder: 'Abebe',
    lastNamePlaceholder: 'Kebede',
    emailPlaceholder: 'dreammore@example.com',
    phonePlaceholder: '+251 923456789',
    addressPlaceholder: '123 Bahir Dar',
    experiencePlaceholder: 'Your experience or special requests...',
    organizationPlaceholder: 'e.g., ABC Company',
    genderOptions: {
      select: 'Select your gender...',
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },
    // Buttons
    register: 'Register Now',
    registering: 'Registering...',
    // Messages
    success: 'Registration Successful!',
    welcome: 'Welcome to DreamMore! You will be redirected shortly...',
    firstNameError: 'First name is required',
    firstNameNumberError: 'First name cannot contain numbers',
    firstNameCharError: 'First name should only contain letters and spaces',
    lastNameError: 'Last name is required',
    lastNameNumberError: 'Last name cannot contain numbers',
    lastNameCharError: 'Last name should only contain letters and spaces',
    emailError: 'Please enter a valid email address',
    phoneError: 'Phone number is required',
    phoneValidError: 'Please enter a valid phone number',
    addressError: 'Address is required',
    genderError: 'Please select your gender',
    userTypeError: 'Please select user type',
    courseError: 'Please select a course',
    serviceCategoryError: 'Please select a service category',
    serviceError: 'Please select a service',
    organizationError: 'Organization name is required',
    networkError: 'Network error. Please try again.',
  },
  am: {
    // Header
    eventRegistration: 'የዝግጅት ምዝገባ',
    appName: 'ድሪም ሞር',
    // Form Labels
    firstName: 'ስም *',
    lastName: 'የአባት ስም *',
    gender: 'ፆታ *',
    email: 'ኢሜይል *',
    phone: 'ስልክ ቁጥር *',
    address: 'አድራሻ *',
    userType: 'የተጠቃሚ አይነት *',
    selectCourse: 'ኮርስ ይምረጡ *',
    selectServiceCategory: 'የአገልግሎት ምድብ ይምረጡ *',
    selectService: 'አገልግሎት ይምረጡ *',
    organization: 'ድርጅት / ኩባንያ *',
    experience: 'ልምድ / ማስታወሻ',
    chooseCourse: 'ኮርስ ይምረጡ',
    chooseServiceCategory: 'ምድብ ይምረጡ',
    chooseService: 'አገልግሎት ይምረጡ',
    student: 'ተማሪ',
    serviceUser: 'አገልግሎት ሰጪ',
    noneCourse: 'ምንም - ኮርስ የለም',
    noneService: 'ምንም - አገልግሎት የለም',
    noCourses: '⚠️ ምንም ኮርሶች የሉም። እባክዎ አስተዳዳሪውን ያነጋግሩ።',
    noServices: '⚠️ ምንም አገልግሎቶች የሉም። እባክዎ አስተዳዳሪውን ያነጋግሩ።',
    noServicesInCategory: 'በዚህ ምድብ ውስጥ ምንም አገልግሎቶች የሉም',
    loadingCourses: 'ኮርሶችን በማግኘት ላይ...',
    loadingServices: 'አገልግሎቶችን በማግኘት ላይ...',
    // Placeholders
    firstNamePlaceholder: 'አበበ',
    lastNamePlaceholder: 'ከበደ',
    emailPlaceholder: 'dreammore@example.com',
    phonePlaceholder: '+251 923456789',
    addressPlaceholder: '123 ባህር ዳር',
    experiencePlaceholder: 'ልምድዎ ወይም ልዩ ጥያቄዎች...',
    organizationPlaceholder: 'ለምሳሌ፡ ኤቢሲ ኩባንያ',
    genderOptions: {
      select: 'ፆታዎን ይምረጡ...',
      male: 'ወንድ',
      female: 'ሴት',
      other: 'ሌላ',
    },
    // Buttons
    register: 'አሁን ይመዝገቡ',
    registering: 'እየተመዘገበ ነው...',
    // Messages
    success: 'ምዝገባ ተሳክቷል!',
    welcome: 'እንኳን ወደ DreamMore በደህና መጡ! በቅርቡ ይዘናጋሉ...',
    firstNameError: 'ስም ያስፈልጋል',
    firstNameNumberError: 'ስም ቁጥሮችን ሊይዝ አይችልም',
    firstNameCharError: 'ስም ፊደላትን እና ክፍተቶችን ብቻ ሊይዝ ይችላል',
    lastNameError: 'የአባት ስም ያስፈልጋል',
    lastNameNumberError: 'የአባት ስም ቁጥሮችን ሊይዝ አይችልም',
    lastNameCharError: 'የአባት ስም ፊደላትን እና ክፍተቶችን ብቻ ሊይዝ ይችላል',
    emailError: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
    phoneError: 'ስልክ ቁጥር ያስፈልጋል',
    phoneValidError: 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ',
    addressError: 'አድራሻ ያስፈልጋል',
    genderError: 'እባክዎ ፆታዎን ይምረጡ',
    userTypeError: 'እባክዎ የተጠቃሚ አይነት ይምረጡ',
    courseError: 'እባክዎ ኮርስ ይምረጡ',
    serviceCategoryError: 'እባክዎ የአገልግሎት ምድብ ይምረጡ',
    serviceError: 'እባክዎ አገልግሎት ይምረጡ',
    organizationError: 'የድርጅት ስም ያስፈልጋል',
    networkError: 'የአውታረ መረብ ችግር። እባክዎ እንደገና ይሞክሩ።',
  }
};

export default function RegistrationForm({ onSuccess, language = 'en' }: RegistrationFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    userType: '', // 'student' or 'service'
    course: '',
    serviceCategory: '',
    serviceId: '',
    organization: '', // New field for organization
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[language];

  // Get filtered services based on selected category
  const filteredServices = formData.serviceCategory
    ? services.filter(s => s.category === formData.serviceCategory)
    : [];

  // Fetch services and courses from API when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/admin/services');
        const data = await response.json();
        if (response.ok) {
          setServices(data.services || []);
        } else {
          console.error('Failed to fetch services:', data.message);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses');
        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses || []);
        } else {
          console.error('Failed to fetch courses:', data.message);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchServices();
    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // First Name - only letters and spaces
    if (!formData.firstName.trim()) {
      newErrors.firstName = t.firstNameError;
    } else if (/[0-9]/.test(formData.firstName)) {
      newErrors.firstName = t.firstNameNumberError;
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = t.firstNameCharError;
    }
    
    // Last Name - only letters and spaces
    if (!formData.lastName.trim()) {
      newErrors.lastName = t.lastNameError;
    } else if (/[0-9]/.test(formData.lastName)) {
      newErrors.lastName = t.lastNameNumberError;
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = t.lastNameCharError;
    }
    
    // Email - required
    if (!formData.email.trim()) {
      newErrors.email = t.emailError;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailError;
    }
    
    // Phone - required - only numbers, +, -, spaces, ()
    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneError;
    } else if (!/^[\+\d\s\-()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = t.phoneValidError;
    }
    
    // Address - required
    if (!formData.address.trim()) {
      newErrors.address = t.addressError;
    }
    
    // Gender - required
    if (!formData.gender) {
      newErrors.gender = t.genderError;
    }
    
    // User Type - required
    if (!formData.userType) {
      newErrors.userType = t.userTypeError;
    }
    
    // Conditional validation based on user type
    if (formData.userType === 'student') {
      if (!formData.course) {
        newErrors.course = t.courseError;
      }
    } else if (formData.userType === 'service') {
      if (!formData.serviceCategory) {
        newErrors.serviceCategory = t.serviceCategoryError;
      }
      if (!formData.serviceId) {
        newErrors.serviceId = t.serviceError;
      }
      // Organization validation for service users
      if (!formData.organization.trim()) {
        newErrors.organization = t.organizationError;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if ((name === 'firstName' || name === 'lastName') && /[0-9]/.test(value)) {
      return;
    }
    
    if (name === 'phone') {
      const phoneRegex = /^[\+\d\s\-()]*$/;
      if (!phoneRegex.test(value)) {
        return;
      }
    }
    
    // If userType changes, clear the related fields
    if (name === 'userType') {
      setFormData({ 
        ...formData, 
        userType: value,
        course: '',
        serviceCategory: '',
        serviceId: '',
        organization: '' // Clear organization when switching user type
      });
    } else if (name === 'serviceCategory') {
      // When category changes, clear the service selection
      setFormData({ 
        ...formData, 
        serviceCategory: value,
        serviceId: ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
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
      const submitData = {
        ...formData,
        course: formData.userType === 'student' ? formData.course : '',
        serviceId: formData.userType === 'service' ? formData.serviceId : '',
        organization: formData.userType === 'service' ? formData.organization : '',
        userType: formData.userType,
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: '✅ ' + t.success, 
          type: 'success' 
        });
        setIsSuccess(true);
        setFormData({ 
          firstName: '', 
          lastName: '', 
          email: '',
          phone: '', 
          address: '',
          gender: '',
          userType: '',
          course: '',
          serviceCategory: '',
          serviceId: '',
          organization: '',
          experience: '',
        });
        
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 3000);
        
      } else {
        setMessage({ 
          text: `❌ ${data.message || t.register}`, 
          type: 'error' 
        });
      }
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
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      {/* Logo at top */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
          <Image 
            src="/logo.jpg" 
            alt="DreamMore Logo" 
            width={48} 
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.appName}</h2>
          <p className="text-xs text-gray-500">{t.eventRegistration}</p>
        </div>
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.firstName}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t.firstNamePlaceholder}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.lastName}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t.lastNamePlaceholder}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.gender}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t.genderOptions.select}</option>
              <option value="Male">{t.genderOptions.male}</option>
              <option value="Female">{t.genderOptions.female}</option>
              <option value="Other">{t.genderOptions.other}</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t.emailPlaceholder}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.phone}
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t.phonePlaceholder}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.address}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t.addressPlaceholder}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* User Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.userType}
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                errors.userType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select user type...</option>
              <option value="student">{t.student}</option>
              <option value="service">{t.serviceUser}</option>
            </select>
            {errors.userType && (
              <p className="text-red-500 text-xs mt-1">{errors.userType}</p>
            )}
          </div>

          {/* Course Selection - Only visible when Student is selected */}
          {formData.userType === 'student' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.selectCourse}
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                  errors.course ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingCourses}
              >
                <option value="">
                  {loadingCourses ? t.loadingCourses : t.chooseCourse}
                </option>
                <option value="none">{t.noneCourse}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.course && (
                <p className="text-red-500 text-xs mt-1">{errors.course}</p>
              )}
              {courses.length === 0 && !loadingCourses && (
                <p className="text-yellow-500 text-xs mt-1">
                  {t.noCourses}
                </p>
              )}
            </div>
          )}

          {/* Service Selection - Only visible when Service User is selected */}
          {formData.userType === 'service' && (
            <div className="animate-fadeIn space-y-3">
              {/* Service Category Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t.selectServiceCategory}
                </label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                    errors.serviceCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{t.chooseServiceCategory}</option>
                  {CATEGORY_NAMES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.serviceCategory && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceCategory}</p>
                )}
              </div>

              {/* Service Dropdown - Filtered by Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t.selectService}
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  required
                  disabled={!formData.serviceCategory || loadingServices}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                    errors.serviceId ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.serviceCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingServices ? t.loadingServices : t.chooseService}
                  </option>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <option key={service.id} value={service.id.toString()}>
                        {service.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {formData.serviceCategory ? t.noServicesInCategory : t.chooseServiceCategory}
                    </option>
                  )}
                </select>
                {errors.serviceId && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceId}</p>
                )}
                {filteredServices.length === 0 && formData.serviceCategory && !loadingServices && (
                  <p className="text-yellow-500 text-xs mt-1">
                    {t.noServicesInCategory}
                  </p>
                )}
              </div>

              {/* Organization Field - Only for Service Users */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t.organization}
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    errors.organization ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.organizationPlaceholder}
                />
                {errors.organization && (
                  <p className="text-red-500 text-xs mt-1">{errors.organization}</p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t.experience}
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder={t.experiencePlaceholder}
            />
          </div>
          
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || loadingServices || loadingCourses}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg min-w-[180px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.registering}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.register}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h3>
          <p className="text-gray-600">{t.welcome}</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
            <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}