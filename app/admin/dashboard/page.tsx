'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EmailBroadcast from '@/app/components/EmailBroadcast';
import AdminSidebar from '@/app/components/AdminSidebar';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  course: string;
  experience: string;
  registered_at: string;
}

interface Comment {
  id: number;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface ServiceUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  course: string;
  experience: string;
  status: string;
  registered_at: string;
}

// Translations
const translations = {
  en: {
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage Users',
    serviceUsers: 'Service Users',
    comments: 'Comments',
    courses: 'Courses',
    emailBroadcast: 'Email Broadcast',
    logout: 'Logout',
    manageUsersTitle: 'Manage Users',
    userComments: 'User Comments',
    courseManagement: 'Course Management',
    emailBroadcastTitle: 'Email Broadcast',
    search: 'Search',
    searchPlaceholder: 'Search by name, email, phone...',
    filterByCourse: 'Filter by Course',
    allCourses: 'All Courses',
    clear: 'Clear',
    id: '#',
    firstName: 'First',
    lastName: 'Last',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    gender: 'Gender',
    course: 'Course',
    experience: 'Experience',
    date: 'Date',
    time: 'Time',
    action: 'Action',
    delete: 'Delete',
    allUserComments: 'All User Comments',
    noComments: 'No comments yet',
    commentBy: 'Comment by',
    emailLabel: 'Email',
    addNewCourse: 'Add New Course',
    courseName: 'Course Name',
    courseDescription: 'Course Description (optional)',
    addCourse: 'Add Course',
    noCourses: 'No courses added yet',
    added: 'Added',
    userDeleted: 'User deleted successfully!',
    commentDeleted: 'Comment deleted successfully!',
    courseAdded: 'Course added successfully!',
    courseDeleted: 'Course deleted successfully!',
    export: 'Export',
    refresh: 'Refresh',
    total: 'Total',
    noUsersMatch: 'No users match your filters',
    noUsersRegistered: 'No users registered yet',
    na: 'N/A',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferNotToSay: 'Prefer not to say',
    unknownUser: 'Unknown User',
  },
  am: {
    adminPanel: 'የአስተዳዳሪ ፓነል',
    manageUsers: 'ተጠቃሚዎችን ያስተዳድሩ',
    serviceUsers: 'የአገልግሎት ተጠቃሚዎች',
    comments: 'አስተያየቶች',
    courses: 'ኮርሶች',
    emailBroadcast: 'የኢሜይል ስርጭት',
    logout: 'ውጣ',
    manageUsersTitle: 'ተጠቃሚዎችን ያስተዳድሩ',
    userComments: 'የተጠቃሚ አስተያየቶች',
    courseManagement: 'የኮርስ አስተዳደር',
    emailBroadcastTitle: 'የኢሜይል ስርጭት',
    search: 'ፈልግ',
    searchPlaceholder: 'በስም፣ ኢሜይል ወይም ስልክ ፈልግ...',
    filterByCourse: 'በኮርስ አጣራ',
    allCourses: 'ሁሉም ኮርሶች',
    clear: 'አጽዳ',
    id: '#',
    firstName: 'ስም',
    lastName: 'የአባት ስም',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    address: 'አድራሻ',
    gender: 'ፆታ',
    course: 'ኮርስ',
    experience: 'ልምድ',
    date: 'ቀን',
    time: 'ሰዓት',
    action: 'ድርጊት',
    delete: 'ሰርዝ',
    allUserComments: 'ሁሉም የተጠቃሚ አስተያየቶች',
    noComments: 'እስካሁን አስተያየት የለም',
    commentBy: 'አስተያየት የሰጠው',
    emailLabel: 'ኢሜይል',
    addNewCourse: 'አዲስ ኮርስ ያክሉ',
    courseName: 'የኮርስ ስም',
    courseDescription: 'የኮርስ መግለጫ (አማራጭ)',
    addCourse: 'ኮርስ ያክሉ',
    noCourses: 'እስካሁን ምንም ኮርሶች አልተጨመሩም',
    added: 'ተጨምሯል',
    userDeleted: 'ተጠቃሚ በተሳካ ሁኔታ ተሰርዟል!',
    commentDeleted: 'አስተያየት በተሳካ ሁኔታ ተሰርዟል!',
    courseAdded: 'ኮርስ በተሳካ ሁኔታ ተጨምሯል!',
    courseDeleted: 'ኮርስ በተሳካ ሁኔታ ተሰርዟል!',
    export: 'ወጭ',
    refresh: 'አድስ',
    total: 'ጠቅላላ',
    noUsersMatch: 'ከማጣሪያዎ ጋር የሚዛመዱ ተጠቃሚዎች የሉም',
    noUsersRegistered: 'እስካሁን ምንም ተጠቃሚዎች አልተመዘገቡም',
    na: 'የለም',
    male: 'ወንድ',
    female: 'ሴት',
    other: 'ሌላ',
    preferNotToSay: 'ለመናገር አይመርጡም',
    unknownUser: 'ያልታወቀ ተጠቃሚ',
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourseNames, setAllCourseNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'courses' | 'broadcast' | 'serviceUsers'>('users');
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  
  // Service users count state
  const [serviceUsersCount, setServiceUsersCount] = useState(0);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  // Fetch service users
  const fetchServiceUsers = async () => {
    try {
      const response = await fetch('/api/admin/service-users');
      if (response.ok) {
        const data = await response.json();
        setServiceUsers(data.users || []);
        setServiceUsersCount(data.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching service users:', error);
    }
  };

  // Fetch service users count
  const fetchServiceUsersCount = async () => {
    try {
      const response = await fetch('/api/admin/service-users');
      if (response.ok) {
        const data = await response.json();
        setServiceUsersCount(data.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching service users count:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        const userData = data.users || [];
        setUsers(userData);
        setError('');
        
        await updateCourseListFromUsers(userData);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error - Please check your database connection');
    } finally {
      setLoading(false);
    }
  };

  const updateCourseListFromUsers = async (userData: User[]) => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      
      if (response.ok) {
        const coursesFromTable = data.courses || [];
        setCourses(coursesFromTable);
        
        const userCourses = new Set<string>();
        userData.forEach(user => {
          if (user.course) {
            user.course.split(',').forEach(c => {
              const trimmed = c.trim();
              if (trimmed) userCourses.add(trimmed);
            });
          }
        });
        
        const allCourseNamesSet = new Set<string>();
        
        coursesFromTable.forEach((course: Course) => {
          if (course.name) allCourseNamesSet.add(course.name);
        });
        
        userCourses.forEach((course: string) => {
          if (course) allCourseNamesSet.add(course);
        });
        
        const combinedCourseNames = Array.from(allCourseNamesSet).sort();
        setAllCourseNames(combinedCourseNames);
        
        console.log('📚 All courses from both sources:', combinedCourseNames);
      }
    } catch (error) {
      console.error('Courses fetch error:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      const data = await response.json();
      
      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Comments fetch error:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      
      if (response.ok) {
        const coursesFromTable = data.courses || [];
        setCourses(coursesFromTable);
        
        const userCourses = new Set<string>();
        users.forEach(user => {
          if (user.course) {
            user.course.split(',').forEach(c => {
              const trimmed = c.trim();
              if (trimmed) userCourses.add(trimmed);
            });
          }
        });
        
        const allCourseNamesSet = new Set<string>();
        coursesFromTable.forEach((course: Course) => {
          if (course.name) allCourseNamesSet.add(course.name);
        });
        userCourses.forEach((course: string) => {
          if (course) allCourseNamesSet.add(course);
        });
        
        const combinedCourseNames = Array.from(allCourseNamesSet).sort();
        setAllCourseNames(combinedCourseNames);
        
        console.log('📚 All courses from both sources:', combinedCourseNames);
      }
    } catch (error) {
      console.error('Courses fetch error:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchUsers();
        await fetchComments();
        await fetchCourses();
        await fetchServiceUsers();
        await fetchServiceUsersCount();
      } catch (error) {
        console.error("Dashboard data loading error:", error);
      }
    };

    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
    fetchComments();
    fetchCourses();
    fetchServiceUsers();
    fetchServiceUsersCount();
  };

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setDeletingId(userId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to delete user';
        try {
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        await updateCourseListFromUsers(updatedUsers);
        setSuccessMessage(t.userDeleted);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Network error - Please try again');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
        setSuccessMessage(t.commentDeleted);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('courseName') as string;
    const description = formData.get('courseDescription') as string;

    if (!name.trim()) return;

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        form.reset();
        await fetchCourses();
        setSuccessMessage(t.courseAdded);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses();
        setSuccessMessage(t.courseDeleted);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // Filter users with proper course matching
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.phone?.includes(searchTerm) ||
      user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.course?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCourse = true;
    if (selectedCourse) {
      if (user.course) {
        const userCourses = user.course.split(',').map(c => c.trim().toLowerCase());
        matchesCourse = userCourses.some(course => 
          course === selectedCourse.toLowerCase()
        );
      } else {
        matchesCourse = false;
      }
    }
    
    return matchesSearch && matchesCourse;
  });

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(language === 'en' ? 'en-US' : 'am-ET', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  // Get gender badge color
  const getGenderBadge = (gender: string) => {
    if (!gender) return <span className="text-gray-400 text-[10px]">{t.na}</span>;
    
    const genderMap: {[key: string]: string} = {
      'male': t.male,
      'female': t.female,
      'other': t.other,
      'prefer-not-to-say': t.preferNotToSay
    };
    
    const colors: {[key: string]: string} = {
      'male': 'bg-blue-100 text-blue-700',
      'female': 'bg-pink-100 text-pink-700',
      'other': 'bg-purple-100 text-purple-700',
      'prefer-not-to-say': 'bg-gray-100 text-gray-700'
    };
    
    const displayGender = genderMap[gender.toLowerCase()] || gender;
    const colorClass = colors[gender.toLowerCase()] || 'bg-gray-100 text-gray-700';
    
    return (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap ${colorClass}`}>
        {displayGender}
      </span>
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export!');
      return;
    }

    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Address',
      'Gender', 'Course', 'Experience', 'Date', 'Time'
    ];

    const rows = filteredUsers.map(user => {
      const { date, time } = formatDateTime(user.registered_at);
      return [
        user.first_name, user.last_name, user.email || 'N/A',
        user.phone, user.address, user.gender || 'N/A',
        user.course, user.experience || 'N/A', date, time
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get unique courses for broadcast filter
  const uniqueCourses = Array.from(
    new Set(
      users
        .map(u => u.course)
        .filter(Boolean)
        .flatMap(course => course.split(',').map(c => c.trim()))
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usersCount={users.length}
        commentsCount={comments.length}
        coursesCount={courses.length}
        emailUsersCount={users.filter(u => u.email).length}
        serviceUsersCount={serviceUsersCount}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              {activeTab === 'users' && (
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              )}
              {activeTab === 'comments' && (
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              )}
              {activeTab === 'courses' && (
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              )}
              {activeTab === 'broadcast' && (
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              )}
            </svg>
            {activeTab === 'users' ? t.manageUsersTitle : 
             activeTab === 'comments' ? t.userComments : 
             activeTab === 'courses' ? t.courseManagement :
             activeTab === 'broadcast' ? t.emailBroadcastTitle :
             'Service Users'}
          </h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'users' && (
              <button
                onClick={exportToExcel}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                </svg>
                {t.export}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.refresh}
            </button>
            
            <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              {t.total}: <span className="font-bold text-orange-600">
                {activeTab === 'users' ? users.length : 
                 activeTab === 'comments' ? comments.length : 
                 activeTab === 'courses' ? courses.length :
                 activeTab === 'broadcast' ? users.filter(u => u.email).length + serviceUsersCount :
                 serviceUsersCount}
              </span>
            </span>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {activeTab === 'users' ? (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[10px] font-medium text-gray-700 mb-0.5">{t.search}</label>
                  <div className="relative">
                    <svg className="w-3 h-3 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div className="min-w-[170px]">
                  <label className="block text-[10px] font-medium text-gray-700 mb-0.5">{t.filterByCourse}</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="">{t.allCourses}</option>
                    {allCourseNames.map((course, index) => (
                      <option key={index} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                {(searchTerm || selectedCourse) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCourse('');
                      }}
                      className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs"
                    >
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t.clear}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.id}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.firstName}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.lastName}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.email}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.phone}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.address}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.gender}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.course}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.experience}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.date}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.time}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-3 py-6 text-center text-gray-500 text-xs">
                          <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          {searchTerm || selectedCourse ? t.noUsersMatch : t.noUsersRegistered}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => {
                        const { date, time } = formatDateTime(user.registered_at);
                        return (
                          <tr key={user.id} className="hover:bg-orange-50 transition">
                            <td className="px-3 py-2 text-gray-500 text-[10px]">{index + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800 text-[11px]">
                              {user.first_name}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px]">
                              {user.last_name}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px]">
                              {user.email || <span className="text-gray-400">{t.na}</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px]">
                              {user.phone}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px] max-w-[100px] truncate" title={user.address}>
                              {user.address}
                            </td>
                            <td className="px-3 py-2">
                              {getGenderBadge(user.gender)}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {user.course ? (
                                  user.course.split(',').map((course, idx) => (
                                    <span key={idx} className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                                      {course.trim()}
                                    </span>
                                  ))
                                ) : (
                                  <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                                    No course
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px] max-w-[80px] truncate" title={user.experience || ''}>
                              {user.experience || <span className="text-gray-400">{t.na}</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-500 text-[10px] whitespace-nowrap">
                              {date}
                            </td>
                            <td className="px-3 py-2 text-gray-500 text-[10px] whitespace-nowrap">
                              {time}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                              >
                                {deletingId === user.id ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                                <span className="hidden sm:inline">{t.delete}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[10px] text-gray-600">
                  {filteredUsers.length} of {users.length} users
                </span>
                {selectedCourse && (
                  <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    Filtered by: {selectedCourse}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : activeTab === 'comments' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="mb-3 flex justify-between items-center">
                <h3 className="text-xs font-semibold text-gray-700">
                  {t.allUserComments} ({comments.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {t.noComments}
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-800">
                              {comment.name || t.unknownUser}
                            </span>
                            {comment.email && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                {t.emailLabel}: {comment.email}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1.5">{comment.comment}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">{t.addNewCourse}</h3>
                <form onSubmit={handleAddCourse} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    name="courseName"
                    placeholder={t.courseName}
                    className="flex-1 min-w-[150px] px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="courseDescription"
                    placeholder={t.courseDescription}
                    className="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {t.addCourse}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500 text-xs">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t.noCourses}
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-800">{course.name}</h4>
                          {course.description && (
                            <p className="text-xs text-gray-600 mt-1">{course.description}</p>
                          )}
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {t.added}: {new Date(course.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'broadcast' ? (
          <EmailBroadcast
            users={users}
            serviceUsers={serviceUsers}
            courses={uniqueCourses}
            onSuccess={setSuccessMessage}
            onError={setError}
            language={language}
          />
        ) : (
          // Service Users Tab Content
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-teal-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Service Users Management</h3>
              <p className="text-sm text-gray-500 mb-4">
                Click the Service Users link in the sidebar to view and manage service users.
              </p>
              <Link
                href="/admin/service-users"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Go to Service Users
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}