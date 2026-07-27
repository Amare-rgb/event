import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
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
      experience 
    } = body;

    console.log('📝 Registration data:', { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      gender, 
      course: course || 'None',
      serviceId: serviceId || 'None',
      userType,
      organization: organization || 'None',
      experience 
    });

    // Validation - First Name (only letters)
    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }
    if (!/^[A-Za-z\s]+$/.test(firstName)) {
      return NextResponse.json(
        { message: 'First name should only contain letters' },
        { status: 400 }
      );
    }

    // Validation - Last Name (only letters)
    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }
    if (!/^[A-Za-z\s]+$/.test(lastName)) {
      return NextResponse.json(
        { message: 'Last name should only contain letters' },
        { status: 400 }
      );
    }

    // Validation - Email (optional but validate if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validation - Phone (required)
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!/^[\+\d\s\-()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { message: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validation - Address (required)
    if (!address || !address.trim()) {
      return NextResponse.json(
        { message: 'Address is required' },
        { status: 400 }
      );
    }

    // Validation - Gender (required)
    if (!gender || !gender.trim()) {
      return NextResponse.json(
        { message: 'Please select your gender' },
        { status: 400 }
      );
    }

    // Validation - User Type (required)
    if (!userType || !userType.trim()) {
      return NextResponse.json(
        { message: 'Please select user type' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Check if phone number already exists
    const checkPhone = await client.query(
      'SELECT id FROM service_users WHERE phone = $1',
      [phone]
    );
    
    if (checkPhone.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { message: 'This phone number is already registered' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email && email.trim()) {
      const checkEmail = await client.query(
        'SELECT id FROM service_users WHERE email = $1',
        [email.trim()]
      );
      
      if (checkEmail.rows.length > 0) {
        client.release();
        return NextResponse.json(
          { message: 'This email is already registered' },
          { status: 400 }
        );
      }
    }

    let result;
    let userId;

    if (userType === 'student') {
      // ===== STUDENT REGISTRATION =====
      // Insert only into users table
      const courseValue = course && course.trim() && course !== 'none' ? course.trim() : '';
      
      result = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, address, gender, course, experience, user_type, registered_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) 
         RETURNING id`,
        [
          firstName.trim(), 
          lastName.trim(), 
          email?.trim() || null, 
          phone.trim(), 
          address.trim(), 
          gender, 
          courseValue, 
          experience?.trim() || '',
          'student'
        ]
      );
      
      userId = result.rows[0].id;
      
      console.log('✅ Student registered successfully with ID:', userId);

      client.release();

      return NextResponse.json(
        { 
          success: true,
          message: 'Student registration successful! Welcome to DreamMore!', 
          userId: userId,
          userType: 'student'
        },
        { status: 201 }
      );

    } else if (userType === 'service') {
      // ===== SERVICE USER REGISTRATION =====
      
      // Validate service selection
      if (!serviceId || serviceId === 'none') {
        client.release();
        return NextResponse.json(
          { message: 'Please select a service' },
          { status: 400 }
        );
      }

      // Validate organization for service users
      if (!organization || !organization.trim()) {
        client.release();
        return NextResponse.json(
          { message: 'Organization name is required for service users' },
          { status: 400 }
        );
      }

      // Get the service details from the services table
      const serviceResult = await client.query(
        'SELECT name, category, id FROM services WHERE id = $1',
        [parseInt(serviceId)]
      );

      if (!serviceResult.rows || serviceResult.rows.length === 0) {
        client.release();
        return NextResponse.json(
          { message: 'Selected service not found' },
          { status: 400 }
        );
      }

      const serviceName = serviceResult.rows[0].name;
      const serviceCategory = serviceResult.rows[0].category;
      const serviceIdNum = serviceResult.rows[0].id;

      // Insert into service_users table with organization field
      result = await client.query(
        `INSERT INTO service_users (user_id, first_name, last_name, email, phone, address, gender, course, organization, experience, status, registered_at) 
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) 
         RETURNING id`,
        [
          firstName.trim(), 
          lastName.trim(), 
          email?.trim() || null, 
          phone.trim(), 
          address.trim(), 
          gender, 
          serviceName, // Store the service name in course field
          organization.trim(), // Add organization
          experience?.trim() || '',
          'active'
        ]
      );
      
      const serviceUserId = result.rows[0].id;

      console.log('✅ Service user registered successfully with ID:', serviceUserId, 'Service:', serviceName, 'Category:', serviceCategory, 'Organization:', organization);

      client.release();

      return NextResponse.json(
        { 
          success: true,
          message: `Service user registration successful! Welcome to DreamMore!`, 
          serviceUserId: serviceUserId,
          serviceName: serviceName,
          serviceCategory: serviceCategory,
          organization: organization,
          userType: 'service'
        },
        { status: 201 }
      );

    } else {
      client.release();
      return NextResponse.json(
        { message: 'Invalid user type selected' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}