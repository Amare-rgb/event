'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  course: string;
  organization: string; // Added organization field
  experience: string;
  status: 'active' | 'inactive' | 'pending';
  registered_at: string;
  profile_image?: string;
  user_type?: 'service';
}

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

interface ApiResponse {
  users?: ServiceUser[];
  message?: string;
  total?: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  deletedId?: number;
  error?: string;
}

// Translations
const translations = {
  en: {
    title: 'Service User Management',
    addService: 'Add Service',
    addCategory: 'Add Category',
    search: 'Search',
    searchPlaceholder: 'Search by name, email, phone...',
    filterByCategory: 'Filter by Category',
    allCategories: 'All Categories',
    filterByService: 'Filter by Service',
    allServices: 'All Services',
    clear: 'Clear',
    id: 'ID',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    service: 'Service',
    category: 'Category',
    organization: 'Organization',
    status: 'Status',
    date: 'Date',
    action: 'Action',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    noServiceUsers: 'No service users found',
    noServiceUsersMatch: 'No service users match your filters',
    total: 'Total',
    refresh: 'Refresh',
    export: 'Export',
    userDeleted: 'Service user deleted successfully!',
    confirmDelete: 'Are you sure you want to delete this service user?',
    confirmDeleteCategory: 'Are you sure you want to delete this category? All services in this category will also be deleted.',
    confirmDeleteService: 'Are you sure you want to delete this service?',
    deleteSuccess: 'Service user deleted successfully!',
    deleteError: 'Failed to delete service user',
    statusUpdated: 'Status updated successfully!',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferNotToSay: 'Prefer not to say',
    na: 'N/A',
    registered: 'Registered',
    lastActive: 'Last Active',
    details: 'Details',
    close: 'Close',
    loadError: 'Failed to load service users',
    exportSuccess: 'Export successful!',
    noDataToExport: 'No data to export',
    // Add Service Modal
    addServiceTitle: 'Add New Service',
    editServiceTitle: 'Edit Service',
    serviceName: 'Service Name',
    serviceNamePlaceholder: 'Enter service name',
    serviceDescription: 'Service Description',
    serviceDescriptionPlaceholder: 'Enter service description',
    serviceCategory: 'Service Category',
    selectCategory: 'Select Category',
    addServiceSuccess: 'Service added successfully!',
    updateServiceSuccess: 'Service updated successfully!',
    addServiceError: 'Failed to add service',
    updateServiceError: 'Failed to update service',
    serviceNameRequired: 'Service name is required',
    categoryRequired: 'Please select a category',
    cancel: 'Cancel',
    add: 'Add Service',
    update: 'Update Service',
    adding: 'Adding...',
    updating: 'Updating...',
    // Add Category Modal
    addCategoryTitle: 'Add New Category',
    categoryName: 'Category Name',
    categoryNamePlaceholder: 'Enter category name',
    addCategorySuccess: 'Category added successfully!',
    addCategoryError: 'Failed to add category',
    categoryNameRequired: 'Category name is required',
    categoryAlreadyExists: 'Category already exists',
    categoryDeleted: 'Category deleted successfully!',
    categoryDeleteError: 'Failed to delete category',
    serviceDeleted: 'Service deleted successfully!',
    serviceDeleteError: 'Failed to delete service',
    deleteCategory: 'Delete Category',
    deleteService: 'Delete Service',
  },
  am: {
    title: 'የአገልግሎት ተጠቃሚ አስተዳደር',
    addService: 'አገልግሎት ያክሉ',
    addCategory: 'ምድብ ያክሉ',
    search: 'ፈልግ',
    searchPlaceholder: 'በስም፣ ኢሜይል ወይም ስልክ ፈልግ...',
    filterByCategory: 'በምድብ አጣራ',
    allCategories: 'ሁሉም ምድቦች',
    filterByService: 'በአገልግሎት አጣራ',
    allServices: 'ሁሉም አገልግሎቶች',
    clear: 'አጽዳ',
    id: 'መለያ',
    name: 'ስም',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    service: 'አገልግሎት',
    category: 'ምድብ',
    organization: 'ድርጅት',
    status: 'ሁኔታ',
    date: 'ቀን',
    action: 'ድርጊት',
    delete: 'ሰርዝ',
    edit: 'አስተካክል',
    view: 'አይት',
    active: 'ንቁ',
    inactive: 'የማይንቀሳቀስ',
    pending: 'በመጠባበቅ ላይ',
    noServiceUsers: 'ምንም የአገልግሎት ተጠቃሚዎች አልተገኙም',
    noServiceUsersMatch: 'ከማጣሪያዎ ጋር የሚዛመዱ የአገልግሎት ተጠቃሚዎች የሉም',
    total: 'ጠቅላላ',
    refresh: 'አድስ',
    export: 'ወጭ',
    userDeleted: 'የአገልግሎት ተጠቃሚ በተሳካ ሁኔታ ተሰርዟል!',
    confirmDelete: 'ይህንን የአገልግሎት ተጠቃሚ መሰረዝ እርግጠኛ ነዎት?',
    confirmDeleteCategory: 'ይህንን ምድብ መሰረዝ እርግጠኛ ነዎት? በዚህ ምድብ ውስጥ ያሉ ሁሉም አገልግሎቶች ይሰረዛሉ።',
    confirmDeleteService: 'ይህንን አገልግሎት መሰረዝ እርግጠኛ ነዎት?',
    deleteSuccess: 'የአገልግሎት ተጠቃሚ በተሳካ ሁኔታ ተሰርዟል!',
    deleteError: 'የአገልግሎት ተጠቃሚ መሰረዝ አልተቻለም',
    statusUpdated: 'ሁኔታ በተሳካ ሁኔታ ተሻሽሏል!',
    male: 'ወንድ',
    female: 'ሴት',
    other: 'ሌላ',
    preferNotToSay: 'ለመናገር አይመርጡም',
    na: 'የለም',
    registered: 'ተመዝግቧል',
    lastActive: 'የመጨረሻ እንቅስቃሴ',
    details: 'ዝርዝሮች',
    close: 'ዝጋ',
    loadError: 'የአገልግሎት ተጠቃሚዎችን ማግኘት አልተቻለም',
    exportSuccess: 'ወጭ በተሳካ ሁኔታ ተጠናቋል!',
    noDataToExport: 'ለመውጣት ምንም ውሂብ የለም',
    // Add Service Modal
    addServiceTitle: 'አዲስ አገልግሎት ያክሉ',
    editServiceTitle: 'አገልግሎት አስተካክል',
    serviceName: 'የአገልግሎት ስም',
    serviceNamePlaceholder: 'የአገልግሎት ስም ያስገቡ',
    serviceDescription: 'የአገልግሎት መግለጫ',
    serviceDescriptionPlaceholder: 'የአገልግሎት መግለጫ ያስገቡ',
    serviceCategory: 'የአገልግሎት ምድብ',
    selectCategory: 'ምድብ ይምረጡ',
    addServiceSuccess: 'አገልግሎት በተሳካ ሁኔታ ተጨምሯል!',
    updateServiceSuccess: 'አገልግሎት በተሳካ ሁኔታ ተሻሽሏል!',
    addServiceError: 'አገልግሎት መጨመር አልተቻለም',
    updateServiceError: 'አገልግሎት ማሻሻል አልተቻለም',
    serviceNameRequired: 'የአገልግሎት ስም ያስፈልጋል',
    categoryRequired: 'እባክዎ ምድብ ይምረጡ',
    cancel: 'ይቅር',
    add: 'አገልግሎት ያክሉ',
    update: 'አገልግሎት ያሻሽሉ',
    adding: 'በመጨመር ላይ...',
    updating: 'በማሻሻል ላይ...',
    // Add Category Modal
    addCategoryTitle: 'አዲስ ምድብ ያክሉ',
    categoryName: 'የምድብ ስም',
    categoryNamePlaceholder: 'የምድብ ስም ያስገቡ',
    addCategorySuccess: 'ምድብ በተሳካ ሁኔታ ተጨምሯል!',
    addCategoryError: 'ምድብ መጨመር አልተቻለም',
    categoryNameRequired: 'የምድብ ስም ያስፈልጋል',
    categoryAlreadyExists: 'ምድብ ቀድሞ አለ',
    categoryDeleted: 'ምድብ በተሳካ ሁኔታ ተሰርዟል!',
    categoryDeleteError: 'ምድብ መሰረዝ አልተቻለም',
    serviceDeleted: 'አገልግሎት በተሳካ ሁኔታ ተሰርዟል!',
    serviceDeleteError: 'አገልግሎት መሰረዝ አልተቻለም',
    deleteCategory: 'ምድብ ሰርዝ',
    deleteService: 'አገልግሎት ሰርዝ',
  }
};

export default function ServiceUsersPage() {
  const router = useRouter();
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<ServiceUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const isMounted = useRef(true);
  const fetchCalled = useRef(false);

  // Add Service Modal State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [addingService, setAddingService] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // Add Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  // Fetch service users from backend
  const fetchServiceUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/service-users');
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.users && Array.isArray(data.users)) {
          setServiceUsers(data.users);
        } else {
          setServiceUsers([]);
        }
      } else {
        setError(t.loadError);
        setServiceUsers([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(t.loadError);
      setServiceUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  // Fetch services for filter
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        // Extract unique categories - FIXED: Type assertion to string[]
        const uniqueCategories = Array.from(
          new Set(data.services.map((s: Service) => s.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }, []);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchServiceUsers();
      fetchServices();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchServiceUsers, fetchServices]);

  const handleRefresh = () => {
    fetchServiceUsers();
    fetchServices();
  };

  // Handle Delete Service User - FIXED with proper error handling
  const handleDelete = async (userId: number) => {
    console.log('🔍 Delete button clicked for userId:', userId);
    
    if (!userId) {
      console.error('❌ userId is undefined or null');
      setError('Invalid user ID');
      return;
    }

    if (!confirm(t.confirmDelete)) {
      return;
    }

    setDeletingId(userId);
    setError('');
    setSuccessMessage('');

    try {
      // ✅ FIXED: Use path parameter with the ID in the URL
      const url = `/api/admin/service-users/${userId}`;
      console.log('🔍 Making DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('🔍 Response text:', responseText);

      let data: DeleteResponse = { success: false, message: '' };
      
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText) as DeleteResponse;
        } catch (parseError) {
          console.warn('Response is not valid JSON:', responseText);
          if (response.ok) {
            setServiceUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setSuccessMessage(t.deleteSuccess);
            setTimeout(() => setSuccessMessage(''), 3000);
            setDeletingId(null);
            return;
          }
        }
      }

      if (response.ok) {
        setServiceUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setSuccessMessage(data.message || t.deleteSuccess);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || t.deleteError || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError(t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Delete Service
  const handleDeleteService = async (serviceId: number, serviceName: string) => {
    if (!confirm(t.confirmDeleteService)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services?id=${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage(t.serviceDeleted);
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchServices();
        fetchServiceUsers();
      } else {
        const data = await response.json();
        setError(data.error || t.serviceDeleteError);
      }
    } catch (error) {
      console.error('Delete service error:', error);
      setError(t.serviceDeleteError);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (category: string) => {
    if (!confirm(t.confirmDeleteCategory)) {
      return;
    }

    try {
      // Get all services in this category
      const servicesToDelete = services.filter(s => s.category === category);
      
      // Delete each service
      for (const service of servicesToDelete) {
        await fetch(`/api/admin/services?id=${service.id}`, {
          method: 'DELETE',
        });
      }

      setSuccessMessage(t.categoryDeleted);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchServices();
      fetchServiceUsers();
    } catch (error) {
      console.error('Delete category error:', error);
      setError(t.categoryDeleteError);
    }
  };

  // Handle Add Category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError(t.categoryNameRequired);
      return;
    }

    if (categories.includes(newCategoryName.trim())) {
      setCategoryError(t.categoryAlreadyExists);
      return;
    }

    setAddingCategory(true);
    setCategoryError('');

    try {
      // Add a service to create the category
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `_temp_${Date.now()}`,
          description: '',
          category: newCategoryName.trim(),
        }),
      });

      if (response.ok) {
        setSuccessMessage(t.addCategorySuccess);
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowAddCategoryModal(false);
        setNewCategoryName('');
        fetchServices();
        fetchServiceUsers();
      } else {
        const data = await response.json();
        setCategoryError(data.error || t.addCategoryError);
      }
    } catch (error) {
      console.error('Add category error:', error);
      setCategoryError(t.addCategoryError);
    } finally {
      setAddingCategory(false);
    }
  };

  // Handle Add Service
  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      setServiceError(t.serviceNameRequired);
      return;
    }

    if (!newServiceCategory) {
      setServiceError(t.categoryRequired);
      return;
    }

    setAddingService(true);
    setServiceError('');

    try {
      const url = isEditingService ? `/api/admin/services?id=${editingServiceId}` : '/api/admin/services';
      const method = isEditingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newServiceName.trim(),
          description: newServiceDescription.trim(),
          category: newServiceCategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(isEditingService ? t.updateServiceSuccess : t.addServiceSuccess);
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowAddServiceModal(false);
        resetServiceForm();
        fetchServices();
        fetchServiceUsers();
      } else {
        setServiceError(data.error || (isEditingService ? t.updateServiceError : t.addServiceError));
      }
    } catch (error) {
      console.error('Service operation error:', error);
      setServiceError(isEditingService ? t.updateServiceError : t.addServiceError);
    } finally {
      setAddingService(false);
    }
  };

  // Handle Edit Service
  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setNewServiceName(service.name);
    setNewServiceDescription(service.description || '');
    setNewServiceCategory(service.category);
    setIsEditingService(true);
    setServiceError('');
    setShowAddServiceModal(true);
  };

  const resetServiceForm = () => {
    setNewServiceName('');
    setNewServiceDescription('');
    setNewServiceCategory('');
    setIsEditingService(false);
    setEditingServiceId(null);
    setServiceError('');
  };

  const handleStatusChange = async (userId: number, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      const response = await fetch(`/api/admin/service-users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setServiceUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        setSuccessMessage(t.statusUpdated);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update status');
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: t.na, time: t.na };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString(language === 'en' ? 'en-US' : 'am-ET', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return { date: t.na, time: t.na };
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    
    const labels: Record<string, string> = {
      active: t.active,
      inactive: t.inactive,
      pending: t.pending
    };

    const statusKey = status?.toLowerCase() || 'pending';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statusKey] || styles.pending}`}>
        {labels[statusKey] || status || t.pending}
      </span>
    );
  };

  const getGenderBadge = (gender: string) => {
    if (!gender) return <span className="text-gray-400 text-xs">{t.na}</span>;
    
    const genderMap: Record<string, string> = {
      'male': t.male,
      'female': t.female,
      'other': t.other,
      'prefer-not-to-say': t.preferNotToSay
    };
    
    const colors: Record<string, string> = {
      'male': 'bg-blue-100 text-blue-700',
      'female': 'bg-pink-100 text-pink-700',
      'other': 'bg-purple-100 text-purple-700',
      'prefer-not-to-say': 'bg-gray-100 text-gray-700'
    };
    
    const displayGender = genderMap[gender.toLowerCase()] || gender;
    const colorClass = colors[gender.toLowerCase()] || 'bg-gray-100 text-gray-700';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
        {displayGender}
      </span>
    );
  };

  // Get filtered services based on selected category
  const filteredServices = selectedCategory 
    ? services.filter(s => s.category === selectedCategory)
    : services;

  // Filter service users
  const filteredUsers = serviceUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      user.phone?.includes(searchTerm) ||
      user.address?.toLowerCase().includes(searchLower) ||
      (user.organization && user.organization.toLowerCase().includes(searchLower));
    
    const userServices = (user.course || '').toLowerCase();
    const matchesService = selectedService ? 
      userServices.includes(selectedService.toLowerCase()) : true;
    
    return matchesSearch && matchesService;
  });

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      alert(t.noDataToExport);
      return;
    }

    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Address',
      'Gender', 'Service', 'Organization', 'Experience', 'Status', 'Date'
    ];

    const rows = filteredUsers.map(user => {
      const { date } = formatDateTime(user.registered_at);
      return [
        user.id,
        user.first_name || '', 
        user.last_name || '', 
        user.email || 'N/A',
        user.phone || '', 
        user.address || '', 
        user.gender || 'N/A',
        user.course || 'N/A',
        user.organization || 'N/A', 
        user.experience || 'N/A', 
        user.status || 'pending', 
        date
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
    link.setAttribute('download', `service_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccessMessage(t.exportSuccess);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <h1 className="text-lg font-bold text-gray-800">{t.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {t.addCategory}
              </button>

              <button
                onClick={() => {
                  resetServiceForm();
                  setShowAddServiceModal(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {t.addService}
              </button>

              <button
                onClick={handleRefresh}
                className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.refresh}
              </button>
              
              <button
                onClick={exportToCSV}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                </svg>
                {t.export}
              </button>
              <button
                onClick={toggleLanguage}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition"
              >
                {language === 'en' ? 'አማ' : 'EN'}
              </button>

              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                {t.total}: <span className="font-bold text-teal-600">{filteredUsers.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm animate-fade-in">
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

        {/* Search and Filters with Category and Service Dropdowns */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t.search}</label>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t.filterByCategory}</label>
              <div className="flex gap-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedService('');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="">{t.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <button
                    onClick={() => handleDeleteCategory(selectedCategory)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-xs transition flex items-center gap-1"
                    title={t.deleteCategory}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t.filterByService}</label>
              <div className="flex gap-1">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  disabled={!selectedCategory}
                >
                  <option value="">{t.allServices}</option>
                  {filteredServices.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <button
                    onClick={() => {
                      const service = services.find(s => s.name === selectedService);
                      if (service) handleDeleteService(service.id, service.name);
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-xs transition flex items-center gap-1"
                    title={t.deleteService}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {(searchTerm || selectedCategory || selectedService) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedService('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.clear}
              </button>
            </div>
          )}
        </div>

        {/* Service Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || selectedCategory || selectedService ? t.noServiceUsersMatch : t.noServiceUsers}
            </h3>
            <p className="text-sm text-gray-400">
              {searchTerm || selectedCategory || selectedService ? 'Try adjusting your filters' : 'Add your first service user by clicking the "Add New" button'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => {
                    const { date } = formatDateTime(user.registered_at);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {user.profile_image ? (
                                <Image
                                  src={user.profile_image}
                                  alt={user.first_name}
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                `${(user.first_name || 'U').charAt(0)}${(user.last_name || '').charAt(0) || ''}`
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {user.first_name || 'Unknown'} {user.last_name || ''}
                              </div>
                              <div className="text-xs text-gray-400">{user.gender || t.na}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">
                          {user.email || t.na}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.phone || t.na}</td>
                        <td className="px-4 py-3">
                          {user.course ? (
                            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs">
                              {user.course}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">{t.na}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.organization ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                              {user.organization}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">{t.na}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(user.status || 'pending')}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailsModal(true);
                              }}
                              className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-50 transition"
                              title={t.view}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t.delete}
                            >
                              {deletingId === user.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results count */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredUsers.length} of {serviceUsers.length} service users
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{t.details}</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedUser.profile_image ? (
                    <Image
                      src={selectedUser.profile_image}
                      alt={selectedUser.first_name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    `${(selectedUser.first_name || 'U').charAt(0)}${(selectedUser.last_name || '').charAt(0) || ''}`
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {selectedUser.first_name || 'Unknown'} {selectedUser.last_name || ''}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedUser.status || 'pending')}
                    {getGenderBadge(selectedUser.gender || '')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-800">{selectedUser.email || t.na}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-800">{selectedUser.phone || t.na}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-800">{selectedUser.address || t.na}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Service</label>
                  <p className="text-sm text-gray-800">{selectedUser.course || t.na}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Organization</label>
                  <p className="text-sm text-gray-800 font-medium text-blue-700">
                    {selectedUser.organization || t.na}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500">Experience</label>
                  <p className="text-sm text-gray-800">{selectedUser.experience || t.na}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Registered</label>
                  <p className="text-sm text-gray-800">{formatDateTime(selectedUser.registered_at).date}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status || 'pending')}</div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{t.addCategoryTitle}</h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setCategoryError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {categoryError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  {categoryError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.categoryName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (categoryError) setCategoryError('');
                  }}
                  placeholder={t.categoryNamePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setCategoryError('');
                }}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddCategory}
                disabled={addingCategory}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingCategory ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.adding}
                  </>
                ) : (
                  t.addCategory
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {isEditingService ? t.editServiceTitle : t.addServiceTitle}
              </h3>
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  resetServiceForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {serviceError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  {serviceError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.serviceCategory} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => {
                    setNewServiceCategory(e.target.value);
                    if (serviceError) setServiceError('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.serviceName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => {
                    setNewServiceName(e.target.value);
                    if (serviceError) setServiceError('');
                  }}
                  placeholder={t.serviceNamePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.serviceDescription}
                </label>
                <textarea
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder={t.serviceDescriptionPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  resetServiceForm();
                }}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddService}
                disabled={addingService}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingService ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditingService ? t.updating : t.adding}
                  </>
                ) : (
                  isEditingService ? t.update : t.add
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}