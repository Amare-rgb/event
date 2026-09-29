import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// ✅ Required so Node APIs (fs, Buffer) work on Hostinger / VPS
export const runtime = 'nodejs';

// ✅ Prevent Next.js from statically optimizing this route
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_SLOTS = [
  'slide1Image',
  'slide2Image',
  'slide3Image',
  'slide4Image',
  'heroImage',
  'logoImage',
] as const;

type AllowedSlot = (typeof ALLOWED_SLOTS)[number];

function isAllowedSlot(value: unknown): value is AllowedSlot {
  return typeof value === 'string' && (ALLOWED_SLOTS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slot = formData.get('slot');

    // ─── Validate file presence ───
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided.' },
        { status: 400 }
      );
    }

    // ─── Validate slot (client sends "slot" too) ───
    if (!isAllowedSlot(slot)) {
      return NextResponse.json(
        { success: false, message: 'Invalid image slot.' },
        { status: 400 }
      );
    }

    // ─── Validate MIME type ───
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Use JPG, PNG, GIF, WEBP or SVG.' },
        { status: 400 }
      );
    }

    // ─── Validate size ───
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    // ─── Ensure uploads directory exists ───
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ─── Generate safe filename (never trust file.name) ───
    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const safeSlot = slot.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${safeSlot}-${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // ─── Write file ───
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // ─── Return public URL (matches HomeContentEditor expectations) ───
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      slot,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('[upload] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── Reject non-POST requests ───
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}