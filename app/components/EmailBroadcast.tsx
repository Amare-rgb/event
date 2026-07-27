'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';

interface EmailBroadcastProps {
  users: Array<{
    id: number;
    email: string;
    course: string;
    first_name?: string;
    last_name?: string;
    user_type?: string;
  }>;
  serviceUsers?: Array<{
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    course?: string;
  }>;
  courses: string[];
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  language?: 'en' | 'am';
  onUsersUpdated?: () => void;
}

// Define imported user type
interface ImportedUser {
  email: string;
  first_name?: string;
  last_name?: string;
  course?: string;
}

// Translations
const translations = {
  en: {
    // Header
    emailBroadcast: 'Email Broadcast',
    sendEmails: 'Send emails with optional attachments',
    recipients: 'recipients',
    // Send To
    sendTo: 'Send to',
    allUsers: 'All Users',
    serviceUsers: 'Service Users',
    specificUser: 'Specific User',
    specificCourse: 'Specific Course',
    selectUser: 'Select a user...',
    selectServiceUser: 'Select a service user...',
    selectCourse: 'Select a course...',
    allUsersList: 'All Users',
    allServiceUsersList: 'All Service Users',
    // Form
    subject: 'Subject *',
    message: 'Message *',
    enterSubject: 'Enter subject',
    typeMessage: 'Type your message...',
    // Files
    excelOptional: 'Import Users from Excel',
    pdfOptional: 'PDF (optional)',
    imageOptional: 'Image (optional)',
    fileLoaded: 'loaded',
    imagePreview: 'Image Preview',
    removeImage: 'Remove Image',
    addImage: 'Add Image',
    changeImage: 'Change Image',
    // Recipients
    recipientsLabel: 'Recipients',
    usersText: 'users',
    userText: 'user',
    // Buttons
    sendBroadcast: 'Send Broadcast',
    sending: 'Sending...',
    clearAll: 'Clear all',
    importUsers: 'Import Users',
    importing: 'Importing...',
    // Messages
    fillSubjectMessage: 'Please fill in subject and message',
    subjectTooLong: 'Subject must be less than 200 characters',
    messageTooLong: 'Message must be less than 10000 characters',
    selectExcel: 'Please upload a valid Excel file (.xlsx or .xls)',
    fileSizeExceed: 'File size exceeds 10MB limit',
    selectPDF: 'Please upload a valid PDF file',
    pdfSizeExceed: 'PDF file size exceeds 20MB limit',
    selectImage: 'Please upload a valid image file (JPG, PNG, GIF, SVG)',
    imageSizeExceed: 'Image size exceeds 5MB limit',
    // Sending
    sendingTo: 'Send broadcast to',
    registeredUsers: 'registered users',
    excelFileText: 'Excel file',
    pdfFileText: 'PDF attachment',
    imageFileText: 'Image attachment',
    // Import
    importSuccess: 'Users imported successfully',
    importError: 'Failed to import users',
    noValidUsers: 'No valid users found in Excel',
    usersImported: 'users imported',
    noServiceUsers: 'No service users available',
    importTo: 'Import to:',
    regularUsers: 'Regular Users',
    serviceUsersLabel: 'Service Users',
  },
  am: {
    // Header
    emailBroadcast: 'የኢሜይል ስርጭት',
    sendEmails: 'ከአማራጭ አባሪዎች ጋር ኢሜይሎችን ይላኩ',
    recipients: 'ተቀባዮች',
    // Send To
    sendTo: 'ለማን ይላኩ',
    allUsers: 'ሁሉም ተጠቃሚዎች',
    serviceUsers: 'የአገልግሎት ተጠቃሚዎች',
    specificUser: 'የተወሰነ ተጠቃሚ',
    specificCourse: 'የተወሰነ ኮርስ',
    selectUser: 'ተጠቃሚ ይምረጡ...',
    selectServiceUser: 'የአገልግሎት ተጠቃሚ ይምረጡ...',
    selectCourse: 'ኮርስ ይምረጡ...',
    allUsersList: 'ሁሉም ተጠቃሚዎች',
    allServiceUsersList: 'ሁሉም የአገልግሎት ተጠቃሚዎች',
    // Form
    subject: 'ርዕስ *',
    message: 'መልእክት *',
    enterSubject: 'ርዕስ ያስገቡ',
    typeMessage: 'መልእክትዎን ይተይቡ...',
    // Files
    excelOptional: 'ከኤክሴል ተጠቃሚዎች አስገባ',
    pdfOptional: 'ፒዲኤፍ (አማራጭ)',
    imageOptional: 'ምስል (አማራጭ)',
    fileLoaded: 'ተጭኗል',
    imagePreview: 'የምስል ቅድመ-እይታ',
    removeImage: 'ምስል አስወግድ',
    addImage: 'ምስል ያክሉ',
    changeImage: 'ምስል ይቀይሩ',
    // Recipients
    recipientsLabel: 'ተቀባዮች',
    usersText: 'ተጠቃሚዎች',
    userText: 'ተጠቃሚ',
    // Buttons
    sendBroadcast: 'ስርጭት ላክ',
    sending: 'እየተላከ ነው...',
    clearAll: 'ሁሉንም አጽዳ',
    importUsers: 'ተጠቃሚዎች አስገባ',
    importing: 'እያስገባ ነው...',
    // Messages
    fillSubjectMessage: 'እባክዎ ርዕስ እና መልእክት ይሙሉ',
    subjectTooLong: 'ርዕሱ ከ200 ፊደላት ያነሰ መሆን አለበት',
    messageTooLong: 'መልእክቱ ከ10000 ፊደላት ያነሰ መሆን አለበት',
    selectExcel: 'እባክዎ ትክክለኛ የኤክሴል ፋይል ይምረጡ (.xlsx ወይም .xls)',
    fileSizeExceed: 'የፋይሉ መጠን ከ10 ሜባ በላይ ነው',
    selectPDF: 'እባክዎ ትክክለኛ የፒዲኤፍ ፋይል ይምረጡ',
    pdfSizeExceed: 'የፒዲኤፍ ፋይል መጠን ከ20 ሜባ በላይ ነው',
    selectImage: 'እባክዎ ትክክለኛ የምስል ፋይል ይምረጡ (JPG, PNG, GIF, SVG)',
    imageSizeExceed: 'የምስል ፋይል መጠን ከ5 ሜባ በላይ ነው',
    // Sending
    sendingTo: 'ስርጭት ወደ',
    registeredUsers: 'የተመዘገቡ ተጠቃሚዎች',
    excelFileText: 'ኤክሴል ፋይል',
    pdfFileText: 'ፒዲኤፍ አባሪ',
    imageFileText: 'ምስል አባሪ',
    // Import
    importSuccess: 'ተጠቃሚዎች በተሳካ ሁኔታ አስገባ',
    importError: 'ተጠቃሚዎች ማስገባት አልተቻለም',
    noValidUsers: 'በኤክሴል ውስጥ ልክ የሆኑ ተጠቃሚዎች አልተገኙም',
    usersImported: 'ተጠቃሚዎች አስገባ',
    noServiceUsers: 'ምንም የአገልግሎት ተጠቃሚዎች የሉም',
    importTo: 'ወደ አስገባ:',
    regularUsers: 'መደበኛ ተጠቃሚዎች',
    serviceUsersLabel: 'የአገልግሎት ተጠቃሚዎች',
  }
};

// Brand Colors
const BRAND = {
  primary: '#E26A25',
  dark: '#2E3641',
  primaryLight: '#f5e6df',
};

export default function EmailBroadcast({ 
  users, 
  serviceUsers = [],
  courses, 
  onSuccess, 
  onError,
  language = 'en',
  onUsersUpdated
}: EmailBroadcastProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedServiceUser, setSelectedServiceUser] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [sendType, setSendType] = useState<'all' | 'service' | 'user' | 'course'>('all');
  const [showUserList, setShowUserList] = useState(false);
  const [showServiceUserList, setShowServiceUserList] = useState(false);
  const [excelEmailsCount, setExcelEmailsCount] = useState<number | null>(null);
  const [importedUsers, setImportedUsers] = useState<ImportedUser[]>([]);
  const [importType, setImportType] = useState<'users' | 'serviceUsers'>('users');
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Get user full name
  const getUserFullName = (user: { first_name?: string; last_name?: string; email: string }) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else {
      return user.email.split('@')[0];
    }
  };

  // Get all users with emails for dropdown
  const usersWithEmails = useMemo(() => {
    return users
      .filter(u => u.email)
      .sort((a, b) => {
        const nameA = getUserFullName(a).toLowerCase();
        const nameB = getUserFullName(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [users]);

  // Get all service users with emails for dropdown
  const serviceUsersWithEmails = useMemo(() => {
    return (serviceUsers || [])
      .filter(u => u.email)
      .sort((a, b) => {
        const nameA = getUserFullName(a).toLowerCase();
        const nameB = getUserFullName(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [serviceUsers]);

  // Get unique courses with user counts
  const coursesWithCounts = useMemo(() => {
    const courseMap = new Map<string, number>();
    users.forEach(u => {
      if (u.course && u.email) {
        courseMap.set(u.course, (courseMap.get(u.course) || 0) + 1);
      }
    });
    return Array.from(courseMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Get total recipients count
  const totalUsers = useMemo(() => {
    let count = 0;
    if (sendType === 'all') {
      count = users.filter(u => u.email).length;
    } else if (sendType === 'service') {
      count = (serviceUsers || []).filter(u => u.email).length;
    } else if (sendType === 'course' && selectedCourse) {
      count = users.filter(u => u.course === selectedCourse && u.email).length;
    } else if (sendType === 'user' && selectedUser) {
      count = 1;
    }
    return count;
  }, [sendType, selectedCourse, selectedUser, users, serviceUsers]);

  // Get total recipients including Excel
  const totalRecipients = useMemo(() => {
    let count = totalUsers;
    if (excelEmailsCount) {
      count += excelEmailsCount;
    }
    return count;
  }, [totalUsers, excelEmailsCount]);

  // Get selected user info
  const selectedUserInfo = useMemo(() => {
    return users.find(u => u.email === selectedUser);
  }, [selectedUser, users]);

  // Get selected service user info
  const selectedServiceUserInfo = useMemo(() => {
    return (serviceUsers || []).find(u => u.email === selectedServiceUser);
  }, [selectedServiceUser, serviceUsers]);

  // Get users for selected course
  const courseUsers = useMemo(() => {
    if (selectedCourse) {
      return users.filter(u => u.course === selectedCourse && u.email);
    }
    return [];
  }, [selectedCourse, users]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        onError?.(t.selectImage);
        e.target.value = '';
        return;
      }
      
      // Validate image size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError?.(t.imageSizeExceed);
        e.target.value = '';
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onError?.('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'excel' | 'pdf') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'excel') {
        const validTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
        
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
          onError?.(t.selectExcel);
          e.target.value = '';
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          onError?.(t.fileSizeExceed);
          e.target.value = '';
          return;
        }
        
        setExcelFile(file);
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/admin/excel-preview', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (data.success) {
            setExcelEmailsCount(data.emailCount);
            if (data.users) {
              setImportedUsers(data.users as ImportedUser[]);
            }
            onSuccess?.(`Excel file loaded: ${data.emailCount} email(s) found`);
            setTimeout(() => onSuccess?.(''), 3000);
          }
        } catch (error) {
          console.error('Error previewing Excel:', error);
        }
        
      } else if (type === 'pdf') {
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
          onError?.(t.selectPDF);
          e.target.value = '';
          return;
        }
        
        if (file.size > 20 * 1024 * 1024) {
          onError?.(t.pdfSizeExceed);
          e.target.value = '';
          return;
        }
        
        setPdfFile(file);
      }
      onError?.('');
    }
  };

  const handleImportUsers = async () => {
    if (!excelFile) {
      onError?.(t.selectExcel);
      return;
    }

    setIsImporting(true);
    onError?.('');

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('importType', importType);

      const response = await fetch('/api/admin/import-users', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const importTypeLabel = importType === 'serviceUsers' ? 'Service Users' : 'Users';
        onSuccess?.(`✅ ${data.message} (${data.imported} ${importTypeLabel} imported)`);
        setExcelFile(null);
        setExcelEmailsCount(null);
        setImportedUsers([]);
        const excelInput = document.getElementById('excelFile') as HTMLInputElement;
        if (excelInput) excelInput.value = '';
        if (onUsersUpdated) {
          onUsersUpdated();
        }
        setTimeout(() => onSuccess?.(''), 5000);
      } else {
        onError?.(data.error || t.importError);
      }
    } catch (error) {
      console.error('Import error:', error);
      onError?.(t.importError);
    } finally {
      setIsImporting(false);
    }
  };

  const removeFile = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      setExcelFile(null);
      setExcelEmailsCount(null);
      setImportedUsers([]);
      const fileInput = document.getElementById('excelFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      setPdfFile(null);
      const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      onError?.(t.fillSubjectMessage);
      return;
    }

    if (subject.length > 200) {
      onError?.(t.subjectTooLong);
      return;
    }

    if (message.length > 10000) {
      onError?.(t.messageTooLong);
      return;
    }

    let recipientDisplay = '';
    let recipientCount = totalRecipients;

    if (sendType === 'all') {
      recipientDisplay = `${t.sendingTo} ${totalUsers} ${t.registeredUsers}`;
    } else if (sendType === 'service') {
      if (selectedServiceUser) {
        const user = serviceUsers.find(u => u.email === selectedServiceUser);
        recipientDisplay = user ? getUserFullName(user) : selectedServiceUser;
        recipientCount = 1;
      } else {
        recipientDisplay = `${t.sendingTo} ${totalUsers} ${t.serviceUsers}`;
      }
    } else if (sendType === 'course' && selectedCourse) {
      recipientDisplay = `${t.sendingTo} ${totalUsers} ${t.usersText} in "${selectedCourse}" course`;
    } else if (sendType === 'user' && selectedUser) {
      const user = users.find(u => u.email === selectedUser);
      recipientDisplay = user ? getUserFullName(user) : selectedUser;
      recipientCount = 1;
    }

    if (excelFile && excelEmailsCount) {
      recipientDisplay += ` + ${excelEmailsCount} from Excel`;
    }

    let confirmMessage = `${t.sendingTo} ${recipientDisplay} (${recipientCount} ${recipientCount > 1 ? t.usersText : t.userText})?\n\n${t.subject}: ${subject}\n\n`;
    
    if (excelFile) {
      confirmMessage += `📊 ${t.excelFileText}: ${excelFile.name} (${excelEmailsCount || '?'} emails)\n`;
    }
    if (pdfFile) {
      confirmMessage += `📄 ${t.pdfFileText}: ${pdfFile.name}\n`;
    }
    if (imageFile) {
      confirmMessage += `🖼️ ${t.imageFileText}: ${imageFile.name}\n`;
    }
    confirmMessage += `Continue?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsSending(true);
    onError?.('');
    onSuccess?.('');

    try {
      const formData = new FormData();
      formData.append('subject', subject.trim());
      formData.append('message', message.trim());
      formData.append('sendType', sendType);
      
      // Handle different send types properly
      if (sendType === 'user' && selectedUser) {
        formData.append('userFilter', selectedUser);
        formData.append('userType', 'regular');
      } else if (sendType === 'service' && selectedServiceUser) {
        formData.append('userFilter', selectedServiceUser);
        formData.append('userType', 'service');
      } else if (sendType === 'service') {
        formData.append('userType', 'service');
      } else if (sendType === 'course' && selectedCourse) {
        formData.append('courseFilter', selectedCourse);
      } else {
        formData.append('courseFilter', 'all');
      }
      
      if (excelFile) {
        formData.append('excelFile', excelFile);
      }
      
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }

      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        let successMsg = `✅ ${data.message}`;
        if (data.details) {
          const details = data.details;
          const detailParts: string[] = [];
          if (details.fromDatabase) detailParts.push(`${details.fromDatabase} from DB`);
          if (details.fromExcel) detailParts.push(`${details.fromExcel} from Excel`);
          if (details.duplicatesRemoved) detailParts.push(`${details.duplicatesRemoved} duplicates removed`);
          if (detailParts.length > 0) {
            successMsg += ` (${detailParts.join(', ')})`;
          }
        }
        onSuccess?.(successMsg);
        
        // Reset form
        setSubject('');
        setMessage('');
        setSelectedUser('');
        setSelectedServiceUser('');
        setSelectedCourse('');
        setSendType('all');
        setShowUserList(false);
        setShowServiceUserList(false);
        setExcelFile(null);
        setExcelEmailsCount(null);
        setImportedUsers([]);
        setPdfFile(null);
        setImageFile(null);
        setImagePreview(null);
        const excelInput = document.getElementById('excelFile') as HTMLInputElement;
        const pdfInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (excelInput) excelInput.value = '';
        if (pdfInput) pdfInput.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
        
        setTimeout(() => onSuccess?.(''), 5000);
      } else {
        onError?.(data.error || 'Failed to send broadcast emails');
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      onError?.('Network error - Please try again');
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setSubject('');
    setMessage('');
    setSelectedUser('');
    setSelectedServiceUser('');
    setSelectedCourse('');
    setSendType('all');
    setShowUserList(false);
    setShowServiceUserList(false);
    setExcelFile(null);
    setExcelEmailsCount(null);
    setImportedUsers([]);
    setPdfFile(null);
    setImageFile(null);
    setImagePreview(null);
    const excelInput = document.getElementById('excelFile') as HTMLInputElement;
    const pdfInput = document.getElementById('pdfFile') as HTMLInputElement;
    if (excelInput) excelInput.value = '';
    if (pdfInput) pdfInput.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
    onError?.('');
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = BRAND.primary;
    e.target.style.outline = `2px solid ${BRAND.primary}30`;
    e.target.style.outlineOffset = '1px';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.outline = 'none';
    e.target.style.outlineOffset = '0';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Header with DreamMore Branding */}
        <div 
          className="flex items-center gap-3 mb-4 p-3 rounded-lg border"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND.primaryLight} 0%, #ffffff 100%)`,
            borderColor: BRAND.primary
          }}
        >
          <div 
            className="w-10 h-10 rounded-lg overflow-hidden shadow-sm flex-shrink-0 border"
            style={{ borderColor: BRAND.primary }}
          >
            <Image 
              src="/logo.jpg" 
              alt="DreamMore Logo" 
              width={40} 
              height={40}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://i.postimg.cc/T3PJW11C/photo.jpg';
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 
                className="text-sm font-bold"
                style={{ color: BRAND.dark }}
              >
                {t.emailBroadcast}
              </h3>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ 
                  color: BRAND.primary,
                  backgroundColor: BRAND.primaryLight
                }}
              >
                {users.filter(u => u.email).length + (serviceUsers || []).filter(u => u.email).length}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">{t.sendEmails}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Send Type Selection */}
          <div>
            <label 
              className="block text-[10px] font-medium mb-1"
              style={{ color: BRAND.dark }}
            >
              {t.sendTo}
            </label>
            <div className="flex gap-1 mb-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSendType('all');
                  setShowUserList(!showUserList);
                  setShowServiceUserList(false);
                  setSelectedCourse('');
                  setSelectedUser('');
                  setSelectedServiceUser('');
                }}
                className={`px-3 py-1 text-[10px] rounded-lg transition ${
                  sendType === 'all'
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={sendType === 'all' ? { backgroundColor: BRAND.primary } : {}}
              >
                {t.allUsers} ({users.filter(u => u.email).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSendType('service');
                  setShowServiceUserList(!showServiceUserList);
                  setShowUserList(false);
                  setSelectedCourse('');
                  setSelectedUser('');
                  setSelectedServiceUser('');
                }}
                className={`px-3 py-1 text-[10px] rounded-lg transition ${
                  sendType === 'service'
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={sendType === 'service' ? { backgroundColor: BRAND.primary } : {}}
              >
                {t.serviceUsers} ({(serviceUsers || []).filter(u => u.email).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSendType('course');
                  setShowUserList(false);
                  setShowServiceUserList(false);
                  setSelectedUser('');
                  setSelectedServiceUser('');
                }}
                className={`px-3 py-1 text-[10px] rounded-lg transition ${
                  sendType === 'course'
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={sendType === 'course' ? { backgroundColor: BRAND.primary } : {}}
              >
                {t.specificCourse}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSendType('user');
                  setShowUserList(true);
                  setShowServiceUserList(false);
                  setSelectedCourse('');
                  setSelectedServiceUser('');
                }}
                className={`px-3 py-1 text-[10px] rounded-lg transition ${
                  sendType === 'user'
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={sendType === 'user' ? { backgroundColor: BRAND.primary } : {}}
              >
                {t.specificUser}
              </button>
            </div>

            {/* Course Selection */}
            {sendType === 'course' && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                style={{ 
                  borderColor: selectedCourse ? BRAND.primary : '#d1d5db'
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => {
                  e.target.style.borderColor = selectedCourse ? BRAND.primary : '#d1d5db';
                  e.target.style.outline = 'none';
                  e.target.style.outlineOffset = '0';
                }}
              >
                <option value="">{t.selectCourse}</option>
                {coursesWithCounts.map((course) => (
                  <option key={course.name} value={course.name}>
                    {course.name} ({course.count} {t.usersText})
                  </option>
                ))}
              </select>
            )}

            {/* Course Users List */}
            {sendType === 'course' && selectedCourse && courseUsers.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-[120px] overflow-y-auto bg-white mt-1">
                <div className="p-2">
                  <p className="text-[10px] font-medium text-gray-500 mb-1">
                    {courseUsers.length} {t.usersText} in {selectedCourse}:
                  </p>
                  {courseUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 py-1 px-2 hover:bg-orange-50 rounded text-[10px] text-gray-600 border-b border-gray-50">
                      <span>👤</span>
                      <span className="font-medium">{getUserFullName(user)}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-gray-500">{user.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection - Shows User Names */}
            {sendType === 'user' && (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                style={{ 
                  borderColor: selectedUser ? BRAND.primary : '#d1d5db'
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => {
                  e.target.style.borderColor = selectedUser ? BRAND.primary : '#d1d5db';
                  e.target.style.outline = 'none';
                  e.target.style.outlineOffset = '0';
                }}
              >
                <option value="">{t.selectUser}</option>
                {usersWithEmails.map((user) => (
                  <option key={user.id} value={user.email}>
                    {getUserFullName(user)} - {user.email}
                  </option>
                ))}
              </select>
            )}

            {/* Service User Selection */}
            {sendType === 'service' && (
              <>
                <select
                  value={selectedServiceUser}
                  onChange={(e) => {
                    setSelectedServiceUser(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                  style={{ 
                    borderColor: selectedServiceUser ? BRAND.primary : '#d1d5db'
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => {
                    e.target.style.borderColor = selectedServiceUser ? BRAND.primary : '#d1d5db';
                    e.target.style.outline = 'none';
                    e.target.style.outlineOffset = '0';
                  }}
                  disabled={(serviceUsers || []).length === 0}
                >
                  <option value="">{t.selectServiceUser}</option>
                  {serviceUsersWithEmails.map((user) => (
                    <option key={user.id} value={user.email}>
                      {getUserFullName(user)} - {user.email}
                    </option>
                  ))}
                </select>
                {(serviceUsers || []).length === 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">⚠️ {t.noServiceUsers}</p>
                )}
              </>
            )}

            {/* Show User List when All Users is selected */}
            {sendType === 'all' && showUserList && (
              <div className="border border-gray-200 rounded-lg max-h-[150px] overflow-y-auto bg-white">
                <div className="p-2">
                  <p className="text-[10px] font-medium text-gray-500 mb-1">
                    {t.allUsersList} ({users.filter(u => u.email).length}):
                  </p>
                  {usersWithEmails.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 py-1 px-2 hover:bg-orange-50 rounded text-[10px] text-gray-600 border-b border-gray-50">
                      <span>👤</span>
                      <span className="font-medium">{getUserFullName(user)}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-gray-500">{user.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show Service User List when Service Users is selected */}
            {sendType === 'service' && showServiceUserList && (
              <div className="border border-gray-200 rounded-lg max-h-[150px] overflow-y-auto bg-white">
                <div className="p-2">
                  <p className="text-[10px] font-medium text-gray-500 mb-1">
                    {t.allServiceUsersList} ({(serviceUsers || []).filter(u => u.email).length}):
                  </p>
                  {serviceUsersWithEmails.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 py-1 px-2 hover:bg-orange-50 rounded text-[10px] text-gray-600 border-b border-gray-50">
                      <span>👤</span>
                      <span className="font-medium">{getUserFullName(user)}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-gray-500">{user.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display selected recipient info */}
            {sendType === 'all' && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                → {t.sendingTo} {users.filter(u => u.email).length} {t.registeredUsers}
                {excelEmailsCount && <span className="text-blue-600"> + {excelEmailsCount} from Excel</span>}
              </p>
            )}
            {sendType === 'service' && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                → {selectedServiceUser ? (
                  <>Specific Service User: <strong>{selectedServiceUser}</strong></>
                ) : (
                  <>All {t.serviceUsers} ({(serviceUsers || []).filter(u => u.email).length})</>
                )}
                {excelEmailsCount && <span className="text-blue-600"> + {excelEmailsCount} from Excel</span>}
              </p>
            )}
            {sendType === 'course' && selectedCourse && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                → {t.sendingTo} {users.filter(u => u.course === selectedCourse && u.email).length} {t.usersText} in {selectedCourse}
                {excelEmailsCount && <span className="text-blue-600"> + {excelEmailsCount} from Excel</span>}
              </p>
            )}
            {sendType === 'user' && selectedUser && selectedUserInfo && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                → {t.sendingTo}: <strong>{getUserFullName(selectedUserInfo)}</strong> ({selectedUserInfo.email})
                {excelEmailsCount && <span className="text-blue-600"> + {excelEmailsCount} from Excel</span>}
              </p>
            )}
          </div>

          {/* Subject - Compact */}
          <div>
            <label 
              className="block text-[10px] font-medium mb-1"
              style={{ color: BRAND.dark }}
            >
              {t.subject}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.enterSubject}
              maxLength={200}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
              style={{ 
                borderColor: subject ? BRAND.primary : '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND.primary;
                e.target.style.outline = `2px solid ${BRAND.primary}30`;
                e.target.style.outlineOffset = '1px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = subject ? BRAND.primary : '#d1d5db';
                e.target.style.outline = 'none';
                e.target.style.outlineOffset = '0';
              }}
              required
            />
            <div className="text-right text-[10px] text-gray-400 mt-0.5">
              {subject.length}/200
            </div>
          </div>

          {/* Message - Compact */}
          <div>
            <label 
              className="block text-[10px] font-medium mb-1"
              style={{ color: BRAND.dark }}
            >
              {t.message}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.typeMessage}
              rows={4}
              maxLength={10000}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none resize-y"
              style={{ 
                borderColor: message ? BRAND.primary : '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND.primary;
                e.target.style.outline = `2px solid ${BRAND.primary}30`;
                e.target.style.outlineOffset = '1px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = message ? BRAND.primary : '#d1d5db';
                e.target.style.outline = 'none';
                e.target.style.outlineOffset = '0';
              }}
              required
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>{message.length}/10000</span>
              <span>{message.split('\n').filter(line => line.trim()).length} lines</span>
            </div>
          </div>

          {/* File Uploads - Compact Row with Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Excel Upload with Import Button and Type Selector */}
            <div>
              <label 
                className="block text-[10px] font-medium mb-1"
                style={{ color: BRAND.dark }}
              >
                📊 {t.excelOptional}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(e, 'excel')}
                  className="flex-1 text-xs border border-gray-300 rounded-lg outline-none file:mr-2 file:py-1 file:px-2 file:text-[10px] file:font-medium hover:file:bg-orange-100 cursor-pointer"
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND.primary;
                    e.target.style.outline = `2px solid ${BRAND.primary}30`;
                    e.target.style.outlineOffset = '1px';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.outline = 'none';
                    e.target.style.outlineOffset = '0';
                  }}
                />
                {excelFile && (
                  <button
                    type="button"
                    onClick={() => removeFile('excel')}
                    className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
              {excelFile && (
                <div className="mt-1">
                  <p className="text-[10px] text-green-600 truncate">
                    ✅ {excelFile.name} ({excelEmailsCount || '0'} emails) {t.fileLoaded}
                  </p>
                  
                  {/* Import Type Selector */}
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-600">{t.importTo}</span>
                    <select
                      value={importType}
                      onChange={(e) => setImportType(e.target.value as 'users' | 'serviceUsers')}
                      className="text-[10px] border border-gray-300 rounded-lg px-2 py-1 outline-none bg-white"
                      style={{ borderColor: BRAND.primary }}
                    >
                      <option value="users">📋 {t.regularUsers}</option>
                      <option value="serviceUsers">🔧 {t.serviceUsersLabel}</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={handleImportUsers}
                      disabled={isImporting}
                      className="px-3 py-1 text-[10px] font-medium text-white rounded-lg transition flex items-center gap-1"
                      style={{ 
                        backgroundColor: isImporting ? '#9ca3af' : BRAND.primary,
                        cursor: isImporting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isImporting ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.importing}
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          {t.importUsers}
                        </>
                      )}
                    </button>
                  </div>
                  
                  {importedUsers.length > 0 && (
                    <div className="mt-1 max-h-[100px] overflow-y-auto border border-gray-200 rounded-lg p-1">
                      <p className="text-[9px] font-medium text-gray-500 mb-1">
                        Preview ({importedUsers.length} users):
                      </p>
                      {importedUsers.slice(0, 5).map((user, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[9px] text-gray-600 border-b border-gray-50 py-0.5">
                          <span>{user.first_name || ''} {user.last_name || ''}</span>
                          <span className="text-gray-400">-</span>
                          <span className="text-blue-600">{user.email}</span>
                          <span className="text-gray-400 text-[8px]">({user.course || 'No course'})</span>
                        </div>
                      ))}
                      {importedUsers.length > 5 && (
                        <p className="text-[8px] text-gray-400 mt-1">+ {importedUsers.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className="text-[9px] text-gray-400 mt-1">
                📋 Upload Excel with columns: email, first_name, last_name, course
              </p>
            </div>

            {/* PDF Upload */}
            <div>
              <label 
                className="block text-[10px] font-medium mb-1"
                style={{ color: BRAND.dark }}
              >
                📄 {t.pdfOptional}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                  className="flex-1 text-xs border border-gray-300 rounded-lg outline-none file:mr-2 file:py-1 file:px-2 file:text-[10px] file:font-medium hover:file:bg-orange-100 cursor-pointer"
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND.primary;
                    e.target.style.outline = `2px solid ${BRAND.primary}30`;
                    e.target.style.outlineOffset = '1px';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.outline = 'none';
                    e.target.style.outlineOffset = '0';
                  }}
                />
                {pdfFile && (
                  <button
                    type="button"
                    onClick={() => removeFile('pdf')}
                    className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
              {pdfFile && (
                <p className="text-[10px] text-green-600 mt-0.5 truncate">
                  ✅ {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB) {t.fileLoaded}
                </p>
              )}
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label 
                className="block text-[10px] font-medium mb-1"
                style={{ color: BRAND.dark }}
              >
                🖼️ {t.imageOptional}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 text-xs border border-gray-300 rounded-lg outline-none file:mr-2 file:py-1 file:px-2 file:text-[10px] file:font-medium hover:file:bg-orange-100 cursor-pointer"
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND.primary;
                    e.target.style.outline = `2px solid ${BRAND.primary}30`;
                    e.target.style.outlineOffset = '1px';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.outline = 'none';
                    e.target.style.outlineOffset = '0';
                  }}
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-1 relative">
                  <div className="border border-gray-200 rounded-lg p-1 bg-white inline-block">
                    <Image
                      src={imagePreview}
                      alt={t.imagePreview}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg max-h-16 w-auto"
                    />
                  </div>
                  <p className="text-[10px] text-green-600 mt-0.5 truncate">
                    ✅ {imageFile?.name} ({(imageFile?.size || 0 / 1024).toFixed(1)} KB) {t.fileLoaded}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {t.imagePreview}
                  </p>
                </div>
              )}
              <p className="text-[9px] text-gray-400 mt-1">
                🖼️ JPG, PNG, GIF, SVG (Max 5MB)
              </p>
            </div>
          </div>

          {/* Recipients Preview - Compact */}
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-[10px] text-gray-600 flex items-center gap-2 flex-wrap">
              <span>📧</span>
              <span>{t.recipientsLabel}: <strong>{totalRecipients}</strong> {totalRecipients !== 1 ? t.usersText : t.userText}</span>
              {excelFile && <span className="text-blue-600">📊 +{excelEmailsCount || '?'} Excel</span>}
              {pdfFile && <span className="text-purple-600">📄 + PDF</span>}
              {imageFile && <span className="text-green-600">🖼️ + Image</span>}
              {sendType === 'course' && selectedCourse && (
                <span className="text-green-500 text-[9px]">🎯 {selectedCourse}</span>
              )}
              {sendType === 'user' && selectedUser && selectedUserInfo && (
                <span className="text-blue-500 text-[9px]">👤 {getUserFullName(selectedUserInfo)}</span>
              )}
              {sendType === 'service' && selectedServiceUser && (
                <span className="text-teal-500 text-[9px]">👤 Specific Service User</span>
              )}
              {sendType === 'service' && !selectedServiceUser && (
                <span className="text-teal-500 text-[9px]">👤 All Service Users</span>
              )}
              {importType === 'serviceUsers' && excelFile && (
                <span className="text-purple-500 text-[9px]">🔧 Import to Service Users</span>
              )}
            </p>
          </div>

          {/* Actions - Centered Send Button */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSending || !subject.trim() || !message.trim() || 
                (sendType === 'course' && !selectedCourse) ||
                (sendType === 'user' && !selectedUser) ||
                (sendType === 'service' && (serviceUsers || []).length === 0)}
              className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-2 min-w-[120px] ${
                isSending || !subject.trim() || !message.trim() || 
                (sendType === 'course' && !selectedCourse) ||
                (sendType === 'user' && !selectedUser) ||
                (sendType === 'service' && (serviceUsers || []).length === 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'hover:opacity-90'
              }`}
              style={!isSending && subject.trim() && message.trim() && 
                !((sendType === 'course' && !selectedCourse) ||
                (sendType === 'user' && !selectedUser) ||
                (sendType === 'service' && (serviceUsers || []).length === 0)) 
                ? { backgroundColor: BRAND.primary } 
                : {}}
            >
              {isSending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.sending}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {t.sendBroadcast}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
            >
              {t.clearAll}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}