import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ✅ Required for filesystem access on Node hosting (Hostinger, VPS, etc.)
export const runtime = 'nodejs';

// ✅ Prevent Next.js from statically caching this route at build time
export const dynamic = 'force-dynamic';

// ─── Type definitions ─────────────────────────────────────────
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

// ─── Default images ───────────────────────────────────────────
const defaultImages: ImageContent = {
  slide1Image: '/logo.jpg',
  slide2Image: '/naky.webp',
  slide3Image: '/people-taking-part-business-event.jpg',
  slide4Image: '/secuss.webp',
  heroImage: '/download.jpeg',
  logoImage: '/logo.jpg',
};

// ─── Default home content ─────────────────────────────────────
const defaultContent: HomeContent = {
  en: {
    website: 'Website',
    contact: 'Contact',
    comment: 'Comment',
    register: 'Register',
    login: 'Login',
    close: 'Close',
    language: 'አማርኛ',
    rightwork: 'Rightwork at right time',
    menu: 'Menu',
    welcome: 'Welcome to',
    dreamMore: 'DreamMore',
    eventAttendance: '✨ Dream More Event Attendance ✨',
    digitalAgency: 'Digital Agency Event 2026',
    about: 'About DreamMore',
    empowering: 'Empowering Digital Excellence',
    aboutText:
      'Dream More is a collaborative group of dynamic youth and active team members dedicated to education purpose, digital marketing, and a wide range of tech-related services. We prioritize a client-centred approach, supported by our versatile service offerings and an unwavering commitment to quality. With a focus on reliability, trust, and continuous innovation, our dedicated team adapts to meet the evolving demands of every client, ensuring that we consistently exceed expectations.',
    highlights: 'Event Highlights',
    highlight1: 'Network with industry leaders and professionals',
    highlight2: 'Learn from top digital marketing experts',
    highlight3: 'Explore innovative tech solutions and trends',
    highlight4: 'Connect with like-minded professionals',
    highlight5: 'Gain valuable insights for business growth',
    registerNow: 'Register Now for Event 2026',
    registerNowShort: 'Register Now',
    joinUs: 'Join us for an unforgettable experience',
    slide1Title: 'Welcome To DreamMore Event',
    slide1Desc: 'Join us!',
    slide2Title: 'Naky Hotel',
    slide2Desc: 'Connect with leaders',
    slide3Title: 'Business 2026',
    slide3Desc: 'Learn from the best',
    slide4Title: 'Success Stories',
    slide4Desc: 'Be part of it',
    empower: 'Empower digital agencies.',
    quickLinks: 'Quick Links',
    home: 'Home',
    eventInfo: 'Event Info',
    connect: 'Connect',
    privacy: 'Privacy',
    terms: 'Terms',
    secure: 'Secure',
    rights: '© 2026 DreamMore. All rights reserved.',
    backToHome: 'Back to Home',
    eventDate: 'July 11, 2026',
    eventLocation: 'DreamMore Events',
    eventTime: '8:00 (Local Time)',
  },
  am: {
    website: 'ድር ጣቢያ',
    contact: 'አግኙን',
    comment: 'አስተያየት',
    register: 'ይመዝገቡ',
    login: 'ግባ',
    close: 'ዝጋ',
    language: 'English',
    rightwork: 'በትክክለኛው ጊዜ ትክክለኛ ስራ',
    menu: 'ምናሌ',
    welcome: 'እንኳን ወደ',
    dreamMore: 'ድሪም ሞር በደህና መጡ',
    eventAttendance: '✨ የድሪም ሞር ክስተት መገኘት ✨',
    digitalAgency: 'የዲጂታል ኤጀንሲ ዝግጅት 2026',
    about: 'ስለ ድሪም ሞር',
    empowering: 'ዲጂታል ልቀትን ማበረታታት',
    aboutText:
      'ድሪም ሞር ለትምህርት ዓላማ፣ ለዲጂታል ግብይት እና ለተለያዩ የቴክኖሎጂ አገልግሎቶች የተሰጠ ተለዋዋጭ ወጣቶች እና ንቁ የቡድን አባላት ትብብር ነው። እኛ ለደንበኞች ያማከለ አካሄድን፣ ሁለገብ የአገልግሎት አቅርቦቶቻችን እና ለጥራት ያለን ቁርጠኝነት ቅድሚያ እንሰጣለን። በአስተማማኝነት፣ በመተማመን እና ቀጣይነት ባለው ፈጠራ ላይ በማተኮር፣ የታመነ ቡድናችን የእያንዳንዱን ደንበኛ ተለዋዋጭ ፍላጎቶች ለማሟላት ይላመዳል።',
    highlights: 'የዝግጅቱ ዋና ዋና ነጥቦች',
    highlight1: 'ከኢንዱስትሪ መሪዎች እና ባለሙያዎች ጋር መገናኘት',
    highlight2: 'ከከፍተኛ የዲጂታል ግብይት ባለሙያዎች መማር',
    highlight3: 'አዳዲስ የቴክኖሎጂ መፍትሄዎችን እና አዝማሚያዎችን ማሰስ',
    highlight4: 'ተመሳሳይ አስተሳሰብ ካላቸው ባለሙያዎች ጋር መገናኘት',
    highlight5: 'ለንግድ እድገት ጠቃሚ ግንዛቤዎችን ማግኘት',
    registerNow: 'ለ2026 ዝግጅት አሁን ይመዝገቡ',
    registerNowShort: 'አሁን ይመዝገቡ',
    joinUs: 'ለማይረሳ ልምድ ይቀላቀሉን',
    slide1Title: 'እንኳን ወደ ድሪም ሞር ዝግጅት በደህና መጡ',
    slide1Desc: 'ይቀላቀሉን!',
    slide2Title: 'ናኪ ሆቴል',
    slide2Desc: 'ከመሪዎች ጋር ይገናኙ',
    slide3Title: 'ንግድ 2026',
    slide3Desc: 'ከምርጦቹ ይማሩ',
    slide4Title: 'የስኬት ታሪኮች',
    slide4Desc: 'የእሱ አካል ይሁኑ',
    empower: 'ዲጂታል ኤጀንሲዎችን ማበረታታት።',
    quickLinks: 'ፈጣን አገናኞች',
    home: 'መነሻ',
    eventInfo: 'የዝግጅት መረጃ',
    connect: 'ያገናኙ',
    privacy: 'ግላዊነት',
    terms: 'ውሎች',
    secure: 'ደህንነቱ',
    rights: '© 2026 ድሪም ሞር. ሁሉም መብቶች የተጠበቁ ናቸው።',
    backToHome: 'ወደ መነሻ ተመለስ',
    eventDate: 'ሐምሌ 11, 2026',
    eventLocation: 'ድሪም ሞር ዝግጅቶች',
    eventTime: '8:00 (የአካባቢ ሰዓት)',
  },
  images: defaultImages,
};

// ─── Helpers ──────────────────────────────────────────────────
function isValidLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'am';
}

// ✅ Compute paths at request-time, not module load
function getDataPaths() {
  const dataDir = path.join(process.cwd(), 'data');
  const dataFilePath = path.join(dataDir, 'home-content.json');
  return { dataDir, dataFilePath };
}

async function ensureDataDir(): Promise<string> {
  const { dataDir, dataFilePath } = getDataPaths();
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // Directory already exists
  }
  return dataFilePath;
}

// ─── GET - Read home content ──────────────────────────────────
export async function GET() {
  try {
    const dataFilePath = await ensureDataDir();
    const data = await readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(data) as Partial<HomeContent>;

    const merged: HomeContent = {
      en: { ...defaultContent.en, ...(parsed.en ?? {}) },
      am: { ...defaultContent.am, ...(parsed.am ?? {}) },
      images: { ...defaultImages, ...(parsed.images ?? {}) },
    };

    return NextResponse.json(merged);
  } catch {
    // File doesn't exist yet → return defaults
    return NextResponse.json(defaultContent);
  }
}

// ─── POST - Save home content ─────────────────────────────────
export async function POST(request: Request) {
  try {
    const dataFilePath = await ensureDataDir();
    const body = (await request.json()) as Partial<HomeContent>;

    if (!body.en || !body.am) {
      return NextResponse.json(
        { success: false, message: 'Invalid content format. Both "en" and "am" are required.' },
        { status: 400 }
      );
    }

    const contentToSave: HomeContent = {
      en: { ...defaultContent.en, ...body.en },
      am: { ...defaultContent.am, ...body.am },
      images: { ...defaultImages, ...(body.images ?? {}) },
    };

    await writeFile(dataFilePath, JSON.stringify(contentToSave, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Home content saved successfully',
      content: contentToSave,
    });
  } catch (error) {
    console.error('[home] POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save content' },
      { status: 500 }
    );
  }
}

// ─── PUT - Partial update ─────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const dataFilePath = await ensureDataDir();
    const body = (await request.json()) as {
      lang?: unknown;
      updates?: Partial<LanguageContent>;
    };
    const { lang, updates } = body;

    if (!isValidLanguage(lang) || !updates) {
      return NextResponse.json(
        { success: false, message: 'Invalid request. "lang" (en/am) and "updates" are required.' },
        { status: 400 }
      );
    }

    let existingContent: HomeContent = defaultContent;
    try {
      const data = await readFile(dataFilePath, 'utf-8');
      const parsed = JSON.parse(data) as Partial<HomeContent>;
      existingContent = {
        en: { ...defaultContent.en, ...(parsed.en ?? {}) },
        am: { ...defaultContent.am, ...(parsed.am ?? {}) },
        images: { ...defaultImages, ...(parsed.images ?? {}) },
      };
    } catch {
      // Use defaults
    }

    const updatedContent: HomeContent = {
      ...existingContent,
      [lang]: { ...existingContent[lang], ...updates },
    };

    await writeFile(dataFilePath, JSON.stringify(updatedContent, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `${lang === 'en' ? 'English' : 'Amharic'} content updated successfully`,
      content: updatedContent,
    });
  } catch (error) {
    console.error('[home] PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update content' },
      { status: 500 }
    );
  }
}