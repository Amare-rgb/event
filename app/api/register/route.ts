// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';
import { PoolClient } from '@neondatabase/serverless';

// Define error type
interface DatabaseError {
  code?: string;
  detail?: string;
  message: string;
  stack?: string;
}

export async function POST(request: NextRequest) {
  let client: PoolClient | null = null;

  try {
    // 0. Fail fast if DATABASE_URL isn't configured on this environment
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in this environment');
      return NextResponse.json(
        { message: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // 1. Database tables መኖራቸውን ማረጋገጥ
    if (typeof initDatabase === 'function') {
      try {
        await initDatabase();
      } catch (initErr) {
        console.error('❌ initDatabase() failed:', initErr);
        return NextResponse.json(
          { message: 'Database initialization failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    const body = await request.json();
    console.log('📝 Received registration data:', body);

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      gender,
      course,
      serviceId,
      userType,
      organization,
      experience,
    } = body;

    // Validation - First Name
    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }
    if (!/^[A-Za-z\s]+$/.test(firstName.trim())) {
      return NextResponse.json(
        { message: 'First name should only contain letters' },
        { status: 400 }
      );
    }

    // Validation - Last Name
    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }
    if (!/^[A-Za-z\s]+$/.test(lastName.trim())) {
      return NextResponse.json(
        { message: 'Last name should only contain letters' },
        { status: 400 }
      );
    }

    // Validation - Email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Email address is required' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validation - Phone
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!/^[\+\d\s\-()]{7,20}$/.test(phone.trim())) {
      return NextResponse.json(
        { message: 'Please enter a valid phone number (7-20 digits)' },
        { status: 400 }
      );
    }

    // Validation - Address
    if (!address || !address.trim()) {
      return NextResponse.json(
        { message: 'Address is required' },
        { status: 400 }
      );
    }

    // Validation - Gender
    if (!gender || !gender.trim()) {
      return NextResponse.json(
        { message: 'Please select your gender' },
        { status: 400 }
      );
    }

    // User Type Normalization (Handles 'Student', 'student', 'service', 'Service User')
    const normalizedUserType = userType ? String(userType).toLowerCase().trim() : '';
    const isStudent = normalizedUserType === 'student';
    const isService =
      normalizedUserType === 'service' ||
      normalizedUserType === 'service user' ||
      normalizedUserType === 'service_user';

    if (!normalizedUserType || (!isStudent && !isService)) {
      return NextResponse.json(
        { message: 'Please select a valid user type' },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      client = await pool.connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    // Check if phone number already exists
    const checkPhoneUser = await client.query(
      'SELECT id FROM users WHERE phone = $1',
      [cleanPhone]
    );

    if (checkPhoneUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'This phone number is already registered' },
        { status: 400 }
      );
    }

    const checkPhoneService = await client.query(
      'SELECT id FROM service_users WHERE phone = $1',
      [cleanPhone]
    );

    if (checkPhoneService.rows.length > 0) {
      return NextResponse.json(
        { message: 'This phone number is already registered as a service user' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (cleanEmail) {
      const checkEmailUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [cleanEmail]
      );

      if (checkEmailUser.rows.length > 0) {
        return NextResponse.json(
          { message: 'This email is already registered' },
          { status: 400 }
        );
      }

      const checkEmailService = await client.query(
        'SELECT id FROM service_users WHERE email = $1',
        [cleanEmail]
      );

      if (checkEmailService.rows.length > 0) {
        return NextResponse.json(
          { message: 'This email is already registered as a service user' },
          { status: 400 }
        );
      }
    }

    let result;
    let userId;

    if (isStudent) {
      // ===== STUDENT REGISTRATION =====
      console.log('📝 Registering student...');

      const courseValue =
        course && course.trim() && course !== 'none' ? course.trim() : null;

      const insertQuery = `
        INSERT INTO users (
          first_name, 
          last_name, 
          email, 
          phone, 
          address, 
          gender, 
          course, 
          experience, 
          user_type, 
          status,
          registered_at, 
          created_at, 
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING id
      `;

      const insertValues = [
        firstName.trim(),
        lastName.trim(),
        cleanEmail,
        cleanPhone,
        address.trim(),
        gender.trim(),
        courseValue,
        experience?.trim() || null,
        'student',
        'active',
      ];

      result = await client.query(insertQuery, insertValues);
      userId = result.rows[0].id;

      console.log('✅ Student registered successfully with ID:', userId);

      return NextResponse.json(
        {
          success: true,
          message: 'Student registration successful! Welcome to DreamMore!',
          userId: userId,
          userType: 'student',
        },
        { status: 201 }
      );
    } else if (isService) {
      // ===== SERVICE USER REGISTRATION =====
      console.log('📝 Registering service user...');

      if (!serviceId || serviceId === 'none') {
        return NextResponse.json(
          { message: 'Please select a service' },
          { status: 400 }
        );
      }

      const parsedServiceId = parseInt(serviceId, 10);
      if (Number.isNaN(parsedServiceId)) {
        return NextResponse.json(
          { message: 'Invalid service selected' },
          { status: 400 }
        );
      }

      if (!organization || !organization.trim()) {
        return NextResponse.json(
          { message: 'Organization name is required for service users' },
          { status: 400 }
        );
      }

      const serviceResult = await client.query(
        'SELECT name, category, id FROM services WHERE id = $1',
        [parsedServiceId]
      );

      if (!serviceResult.rows || serviceResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'Selected service not found' },
          { status: 400 }
        );
      }

      const serviceName = serviceResult.rows[0].name;
      const serviceCategory = serviceResult.rows[0].category;

      const insertQuery = `
        INSERT INTO service_users (
          user_id, 
          first_name, 
          last_name, 
          email, 
          phone, 
          address, 
          gender, 
          course, 
          organization, 
          experience, 
          status, 
          registered_at, 
          created_at, 
          updated_at
        ) 
        VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING id
      `;

      const insertValues = [
        firstName.trim(),
        lastName.trim(),
        cleanEmail,
        cleanPhone,
        address.trim(),
        gender.trim(),
        serviceName,
        organization.trim(),
        experience?.trim() || null,
        'active',
      ];

      result = await client.query(insertQuery, insertValues);
      const serviceUserId = result.rows[0].id;

      console.log('✅ Service user registered successfully with ID:', serviceUserId);

      return NextResponse.json(
        {
          success: true,
          message: 'Service user registration successful! Welcome to DreamMore!',
          serviceUserId: serviceUserId,
          serviceName: serviceName,
          serviceCategory: serviceCategory,
          organization: organization.trim(),
          userType: 'service',
        },
        { status: 201 }
      );
    }

    // Should be unreachable given the validation above, but keep TS/runtime happy
    return NextResponse.json(
      { message: 'Please select a valid user type' },
      { status: 400 }
    );
  } catch (error: unknown) {
    // Type guard to check if error has the expected properties
    const isDatabaseError = (err: unknown): err is DatabaseError => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    console.error('❌ Registration error details:', {
      message: isDatabaseError(error) ? error.message : 'Unknown error',
      stack: isDatabaseError(error) ? error.stack : undefined,
      code: isDatabaseError(error) && 'code' in error ? (error as DatabaseError).code : undefined,
      detail: isDatabaseError(error) && 'detail' in error ? (error as DatabaseError).detail : undefined,
    });

    // Check for PostgreSQL unique violation error
    if (isDatabaseError(error) && 'code' in error && error.code === '23505') {
      const detail = (error as DatabaseError).detail || '';
      if (detail.includes('phone')) {
        return NextResponse.json(
          { message: 'This phone number is already registered' },
          { status: 400 }
        );
      } else if (detail.includes('email')) {
        return NextResponse.json(
          { message: 'This email is already registered' },
          { status: 400 }
        );
      }
    }

    // Check for undefined table / column errors (schema mismatch — very common
    // cause right after a fresh Vercel + Neon deploy if migrations weren't run)
    if (isDatabaseError(error) && 'code' in error) {
      const code = (error as DatabaseError).code;
      if (code === '42P01') {
        // undefined_table
        return NextResponse.json(
          {
            message:
              'Registration failed. Please try again later.',
            // Remove this debugHint before shipping to real users —
            // it's here only so you can see the cause in the Network tab
            // while debugging.
            debugHint:
              'Postgres error 42P01: a table used by this route does not exist. Your migrations likely have not run against the production database.',
          },
          { status: 500 }
        );
      }
      if (code === '42703') {
        // undefined_column
        return NextResponse.json(
          {
            message: 'Registration failed. Please try again later.',
            debugHint:
              'Postgres error 42703: a column used by this route does not exist. Schema is out of sync with this code — run your migrations against production.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed. Please try again later.',
        // TEMPORARY while debugging — remove once the real cause is fixed.
        debugMessage: isDatabaseError(error) ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        client.release();
        console.log('✅ Database client released');
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}