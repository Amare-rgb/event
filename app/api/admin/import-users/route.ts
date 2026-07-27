import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';
import { PoolClient } from 'pg';

// Define types
interface ExcelRow {
  email?: string;
  first_name?: string;
  last_name?: string;
  course?: string;
  phone?: string;
  address?: string;
  gender?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface ImportUser {
  email: string;
  first_name?: string;
  last_name?: string;
  course?: string;
  phone?: string;
  address?: string;
  gender?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let client: PoolClient | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const importType = formData.get('importType') as string || 'users';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const validTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { error: 'Please upload a valid Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    const headers = Object.keys(jsonData[0] || {});
    console.log('📋 Excel Headers:', headers);
    console.log(`📋 Import Type: ${importType}`);

    const users: ImportUser[] = [];

    for (const row of jsonData) {
      const emailKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'email' ||
                 key.toLowerCase().trim() === 'email address' ||
                 key.toLowerCase().trim() === 'email_address'
      );

      if (!emailKey) {
        console.log('⚠️ Skipping row - no email column found:', row);
        continue;
      }

      const email = row[emailKey]?.toString().trim().toLowerCase();
      
      if (!email || !email.includes('@')) {
        console.log('⚠️ Skipping row - invalid email:', email);
        continue;
      }

      const courseKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'course' ||
                 key.toLowerCase().trim() === 'courses' ||
                 key.toLowerCase().trim() === 'course name' ||
                 key.toLowerCase().trim() === 'course_name' ||
                 key.toLowerCase().trim() === 'class' ||
                 key.toLowerCase().trim() === 'program'
      );

      const firstNameKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'first_name' || 
                 key.toLowerCase().trim() === 'firstname' ||
                 key.toLowerCase().trim() === 'first name' ||
                 key.toLowerCase().trim() === 'first'
      );
      const lastNameKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'last_name' || 
                 key.toLowerCase().trim() === 'lastname' ||
                 key.toLowerCase().trim() === 'last name' ||
                 key.toLowerCase().trim() === 'last'
      );
      const phoneKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'phone' || 
                 key.toLowerCase().trim() === 'phone number' ||
                 key.toLowerCase().trim() === 'phone_number' ||
                 key.toLowerCase().trim() === 'mobile' ||
                 key.toLowerCase().trim() === 'contact'
      );
      const addressKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'address' ||
                 key.toLowerCase().trim() === 'addresses'
      );
      const genderKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'gender'
      );

      let courseValue = courseKey ? row[courseKey]?.toString().trim() : undefined;
      
      if (!courseValue) {
        const possibleCourseKeys = ['training', 'subject', 'major', 'department', 'field'];
        for (const key of possibleCourseKeys) {
          const foundKey = Object.keys(row).find(
            (k) => k.toLowerCase().trim() === key
          );
          if (foundKey) {
            const value = row[foundKey]?.toString().trim();
            if (value) {
              courseValue = value;
              console.log(`📚 Found course from column "${foundKey}": ${courseValue}`);
              break;
            }
          }
        }
      }
      
      if (!courseValue) {
        courseValue = 'Not Specified';
        console.log(`⚠️ No course found for ${email}, using default: ${courseValue}`);
      }

      courseValue = courseValue.replace(/\s+/g, ' ').trim();

      const user: ImportUser = {
        email,
        first_name: firstNameKey ? row[firstNameKey]?.toString().trim() : undefined,
        last_name: lastNameKey ? row[lastNameKey]?.toString().trim() : undefined,
        course: courseValue,
        phone: phoneKey ? row[phoneKey]?.toString().trim() : undefined,
        address: addressKey ? row[addressKey]?.toString().trim() : undefined,
        gender: genderKey ? row[genderKey]?.toString().trim() : undefined,
      };

      users.push(user);
      console.log(`✅ Parsed user: ${user.email} - Course: ${user.course}`);
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No valid users found in Excel. Required column: email' },
        { status: 400 }
      );
    }

    console.log(`📊 Total users parsed: ${users.length}`);

    client = await pool.connect();

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const importedUsers: string[] = [];
    const updatedUsers: string[] = [];
    const skippedUsers: string[] = [];

    if (importType === 'serviceUsers') {
      // ===== IMPORT TO SERVICE_USERS TABLE =====

      // Ensure service_users table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS service_users (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          address TEXT,
          gender VARCHAR(20),
          course VARCHAR(255),
          experience TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Make sure columns are nullable
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_users' AND column_name = 'first_name' AND is_nullable = 'NO') THEN
            ALTER TABLE service_users ALTER COLUMN first_name DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_users' AND column_name = 'last_name' AND is_nullable = 'NO') THEN
            ALTER TABLE service_users ALTER COLUMN last_name DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_users' AND column_name = 'phone' AND is_nullable = 'NO') THEN
            ALTER TABLE service_users ALTER COLUMN phone DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_users' AND column_name = 'address' AND is_nullable = 'NO') THEN
            ALTER TABLE service_users ALTER COLUMN address DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_users' AND column_name = 'gender' AND is_nullable = 'NO') THEN
            ALTER TABLE service_users ALTER COLUMN gender DROP NOT NULL;
          END IF;
        END $$;
      `);
      console.log('✅ Service users table schema updated');

      for (const user of users) {
        try {
          // Check if service user exists
          const checkQuery = 'SELECT id, email FROM service_users WHERE email = $1';
          const checkResult = await client.query(checkQuery, [user.email]);

          if (checkResult.rows.length > 0) {
            // Update existing service user
            const updateFields: string[] = [];
            const updateValues: (string | null)[] = [];
            let paramCounter = 1;

            if (user.first_name !== undefined) {
              updateFields.push(`first_name = $${paramCounter}`);
              updateValues.push(user.first_name || null);
              paramCounter++;
            }
            if (user.last_name !== undefined) {
              updateFields.push(`last_name = $${paramCounter}`);
              updateValues.push(user.last_name || null);
              paramCounter++;
            }
            if (user.course !== undefined) {
              updateFields.push(`course = $${paramCounter}`);
              updateValues.push(user.course || null);
              paramCounter++;
            }
            if (user.phone !== undefined) {
              updateFields.push(`phone = $${paramCounter}`);
              updateValues.push(user.phone || null);
              paramCounter++;
            }
            if (user.address !== undefined) {
              updateFields.push(`address = $${paramCounter}`);
              updateValues.push(user.address || null);
              paramCounter++;
            }
            if (user.gender !== undefined) {
              updateFields.push(`gender = $${paramCounter}`);
              updateValues.push(user.gender || null);
              paramCounter++;
            }

            if (updateFields.length > 0) {
              updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
              updateValues.push(user.email);
              
              const updateQuery = `
                UPDATE service_users 
                SET ${updateFields.join(', ')}
                WHERE email = $${paramCounter}
                RETURNING id
              `;
              
              const result = await client.query(updateQuery, updateValues);
              if (result.rows.length > 0) {
                updated++;
                updatedUsers.push(user.email);
                console.log(`✅ Updated service user: ${user.email}`);
              } else {
                skipped++;
                skippedUsers.push(user.email);
              }
            } else {
              updated++;
              updatedUsers.push(user.email);
            }
          } else {
            // Insert new service user directly (NO link to users table)
            const insertFields: string[] = ['email', 'status', 'registered_at', 'created_at', 'updated_at'];
            const insertValues: (string | null)[] = [user.email, 'active'];
            const placeholders: string[] = ['$1', '$2', 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP'];
            let paramCounter = 3;

            if (user.first_name !== undefined) {
              insertFields.push('first_name');
              insertValues.push(user.first_name || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.last_name !== undefined) {
              insertFields.push('last_name');
              insertValues.push(user.last_name || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.course !== undefined) {
              insertFields.push('course');
              insertValues.push(user.course || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.phone !== undefined) {
              insertFields.push('phone');
              insertValues.push(user.phone || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.address !== undefined) {
              insertFields.push('address');
              insertValues.push(user.address || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.gender !== undefined) {
              insertFields.push('gender');
              insertValues.push(user.gender || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }

            const insertQuery = `
              INSERT INTO service_users (user_id, ${insertFields.join(', ')})
              VALUES (NULL, ${placeholders.join(', ')})
              RETURNING id
            `;

            const allValues = insertValues;
            const result = await client.query(insertQuery, allValues);
            
            if (result.rows.length > 0) {
              imported++;
              importedUsers.push(user.email);
              console.log(`✅ Imported service user: ${user.email}`);
            } else {
              skipped++;
              skippedUsers.push(user.email);
            }
          }
        } catch (error) {
          skipped++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to import ${user.email}: ${errorMsg}`);
          skippedUsers.push(user.email);
          console.error(`❌ Error importing ${user.email}:`, error);
        }
      }

    } else {
      // ===== IMPORT TO USERS TABLE (Regular Users) =====

      // Ensure the course column exists in users table
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'course'
          ) THEN
            ALTER TABLE users ADD COLUMN course VARCHAR(255);
          END IF;
          
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'course' AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE users ALTER COLUMN course DROP NOT NULL;
          END IF;
        END $$;
      `);

      // Make sure other columns are nullable
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address' AND is_nullable = 'NO') THEN
            ALTER TABLE users ALTER COLUMN address DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone' AND is_nullable = 'NO') THEN
            ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name' AND is_nullable = 'NO') THEN
            ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name' AND is_nullable = 'NO') THEN
            ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender' AND is_nullable = 'NO') THEN
            ALTER TABLE users ALTER COLUMN gender DROP NOT NULL;
          END IF;
        END $$;
      `);
      console.log('✅ Users table schema updated');

      for (const user of users) {
        try {
          // Check if user exists
          const checkQuery = 'SELECT id, email, course FROM users WHERE email = $1';
          const checkResult = await client.query(checkQuery, [user.email]);

          if (checkResult.rows.length > 0) {
            // Update existing user
            const updateFields: string[] = [];
            const updateValues: (string | null)[] = [];
            let paramCounter = 1;

            if (user.first_name !== undefined) {
              updateFields.push(`first_name = $${paramCounter}`);
              updateValues.push(user.first_name || null);
              paramCounter++;
            }
            if (user.last_name !== undefined) {
              updateFields.push(`last_name = $${paramCounter}`);
              updateValues.push(user.last_name || null);
              paramCounter++;
            }
            if (user.course !== undefined) {
              updateFields.push(`course = $${paramCounter}`);
              updateValues.push(user.course || null);
              paramCounter++;
            }
            if (user.phone !== undefined) {
              updateFields.push(`phone = $${paramCounter}`);
              updateValues.push(user.phone || null);
              paramCounter++;
            }
            if (user.address !== undefined) {
              updateFields.push(`address = $${paramCounter}`);
              updateValues.push(user.address || null);
              paramCounter++;
            }
            if (user.gender !== undefined) {
              updateFields.push(`gender = $${paramCounter}`);
              updateValues.push(user.gender || null);
              paramCounter++;
            }

            if (updateFields.length > 0) {
              updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
              updateValues.push(user.email);
              
              const updateQuery = `
                UPDATE users 
                SET ${updateFields.join(', ')}
                WHERE email = $${paramCounter}
                RETURNING id
              `;
              
              const result = await client.query(updateQuery, updateValues);
              if (result.rows.length > 0) {
                updated++;
                updatedUsers.push(user.email);
                console.log(`✅ Updated user: ${user.email} - Course: ${user.course}`);
              } else {
                skipped++;
                skippedUsers.push(user.email);
              }
            } else {
              updated++;
              updatedUsers.push(user.email);
            }
          } else {
            // Insert new user
            const insertFields: string[] = ['email', 'user_type', 'registered_at', 'created_at', 'updated_at'];
            const insertValues: (string | null)[] = [user.email, 'student'];
            const placeholders: string[] = ['$1', '$2', 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP'];
            let paramCounter = 3;

            if (user.first_name !== undefined) {
              insertFields.push('first_name');
              insertValues.push(user.first_name || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.last_name !== undefined) {
              insertFields.push('last_name');
              insertValues.push(user.last_name || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.course !== undefined) {
              insertFields.push('course');
              insertValues.push(user.course || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.phone !== undefined) {
              insertFields.push('phone');
              insertValues.push(user.phone || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.address !== undefined) {
              insertFields.push('address');
              insertValues.push(user.address || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }
            if (user.gender !== undefined) {
              insertFields.push('gender');
              insertValues.push(user.gender || null);
              placeholders.push(`$${paramCounter}`);
              paramCounter++;
            }

            const insertQuery = `
              INSERT INTO users (${insertFields.join(', ')})
              VALUES (${placeholders.join(', ')})
              RETURNING id
            `;

            const result = await client.query(insertQuery, insertValues);
            if (result.rows.length > 0) {
              imported++;
              importedUsers.push(user.email);
              console.log(`✅ Imported user: ${user.email} - Course: ${user.course}`);
            } else {
              skipped++;
              skippedUsers.push(user.email);
            }
          }
        } catch (error) {
          skipped++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to import ${user.email}: ${errorMsg}`);
          skippedUsers.push(user.email);
          console.error(`❌ Error importing ${user.email}:`, error);
        }
      }
    }

    // Build response message
    const statusParts = [];
    if (imported > 0) statusParts.push(`${imported} new ${importType === 'serviceUsers' ? 'service users' : 'users'} imported`);
    if (updated > 0) statusParts.push(`${updated} existing ${importType === 'serviceUsers' ? 'service users' : 'users'} updated`);
    if (skipped > 0) statusParts.push(`${skipped} ${importType === 'serviceUsers' ? 'service users' : 'users'} skipped`);
    
    let message = `✅ Import completed: ${statusParts.join(', ')}`;
    
    const importedCourses = users
      .filter(u => u.course && u.course !== 'Not Specified')
      .map(u => u.course);
    const uniqueImportedCourses = [...new Set(importedCourses)];
    
    if (uniqueImportedCourses.length > 0) {
      message += ` 📚 Courses in Excel: ${uniqueImportedCourses.join(', ')}`;
    }

    return NextResponse.json({
      success: true,
      message: message,
      imported,
      updated,
      skipped,
      total: users.length,
      importedUsers,
      updatedUsers,
      skippedUsers,
      importType,
      coursesFromExcel: uniqueImportedCourses,
      note: importType === 'serviceUsers' 
        ? 'Service users imported to service_users table'
        : 'Users imported to users table with user_type = student',
      errors: errors.length > 0 ? errors : undefined,
      details: {
        newUsers: imported,
        updatedUsers: updated,
        skippedUsers: skipped,
        totalProcessed: users.length,
        coursesFoundInExcel: uniqueImportedCourses.length
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import users. Please try again.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}