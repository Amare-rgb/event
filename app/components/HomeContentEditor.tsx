'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

// ─── Types ─────────────────────────────────────────────────────
type LanguageContent = {
  website: string;
  contact: string;
  comment: string;
  register: string;
  login: string;
  close: string;
  language: string;
  rightwork: string;
  menu: string;
  welcome: string;
  dreamMore: string;
  eventAttendance: string;
  digitalAgency: string;
  about: string;
  empowering: string;
  aboutText: string;
  highlights: string;
  highlight1: string;
  highlight2: string;
  highlight3: string;
  highlight4: string;
  highlight5: string;
  registerNow: string;
  registerNowShort: string;
  joinUs: string;
  slide1Title: string;
  slide1Desc: string;
  slide2Title: string;
  slide2Desc: string;
  slide3Title: string;
  slide3Desc: string;
  slide4Title: string;
  slide4Desc: string;
  empower: string;
  quickLinks: string;
  home: string;
  eventInfo: string;
  connect: string;
  privacy: string;
  terms: string;
  secure: string;
  rights: string;
  backToHome: string;
  eventDate: string;
  eventLocation: string;
  eventTime: string;
};

type ImageContent = {
  slide1Image: string;
  slide2Image: string;
  slide3Image: string;
  slide4Image: string;
  heroImage: string;
  logoImage: string;
};

type HomeContent = {
  en: LanguageContent;
  am: LanguageContent;
  images: ImageContent;
};

type Language = 'en' | 'am';

interface FieldConfig {
  key: keyof LanguageContent;
  label: string;
  labelAm: string;
  type?: 'text' | 'textarea';
}

interface FieldGroup {
  title: string;
  titleAm: string;
  fields: FieldConfig[];
}

interface ImageFieldConfig {
  key: keyof ImageContent;
  label: string;
  labelAm: string;
}

interface HomeContentEditorProps {
  language: 'en' | 'am';
}

// ─── Text field groups ─────────────────────────────────────────
const fieldGroups: FieldGroup[] = [
  {
    title: 'Navigation',
    titleAm: 'አሰሳ',
    fields: [
      { key: 'website', label: 'Website Button', labelAm: 'ድር ጣቢያ አዝራር' },
      { key: 'contact', label: 'Contact Button', labelAm: 'አግኙን አዝራር' },
      { key: 'comment', label: 'Comment Button', labelAm: 'አስተያየት አዝራር' },
      { key: 'register', label: 'Register Button', labelAm: 'ይመዝገቡ አዝራር' },
      { key: 'login', label: 'Login Button', labelAm: 'ግባ አዝራር' },
      { key: 'close', label: 'Close Button', labelAm: 'ዝጋ አዝራር' },
      { key: 'language', label: 'Language Toggle Text', labelAm: 'የቋንቋ መቀየሪያ ጽሑፍ' },
      { key: 'rightwork', label: 'Tagline (Rightwork...)', labelAm: 'መሪ ቃል' },
      { key: 'menu', label: 'Menu Label', labelAm: 'ምናሌ መለያ' },
    ],
  },
  {
    title: 'Hero Section',
    titleAm: 'የጀግንነት ክፍል',
    fields: [
      { key: 'welcome', label: 'Welcome Text', labelAm: 'እንኳን ደህና መጡ ጽሑፍ' },
      { key: 'dreamMore', label: 'Brand Name in Hero', labelAm: 'በጀግንነት ውስጥ ያለ የምርት ስም' },
      { key: 'eventAttendance', label: 'Event Attendance Text', labelAm: 'የዝግጅት መገኘት ጽሑፍ' },
      { key: 'digitalAgency', label: 'Digital Agency Event Text', labelAm: 'የዲጂታል ኤጀንሲ ዝግጅት ጽሑፍ' },
    ],
  },
  {
    title: 'About Section',
    titleAm: 'ስለ ክፍል',
    fields: [
      { key: 'about', label: 'About Title', labelAm: 'ስለ ርዕስ' },
      { key: 'empowering', label: 'Empowering Subtitle', labelAm: 'ማበረታቻ ንዑስ ርዕስ' },
      { key: 'aboutText', label: 'About Description', labelAm: 'ስለ መግለጫ', type: 'textarea' },
    ],
  },
  {
    title: 'Event Highlights',
    titleAm: 'የዝግጅት ዋና ዋና ነጥቦች',
    fields: [
      { key: 'highlights', label: 'Highlights Title', labelAm: 'ዋና ዋና ነጥቦች ርዕስ' },
      { key: 'highlight1', label: 'Highlight 1', labelAm: 'ዋና ነጥብ 1' },
      { key: 'highlight2', label: 'Highlight 2', labelAm: 'ዋና ነጥብ 2' },
      { key: 'highlight3', label: 'Highlight 3', labelAm: 'ዋና ነጥብ 3' },
      { key: 'highlight4', label: 'Highlight 4', labelAm: 'ዋና ነጥብ 4' },
      { key: 'highlight5', label: 'Highlight 5', labelAm: 'ዋና ነጥብ 5' },
    ],
  },
  {
    title: 'Registration Section',
    titleAm: 'የምዝገባ ክፍል',
    fields: [
      { key: 'registerNow', label: 'Register Now (Long)', labelAm: 'አሁን ይመዝገቡ (ረዥም)' },
      { key: 'registerNowShort', label: 'Register Now (Short)', labelAm: 'አሁን ይመዝገቡ (አጭር)' },
      { key: 'joinUs', label: 'Join Us Text', labelAm: 'ይቀላቀሉን ጽሑፍ' },
    ],
  },
  {
    title: 'Slider Content',
    titleAm: 'የስላይደር ይዘት',
    fields: [
      { key: 'slide1Title', label: 'Slide 1 Title', labelAm: 'ስላይድ 1 ርዕስ' },
      { key: 'slide1Desc', label: 'Slide 1 Description', labelAm: 'ስላይድ 1 መግለጫ' },
      { key: 'slide2Title', label: 'Slide 2 Title', labelAm: 'ስላይድ 2 ርዕስ' },
      { key: 'slide2Desc', label: 'Slide 2 Description', labelAm: 'ስላይድ 2 መግለጫ' },
      { key: 'slide3Title', label: 'Slide 3 Title', labelAm: 'ስላይድ 3 ርዕስ' },
      { key: 'slide3Desc', label: 'Slide 3 Description', labelAm: 'ስላይድ 3 መግለጫ' },
      { key: 'slide4Title', label: 'Slide 4 Title', labelAm: 'ስላይድ 4 ርዕስ' },
      { key: 'slide4Desc', label: 'Slide 4 Description', labelAm: 'ስላይድ 4 መግለጫ' },
    ],
  },
  {
    title: 'Event Info',
    titleAm: 'የዝግጅት መረጃ',
    fields: [
      { key: 'eventDate', label: 'Event Date', labelAm: 'የዝግጅት ቀን' },
      { key: 'eventLocation', label: 'Event Location', labelAm: 'የዝግጅት ቦታ' },
      { key: 'eventTime', label: 'Event Time', labelAm: 'የዝግጅት ሰዓት' },
    ],
  },
  {
    title: 'Footer',
    titleAm: 'ግርጌ',
    fields: [
      { key: 'empower', label: 'Empower Tagline', labelAm: 'ማበረታቻ መሪ ቃል' },
      { key: 'quickLinks', label: 'Quick Links Title', labelAm: 'ፈጣን አገናኞች ርዕስ' },
      { key: 'home', label: 'Home Link', labelAm: 'መነሻ አገናኝ' },
      { key: 'eventInfo', label: 'Event Info Title', labelAm: 'የዝግጅት መረጃ ርዕስ' },
      { key: 'connect', label: 'Connect Title', labelAm: 'ያገናኙ ርዕስ' },
      { key: 'privacy', label: 'Privacy Link', labelAm: 'ግላዊነት አገናኝ' },
      { key: 'terms', label: 'Terms Link', labelAm: 'ውሎች አገናኝ' },
      { key: 'secure', label: 'Secure Text', labelAm: 'ደህንነቱ ጽሑፍ' },
      { key: 'rights', label: 'Copyright Text', labelAm: 'የቅጂ መብት ጽሑፍ' },
      { key: 'backToHome', label: 'Back to Home', labelAm: 'ወደ መነሻ ተመለስ' },
    ],
  },
];

// ─── Image field configuration ─────────────────────────────────
const imageFields: ImageFieldConfig[] = [
  { key: 'slide1Image', label: 'Slider Image 1', labelAm: 'የስላይድ ምስል 1' },
  { key: 'slide2Image', label: 'Slider Image 2', labelAm: 'የስላይድ ምስል 2' },
  { key: 'slide3Image', label: 'Slider Image 3', labelAm: 'የስላይድ ምስል 3' },
  { key: 'slide4Image', label: 'Slider Image 4', labelAm: 'የስላይድ ምስል 4' },
  { key: 'heroImage', label: 'Hero Image (Bottom)', labelAm: 'የጀግንነት ምስል' },
  { key: 'logoImage', label: 'Logo Image', labelAm: 'የሎጎ ምስል' },
];

// ─── Empty fallbacks ───────────────────────────────────────────
const emptyContent: LanguageContent = {
  website: '',
  contact: '',
  comment: '',
  register: '',
  login: '',
  close: '',
  language: '',
  rightwork: '',
  menu: '',
  welcome: '',
  dreamMore: '',
  eventAttendance: '',
  digitalAgency: '',
  about: '',
  empowering: '',
  aboutText: '',
  highlights: '',
  highlight1: '',
  highlight2: '',
  highlight3: '',
  highlight4: '',
  highlight5: '',
  registerNow: '',
  registerNowShort: '',
  joinUs: '',
  slide1Title: '',
  slide1Desc: '',
  slide2Title: '',
  slide2Desc: '',
  slide3Title: '',
  slide3Desc: '',
  slide4Title: '',
  slide4Desc: '',
  empower: '',
  quickLinks: '',
  home: '',
  eventInfo: '',
  connect: '',
  privacy: '',
  terms: '',
  secure: '',
  rights: '',
  backToHome: '',
  eventDate: '',
  eventLocation: '',
  eventTime: '',
};

const emptyImages: ImageContent = {
  slide1Image: '/logo.jpg',
  slide2Image: '/naky.webp',
  slide3Image: '/people-taking-part-business-event.jpg',
  slide4Image: '/secuss.webp',
  heroImage: '/download.jpeg',
  logoImage: '/logo.jpg',
};

// ─── Component ─────────────────────────────────────────────────
export default function HomeContentEditor({ language }: HomeContentEditorProps) {
  const [content, setContent] = useState<HomeContent>({
    en: { ...emptyContent },
    am: { ...emptyContent },
    images: { ...emptyImages },
  });
  const [activeLang, setActiveLang] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<'text' | 'images'>('text');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ─── Fetch content ───
  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      try {
        const res = await fetch('/api/admin/home', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Unexpected non-JSON response from /api/admin/home');
        }

        const data = (await res.json()) as HomeContent;
        if (isMounted) {
          setContent({
            en: { ...emptyContent, ...(data.en ?? {}) },
            am: { ...emptyContent, ...(data.am ?? {}) },
            images: { ...emptyImages, ...(data.images ?? {}) },
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('[HomeContentEditor] fetch error:', err);
        if (isMounted) {
          setLoading(false);
          setMessage({ type: 'error', text: 'Failed to load content. Please refresh the page.' });
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Auto-dismiss message ───
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ─── Handle text change ───
  const handleChange = useCallback(
    (key: keyof LanguageContent, value: string) => {
      setContent((prev) => ({
        ...prev,
        [activeLang]: {
          ...prev[activeLang],
          [key]: value,
        },
      }));
      setHasChanges(true);
    },
    [activeLang]
  );

  // ─── Handle image upload ───
  const handleImageUpload = async (key: keyof ImageContent, file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload JPG, PNG, GIF, WEBP or SVG.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size exceeds 5MB limit.' });
      return;
    }

    setUploading(key);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slot', key);

      // ✅ FIXED: point to existing /api/upload route
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          `Server returned non-JSON response (${res.status}). Check that /api/upload/route.ts exists.`
        );
      }

      const data = (await res.json()) as { success: boolean; url?: string; message?: string };

      if (res.ok && data.success && data.url) {
        setContent((prev) => ({
          ...prev,
          images: {
            ...prev.images,
            [key]: data.url!,
          },
        }));
        setHasChanges(true);
        setMessage({ type: 'success', text: 'Image uploaded! Click Save Changes to apply.' });
      } else {
        setMessage({ type: 'error', text: data.message || `Failed to upload image (${res.status}).` });
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Network error. Failed to upload image.';
      setMessage({ type: 'error', text });
    } finally {
      setUploading(null);
    }
  };

  // ─── Remove image ───
  const handleRemoveImage = (key: keyof ImageContent) => {
    setContent((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: emptyImages[key],
      },
    }));
    setHasChanges(true);
  };

  // ─── Handle save ───
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status}).`);
      }

      const data = (await res.json()) as { success: boolean; message?: string };

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Content saved successfully! The home page will update on refresh.',
        });
        setHasChanges(false);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to save content.',
        });
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Network error. Failed to save content.';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  // ─── Handle reset ───
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? Unsaved changes will be lost.')) {
      setContent({
        en: { ...emptyContent },
        am: { ...emptyContent },
        images: { ...emptyImages },
      });
      setHasChanges(false);
      fetch('/api/admin/home', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: HomeContent) => {
          setContent({
            en: { ...emptyContent, ...(data.en ?? {}) },
            am: { ...emptyContent, ...(data.am ?? {}) },
            images: { ...emptyImages, ...(data.images ?? {}) },
          });
        })
        .catch(() => {});
    }
  };

  // ─── Translations ───
  const t = {
    en: {
      title: 'Home Page Content Editor',
      subtitle: 'Edit all text and images displayed on the home page',
      editEnglish: 'English',
      editAmharic: 'አማርኛ',
      textSection: 'Text Content',
      imagesSection: 'Images',
      save: 'Save Changes',
      saving: 'Saving...',
      loading: 'Loading content...',
      reset: 'Reset',
      unsaved: 'You have unsaved changes',
      upload: 'Upload',
      uploading: 'Uploading...',
      replace: 'Replace Image',
      remove: 'Remove',
      currentImage: 'Current image',
      noImage: 'No image selected',
      allowedTypes: 'JPG, PNG, GIF, WEBP, SVG — Max 5MB',
    },
    am: {
      title: 'የመነሻ ገጽ ይዘት አርታዒ',
      subtitle: 'በመነሻ ገጹ ላይ የሚታዩትን ሁሉንም ጽሑፎች እና ምስሎች ያርትዑ',
      editEnglish: 'English',
      editAmharic: 'አማርኛ',
      textSection: 'የጽሑፍ ይዘት',
      imagesSection: 'ምስሎች',
      save: 'ለውጦችን አስቀምጥ',
      saving: 'በማስቀመጥ ላይ...',
      loading: 'ይዘት በመጫን ላይ...',
      reset: 'ዳግም አስጀምር',
      unsaved: 'ያልተቀመጡ ለውጦች አሉዎት',
      upload: 'ስቀል',
      uploading: 'በመስቀል ላይ...',
      replace: 'ምስል ይቀይሩ',
      remove: 'አስወግድ',
      currentImage: 'የአሁኑ ምስል',
      noImage: 'ምንም ምስል አልተመረጠም',
      allowedTypes: 'JPG, PNG, GIF, WEBP, SVG — ከፍተኛ 5MB',
    },
  }[language];

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <div className="text-gray-500 text-sm">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t.title}
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setActiveLang('en')}
            className={`text-[10px] px-3 py-1 rounded-full transition-all duration-300 font-medium ${
              activeLang === 'en'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.editEnglish}
          </button>
          <button
            onClick={() => setActiveLang('am')}
            className={`text-[10px] px-3 py-1 rounded-full transition-all duration-300 font-medium ${
              activeLang === 'am'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.editAmharic}
          </button>
        </div>
      </div>

      {/* ─── Section Tabs ─── */}
      <div className="flex justify-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveSection('text')}
          className={`text-[10px] px-3 py-1.5 rounded-lg transition-all duration-300 font-medium flex items-center gap-1.5 ${
            activeSection === 'text'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          {t.textSection}
        </button>
        <button
          onClick={() => setActiveSection('images')}
          className={`text-[10px] px-3 py-1.5 rounded-lg transition-all duration-300 font-medium flex items-center gap-1.5 ${
            activeSection === 'images'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {t.imagesSection}
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          className={`text-xs px-3 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && !message && (
        <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{t.unsaved}</span>
        </div>
      )}

      {/* ─── TEXT SECTION ─── */}
      {activeSection === 'text' && (
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 pb-2">
          {fieldGroups.map((group) => (
            <div
              key={group.title}
              className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xs font-bold text-gray-800 mb-2 pb-1.5 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1 h-3 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></span>
                {activeLang === 'en' ? group.title : group.titleAm}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      {activeLang === 'en' ? field.label : field.labelAm}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={content[activeLang][field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={4}
                        className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition resize-y bg-gray-50 focus:bg-white"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[activeLang][field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition bg-gray-50 focus:bg-white"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── IMAGES SECTION ─── */}
      {activeSection === 'images' && (
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 pb-2">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3 pb-1.5 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1 h-3 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></span>
              {t.imagesSection}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {imageFields.map((field) => {
                const currentUrl = content.images[field.key];
                const isUploading = uploading === field.key;

                return (
                  <div
                    key={field.key}
                    className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 hover:bg-white transition"
                  >
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      {activeLang === 'en' ? field.label : field.labelAm}
                    </label>

                    {/* Image preview */}
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-2">
                      {currentUrl ? (
                        <Image
                          src={currentUrl}
                          alt={field.label}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 300px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-[10px]">
                          {t.noImage}
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* URL display */}
                    <p className="text-[9px] text-gray-400 truncate mb-1.5" title={currentUrl}>
                      {currentUrl || '—'}
                    </p>

                    {/* Upload + Remove buttons */}
                    <div className="flex justify-center gap-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          fileInputRefs.current[field.key] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(field.key, file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[field.key]?.click()}
                        disabled={isUploading}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white text-[10px] font-medium px-3 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t.uploading}
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            {t.upload}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(field.key)}
                        disabled={isUploading || currentUrl === emptyImages[field.key]}
                        className="bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 text-[10px] font-medium px-3 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {t.remove}
                      </button>
                    </div>

                    <p className="text-[9px] text-gray-400 mt-1 text-center">{t.allowedTypes}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Save / Reset buttons */}
      <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-200 flex justify-center gap-2">
        <button
          onClick={handleReset}
          disabled={saving}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {t.reset}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-5 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t.saving}
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t.save}
            </>
          )}
        </button>
      </div>
    </div>
  );
}