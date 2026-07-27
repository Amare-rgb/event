// app/api/admin/broadcast/route.ts

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';
import { PoolClient } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// ============ Types ============
interface EmailRow {
  email: string;
}

interface ExcelRow {
  [key: string]: unknown;
}

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  contentDisposition?: 'attachment' | 'inline';
  cid?: string;
}

interface MailOptions {
  from: string;
  subject: string;
  html: string;
  text: string;
  bcc: string[];
  attachments?: MailAttachment[];
}

// Brand Colors
const BRAND = {
  primary: '#E26A25',
  dark: '#2E3641',
};

// ============ Email transporter ============
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '465');
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });
};

// ============ Helper: Save image file ============
async function saveImageFile(file: File): Promise<{ filename: string; filepath: string; url: string } | null> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'broadcast');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `broadcast_image_${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);
    
    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Store relative URL for email
    const url = `/uploads/broadcast/${filename}`;
    
    console.log('✅ Image saved:', url);
    return { filename, filepath, url };
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}

// ============ Helper: Get image MIME type ============
function getImageMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/png';
}

// ============ Route handler ============
export async function POST(request: NextRequest): Promise<NextResponse> {
  let client: PoolClient | null = null;

  try {
    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const courseFilter = (formData.get('courseFilter') as string) || 'all';
    const sendType = (formData.get('sendType') as string) || 'all';
    const userFilter = (formData.get('userFilter') as string) || '';
    const userType = (formData.get('userType') as string) || '';
    const excelFile = formData.get('excelFile') as File | null;
    const pdfFile = formData.get('pdfFile') as File | null;
    const imageFile = formData.get('imageFile') as File | null;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // ---------- Process Image file ----------
    let imageUrl: string | null = null;
    let imageFilename: string | null = null;
    let imageBuffer: Buffer | null = null;
    let imageMimeType: string | null = null;

    if (imageFile && imageFile.size > 0) {
      try {
        // Validate image size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Image file size exceeds 5MB limit' },
            { status: 400 }
          );
        }

        // Validate image type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!validTypes.includes(imageFile.type) && !imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Invalid image format. Please use JPG, PNG, GIF, SVG, or WebP.' },
            { status: 400 }
          );
        }

        // Save the image file
        const savedImage = await saveImageFile(imageFile);
        if (savedImage) {
          imageUrl = savedImage.url;
          imageFilename = savedImage.filename;
          imageBuffer = Buffer.from(await imageFile.arrayBuffer());
          imageMimeType = imageFile.type || getImageMimeType(imageFile.name);
          console.log(`🖼️ Image loaded: ${imageFilename} (${Math.round(imageBuffer.length / 1024)} KB)`);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
          { error: 'Failed to process image file' },
          { status: 400 }
        );
      }
    }

    // ---------- Get emails from database ----------
    let dbEmails: string[] = [];
    let dbUserCount = 0;
    let targetTable = 'users';

    try {
      client = await pool.connect();

      let query = '';
      let countQuery = '';
      const params: string[] = [];

      // ============================================================
      // 1. SERVICE USERS - All service users
      // ============================================================
      if (sendType === 'service' && !userFilter) {
        targetTable = 'service_users';
        query = `
          SELECT email FROM service_users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
        `;
        countQuery = `
          SELECT COUNT(*) as total 
          FROM service_users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
        `;
        console.log('📧 Targeting ALL Service Users');
      }
      
      // ============================================================
      // 2. SPECIFIC SERVICE USER - One service user
      // ============================================================
      else if (sendType === 'service' && userFilter) {
        targetTable = 'service_users';
        query = `
          SELECT email FROM service_users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND email = $1
        `;
        countQuery = `
          SELECT COUNT(*) as total 
          FROM service_users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND email = $1
        `;
        params.push(userFilter);
        console.log(`📧 Targeting Specific Service User: ${userFilter}`);
      }
      
      // ============================================================
      // 3. SPECIFIC USER - One regular user
      // ============================================================
      else if (sendType === 'user' && userFilter) {
        targetTable = 'users';
        query = `
          SELECT email FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND email = $1
        `;
        countQuery = `
          SELECT COUNT(*) as total 
          FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND email = $1
        `;
        params.push(userFilter);
        console.log(`📧 Targeting Specific User: ${userFilter}`);
      }
      
      // ============================================================
      // 4. SPECIFIC COURSE - Regular users by course
      // ============================================================
      else if (sendType === 'course' && courseFilter && courseFilter !== 'all') {
        targetTable = 'users';
        query = `
          SELECT email FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND course = $1
        `;
        countQuery = `
          SELECT COUNT(*) as total 
          FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
          AND course = $1
        `;
        params.push(courseFilter);
        console.log(`📧 Targeting Users in Course: ${courseFilter}`);
      }
      
      // ============================================================
      // 5. ALL USERS - All regular users (DEFAULT)
      // ============================================================
      else {
        targetTable = 'users';
        query = `
          SELECT email FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
        `;
        countQuery = `
          SELECT COUNT(*) as total 
          FROM users 
          WHERE email IS NOT NULL 
          AND email != '' 
          AND email LIKE '%@%'
        `;
        console.log('📧 Targeting ALL Regular Users');
      }

      // Execute the queries
      const result = await client.query<EmailRow>(query, params);
      dbEmails = result.rows
        .map((row: EmailRow) => row.email)
        .filter(
          (email: string): email is string =>
            email !== null && email.trim() !== '' && email.includes('@')
        );

      // Get count
      const countResult = await client.query(countQuery, params);
      dbUserCount = parseInt(countResult.rows[0].total, 10);

      console.log(`📧 Found ${dbEmails.length} emails from ${targetTable} table`);

    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user emails' },
        { status: 500 }
      );
    } finally {
      if (client) {
        client.release();
        client = null;
      }
    }

    // ---------- Parse Excel file ----------
    let excelEmails: string[] = [];
    let excelRows = 0;

    if (excelFile && excelFile.size > 0) {
      try {
        const buffer = Buffer.from(await excelFile.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);
        excelRows = jsonData.length;

        excelEmails = jsonData
          .map((row: ExcelRow) => {
            const emailKey = Object.keys(row).find(
              (key: string) => key.toLowerCase().trim() === 'email'
            );
            if (emailKey) {
              const emailValue = row[emailKey];
              const email =
                typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : null;
              return email && email.includes('@') ? email : null;
            }
            return null;
          })
          .filter(
            (email: string | null): email is string =>
              email !== null && email !== '' && email.includes('@')
          );

        console.log(`📧 Found ${excelEmails.length} emails from Excel`);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        return NextResponse.json(
          { error: 'Failed to parse Excel file' },
          { status: 400 }
        );
      }
    }

    // ---------- Merge & dedupe emails ----------
    const allEmails = [...dbEmails, ...excelEmails];
    const uniqueEmails = [...new Set(allEmails)];
    const duplicatesRemoved = allEmails.length - uniqueEmails.length;

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found' },
        { status: 400 }
      );
    }

    // ---------- Process PDF attachment ----------
    let pdfBuffer: Buffer | null = null;
    let pdfFileName: string | null = null;

    if (pdfFile && pdfFile.size > 0) {
      try {
        if (pdfFile.size > 20 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'PDF file size exceeds 20MB limit' },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        pdfBuffer = buffer;
        pdfFileName = pdfFile.name;
        console.log(`📄 PDF file loaded: ${pdfFileName} (${Math.round(buffer.length / 1024)} KB)`);
      } catch (error) {
        console.error('Error reading PDF:', error);
        return NextResponse.json(
          { error: 'Failed to read PDF file' },
          { status: 400 }
        );
      }
    }

    // ---------- Build the attachments array ----------
    const attachments: MailAttachment[] = [];

    // Add PDF attachment if present
    if (pdfBuffer && pdfFileName) {
      attachments.push({
        filename: pdfFileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
        contentDisposition: 'attachment',
      });
      console.log(`📎 PDF attachment queued: ${pdfFileName}`);
    }

    // Add Image attachment if present (as inline image)
    let imageCid: string | null = null;
    if (imageBuffer && imageFilename && imageMimeType) {
      imageCid = `image_${Date.now()}`;
      attachments.push({
        filename: imageFilename,
        content: imageBuffer,
        contentType: imageMimeType,
        contentDisposition: 'inline',
        cid: imageCid,
      });
      console.log(`🖼️ Image attachment queued: ${imageFilename} (cid: ${imageCid})`);
    }

    // ---------- Send emails in BCC chunks ----------
    let sentCount = 0;
    let failedEmails: string[] = [];

    try {
      const BCC_LIMIT = 50;
      const emailChunks: string[][] = [];

      for (let i = 0; i < uniqueEmails.length; i += BCC_LIMIT) {
        emailChunks.push(uniqueEmails.slice(i, i + BCC_LIMIT));
      }

      console.log(`📧 Sending to ${uniqueEmails.length} recipients in ${emailChunks.length} chunk(s)`);

      let totalSent = 0;
      const failedInChunks: string[] = [];

      for (let i = 0; i < emailChunks.length; i++) {
        const chunk = emailChunks[i];
        try {
          console.log(`📤 Sending chunk ${i + 1}/${emailChunks.length}`);

          const chunkTransporter = createTransporter();

          if (!chunkTransporter) {
            throw new Error('Failed to create email transporter');
          }

          // Escape message for HTML (prevent XSS) - using const
          const escapedMessage = message.replace(/&/g, '&amp;')
                                        .replace(/</g, '&lt;')
                                        .replace(/>/g, '&gt;')
                                        .replace(/"/g, '&quot;')
                                        .replace(/\n/g, '<br>');

          // Build HTML message with image if available
          const imageHtml = imageCid && imageUrl ? `
              <div style="text-align: center; margin: 20px 0 30px 0;">
                <img src="cid:${imageCid}" alt="Broadcast Image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
              </div>
            ` : '';

          const mailOptions: MailOptions = {
            from: `"DreamMore" <${process.env.EMAIL_USER}>`,
            subject: subject,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DreamMore</title>
  <style>
    .dreammore-title {
      font-size: 48px;
      font-weight: 800;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .dreammore-title .letter-d {
      color: #E26A25;
      display: inline-block;
      text-shadow: 0 2px 4px rgba(226, 106, 37, 0.2);
    }
    .dreammore-title .rest {
      color: #2E3641;
    }
    .tagline {
      font-size: 18px;
      font-weight: 600;
      color: #E26A25;
      letter-spacing: 0.5px;
      font-style: italic;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .message-content {
      font-size: 16px;
      line-height: 1.9;
      color: #2E3641;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .message-content p {
      margin: 0 0 12px 0;
    }
    .attachment-box {
      margin-top: 30px;
      padding: 20px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      text-align: center;
    }
    .image-container {
      text-align: center;
      margin: 20px 0 30px 0;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.05);">
          <!-- Brand Header -->
          <tr>
            <td style="padding: 50px 40px 30px 40px; text-align: center; border-bottom: 4px solid #E26A25; background: linear-gradient(180deg, #ffffff 0%, #fafaf8 100%);">
              <div class="dreammore-title">
                <span class="letter-d">D</span><span class="rest">reamMore</span>
              </div>
              <div class="tagline">
                Right work at right time
              </div>
            </td>
          </tr>
          <!-- Image (if attached) -->
          ${imageHtml}
          <!-- Message Body -->
          <tr>
            <td style="padding: 45px 40px;">
              <div class="message-content">
                ${escapedMessage}
              </div>
              ${pdfFileName ? `
                <div class="attachment-box">
                  <p style="margin: 0; font-size: 14px; color: #166534;">
                    📄 <strong>Attachment:</strong> ${pdfFileName}
                  </p>
                </div>
              ` : ''}
              ${imageFilename ? `
                <div style="margin-top: 15px; padding: 10px 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #0369a1;">
                    🖼️ Image: ${imageFilename}
                  </p>
                </div>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="font-size: 13px; color: #9ca3af; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                This email was sent from DreamMore Admin Panel
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                &copy; ${new Date().getFullYear()} DreamMore. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #d1d5db; margin: 8px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                For support: support@dreammoredigitals.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `,
            text: `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗ ██████╗ ███████╗ █████╗ ███╗   ███╗███╗   ███╗  ║
║   ██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗ ████║████╗ ████║  ║
║   ██║  ██║██████╔╝█████╗  ███████║██╔████╔██║██╔████╔██║  ║
║   ██║  ██║██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║██║╚██╔╝██║  ║
║   ██████╔╝██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║ ╚═╝ ██║  ║
║   ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝  ║
║                                                              ║
║              Right work at right time                        ║
╚══════════════════════════════════════════════════════════════╝

${message}

${imageFilename ? `\n---\n🖼️ Image: ${imageFilename}\n` : ''}
${pdfFileName ? `\n---\n📄 Attachment: ${pdfFileName}\n` : ''}

---
For support: support@dreammoredigitals.com
© ${new Date().getFullYear()} DreamMore. All rights reserved.
            `,
            bcc: chunk,
          };

          if (attachments.length > 0) {
            mailOptions.attachments = attachments;
          }

          await chunkTransporter.sendMail(mailOptions);
          totalSent += chunk.length;
          console.log(`✅ Chunk ${i + 1} sent`);

          chunkTransporter.close();
        } catch (chunkError) {
          console.error(`❌ Error in chunk ${i + 1}:`, chunkError);
          failedInChunks.push(...chunk);
        }

        if (i < emailChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      sentCount = totalSent;
      failedEmails = failedInChunks;

      console.log(`✅ Broadcast complete: ${sentCount} sent, ${failedEmails.length} failed`);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return NextResponse.json(
        { error: 'Failed to send broadcast emails' },
        { status: 500 }
      );
    }

    // ---------- Log the broadcast ----------
    try {
      client = await pool.connect();

      // Ensure broadcast_logs table exists with all required columns
      await client.query(`
        CREATE TABLE IF NOT EXISTS broadcast_logs (
          id SERIAL PRIMARY KEY,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          course_filter VARCHAR(100),
          recipient_count INTEGER,
          sent_count INTEGER,
          failed_emails TEXT,
          total_emails INTEGER,
          from_database INTEGER,
          from_excel INTEGER,
          duplicates_removed INTEGER,
          pdf_attached BOOLEAN DEFAULT FALSE,
          pdf_name VARCHAR(255),
          image_attached BOOLEAN DEFAULT FALSE,
          image_name VARCHAR(255),
          image_url TEXT,
          target_type VARCHAR(50) DEFAULT 'users',
          target_filter VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check and add missing columns if needed
      const columnsToCheck = ['image_attached', 'image_name', 'image_url'];
      for (const col of columnsToCheck) {
        const checkColumnQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'broadcast_logs' 
          AND column_name = $1
        `;
        const columnCheck = await client.query(checkColumnQuery, [col]);
        
        if (columnCheck.rows.length === 0) {
          let alterQuery = '';
          if (col === 'image_attached') {
            alterQuery = `ALTER TABLE broadcast_logs ADD COLUMN image_attached BOOLEAN DEFAULT FALSE`;
          } else if (col === 'image_name') {
            alterQuery = `ALTER TABLE broadcast_logs ADD COLUMN image_name VARCHAR(255)`;
          } else if (col === 'image_url') {
            alterQuery = `ALTER TABLE broadcast_logs ADD COLUMN image_url TEXT`;
          }
          await client.query(alterQuery);
          console.log(`✅ Added ${col} column to broadcast_logs`);
        }
      }

      // Determine target type and filter for logging
      let targetType = 'users';
      let targetFilter = 'all';

      if (sendType === 'service' && !userFilter) {
        targetType = 'service_users';
        targetFilter = 'all';
      } else if (sendType === 'service' && userFilter) {
        targetType = 'service_users';
        targetFilter = userFilter;
      } else if (sendType === 'user' && userFilter) {
        targetType = 'users';
        targetFilter = userFilter;
      } else if (sendType === 'course' && courseFilter && courseFilter !== 'all') {
        targetType = 'users';
        targetFilter = `course:${courseFilter}`;
      } else {
        targetType = 'users';
        targetFilter = 'all';
      }

      await client.query(
        `INSERT INTO broadcast_logs 
         (subject, message, course_filter, recipient_count, sent_count, failed_emails, total_emails, 
          from_database, from_excel, duplicates_removed, pdf_attached, pdf_name, 
          image_attached, image_name, image_url, target_type, target_filter, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)`,
        [
          subject,
          message,
          courseFilter || 'all',
          uniqueEmails.length,
          sentCount,
          JSON.stringify(failedEmails),
          uniqueEmails.length,
          dbEmails.length,
          excelEmails.length,
          duplicatesRemoved,
          !!pdfFileName,
          pdfFileName,
          !!imageFilename,
          imageFilename,
          imageUrl,
          targetType,
          targetFilter,
        ]
      );

      console.log(`✅ Broadcast logged`);
    } catch (dbError) {
      console.error('Failed to log broadcast:', dbError);
    } finally {
      if (client) {
        client.release();
      }
    }

    return NextResponse.json({
      success: true,
      message:
        sentCount > 0
          ? `Broadcast sent to ${sentCount} of ${uniqueEmails.length} recipients${
              pdfFileName ? ` with PDF attachment: ${pdfFileName}` : ''
            }${imageFilename ? ` with image: ${imageFilename}` : ''}`
          : `Broadcast failed to send to any recipients`,
      sentCount,
      totalRecipients: uniqueEmails.length,
      details: {
        fromDatabase: dbEmails.length,
        fromExcel: excelEmails.length,
        duplicatesRemoved: duplicatesRemoved,
        totalUsersInDatabase: dbUserCount,
        excelRows: excelRows,
        pdfAttached: !!pdfFileName,
        pdfName: pdfFileName || null,
        imageAttached: !!imageFilename,
        imageName: imageFilename || null,
        imageUrl: imageUrl || null,
        targetType: targetTable,
        targetFilter: sendType === 'course' ? courseFilter : (userFilter || 'all'),
      },
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}