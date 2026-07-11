'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourseNames, setAllCourseNames] = useState<string[]>([]); // For filter dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'courses'>('users');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        setError('');
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

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments');
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
        setCourses(data.courses || []);
        // Extract course names for the filter dropdown
        const courseNames = data.courses.map((course: Course) => course.name);
        setAllCourseNames(courseNames);
      }
    } catch (error) {
      console.error('Courses fetch error:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchComments(),
          fetchCourses()
        ]);
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
        setUsers(users.filter(user => user.id !== userId));
        setSuccessMessage('User deleted successfully!');
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
        setSuccessMessage('Comment deleted successfully!');
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
        await fetchCourses(); // This will update both courses and allCourseNames
        setSuccessMessage('Course added successfully!');
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
        await fetchCourses(); // This will update both courses and allCourseNames
        setSuccessMessage('Course deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.phone?.includes(searchTerm) ||
      user.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse ? user.course === selectedCourse : true;
    
    return matchesSearch && matchesCourse;
  });

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  // Get gender badge color
  const getGenderBadge = (gender: string) => {
    if (!gender) return <span className="text-gray-400 text-[10px]">N/A</span>;
    
    const colors: {[key: string]: string} = {
      'male': 'bg-blue-100 text-blue-700',
      'female': 'bg-pink-100 text-pink-700',
      'other': 'bg-purple-100 text-purple-700',
      'prefer-not-to-say': 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap ${colors[gender.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
        {gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ')}
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
      <div className="w-56 min-h-screen p-3 bg-white border-r border-gray-200 shadow-sm flex-shrink-0 overflow-y-auto">
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
                <span className="text-[10px] text-gray-500">Admin Panel</span>
              </div>
            </div>
          </Link>
        </div>
        
        <nav className="space-y-0.5">
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
            <span className="font-medium">Manage Users</span>
            <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {users.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
              activeTab === 'comments'
                ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Comments</span>
            <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-xs transition ${
              activeTab === 'courses'
                ? 'bg-orange-50 border-l-3 border-orange-500 text-orange-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="font-medium">Courses</span>
            <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {courses.length}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition w-full text-xs mt-4 border-t border-gray-200 pt-4"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1H3v9a1 1 0 01-1-1V3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg className={`w-5 h-5 text-orange-600 ${
              activeTab === 'users' ? '' : 
              activeTab === 'comments' ? '' : 
              ''
            }`} fill="currentColor" viewBox="0 0 20 20">
              {activeTab === 'users' && (
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              )}
              {activeTab === 'comments' && (
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              )}
              {activeTab === 'courses' && (
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              )}
            </svg>
            {activeTab === 'users' ? 'Manage Users' : 
             activeTab === 'comments' ? 'User Comments' : 
             'Course Management'}
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
                Export
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              Total: <span className="font-bold text-orange-600">
                {activeTab === 'users' ? users.length : 
                 activeTab === 'comments' ? comments.length : 
                 courses.length}
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
                  <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Search</label>
                  <div className="relative">
                    <svg className="w-3 h-3 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div className="min-w-[170px]">
                  <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Filter by Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="">All Courses</option>
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
                      Clear
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
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">#</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">First</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Last</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Address</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Gender</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Course</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Experience</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Time</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-3 py-6 text-center text-gray-500 text-xs">
                          <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          {searchTerm || selectedCourse ? 'No users match your filters' : 'No users registered yet'}
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
                              {user.email || <span className="text-gray-400">N/A</span>}
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
                              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                                {user.course}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-[11px] max-w-[80px] truncate" title={user.experience || ''}>
                              {user.experience || <span className="text-gray-400">N/A</span>}
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
                                <span className="hidden sm:inline">Delete</span>
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
              </div>
            </div>
          </>
        ) : activeTab === 'comments' ? (
          // Comments Section - View Only
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="mb-3 flex justify-between items-center">
                <h3 className="text-xs font-semibold text-gray-700">
                  All User Comments ({comments.length})
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    No comments yet
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-medium text-xs text-gray-800">
                            {comment.user_name}
                          </span>
                          <p className="text-xs text-gray-600 mt-1">{comment.comment}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
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
        ) : (
          // Courses Section
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Add Course Form */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Add New Course</h3>
                <form onSubmit={handleAddCourse} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    name="courseName"
                    placeholder="Course Name"
                    className="flex-1 min-w-[150px] px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="courseDescription"
                    placeholder="Course Description (optional)"
                    className="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Course
                  </button>
                </form>
              </div>

              {/* Courses List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500 text-xs">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    No courses added yet
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
                            Added: {new Date(course.created_at).toLocaleDateString()}
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
        )}
      </div>
    </div>
  );
}