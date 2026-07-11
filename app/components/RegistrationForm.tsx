'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    course: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch courses from API when component mounts
  useEffect(() => {
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
    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // First Name - only letters and spaces
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (/[0-9]/.test(formData.firstName)) {
      newErrors.firstName = 'First name cannot contain numbers';
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should only contain letters and spaces';
    }
    
    // Last Name - only letters and spaces
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (/[0-9]/.test(formData.lastName)) {
      newErrors.lastName = 'Last name cannot contain numbers';
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should only contain letters and spaces';
    }
    
    // Email - optional but validate if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone - required - only numbers, +, -, spaces, ()
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+\d\s\-()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Address - required
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Gender - required
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Course - NOT required anymore (removed validation)
    // if (!formData.course) {
    //   newErrors.course = 'Please select a course';
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For first and last name, prevent number input
    if ((name === 'firstName' || name === 'lastName') && /[0-9]/.test(value)) {
      return;
    }
    
    // For phone, only allow numbers, +, -, spaces, ()
    if (name === 'phone') {
      const phoneRegex = /^[\+\d\s\-()]*$/;
      if (!phoneRegex.test(value)) {
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user types
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
      // Prepare data - if course is "none" or empty, send empty string
      const submitData = {
        ...formData,
        course: formData.course === 'none' || !formData.course ? '' : formData.course
      };

      console.log('Submitting data:', submitData); // For debugging

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: '✅ Registration successful! Welcome to DreamMore!', 
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
          course: '',
          experience: '',
        });
        
        // Wait 3 seconds before closing the form
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 3000);
        
      } else {
        setMessage({ 
          text: `❌ ${data.message || 'Registration failed'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: '❌ Network error. Please try again.', 
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
          <h2 className="text-xl font-bold text-gray-900">DreamMore</h2>
          <p className="text-xs text-gray-500">Event Registration</p>
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

      {/* Don't show form if success, show success message only */}
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name *
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
                placeholder="Abebe"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name *
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
                placeholder="Kebede"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Gender Field - Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gender *
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
              <option value="">Select your gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="dreammore@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number *
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
              placeholder="+251 923456789"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address *
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
              placeholder="123 Bahir Dar"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Course <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white cursor-pointer ${
                errors.course ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? 'Loading courses...' : 'Choose a course (optional)'}
              </option>
              {/* "None" option - this will submit empty string */}
              <option value="none">None - No Course</option>
              {/* Display all courses from API */}
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
                ⚠️ No courses available. Please contact administrator.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Experience / Notes
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="Your experience or special requests..."
            />
          </div>
          
          {/* Centered Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || loadingCourses}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg min-w-[180px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Register Now
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        // Success message with auto-close
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
          <p className="text-gray-600">Welcome to DreamMore! You will be redirected shortly...</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
            <div className="bg-green-500 h-2 rounded-full animate-progress"></div>
          </div>
        </div>
      )}

      {/* Add progress animation */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}