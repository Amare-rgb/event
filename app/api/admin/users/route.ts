import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET handler - Fetch all users
export async function GET() {
  let client;
  
  try {
    console.log('GET /api/admin/users - Fetching users...');
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        gender,
        course, 
        experience, 
        registered_at 
      FROM users 
      ORDER BY registered_at DESC`
    );
    
    client.release();
    
    return NextResponse.json({ 
      users: result.rows,
      count: result.rows.length 
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { message: 'Error fetching users', error: String(error) },
      { status: 500 }
    );
  }
}

// POST handler - Register new user
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, gender, course, experience } = body;

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

    // Validation - Course (required)
    if (!course || !course.trim()) {
      return NextResponse.json(
        { message: 'Please select a course' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check if phone number already exists
    const checkPhone = await client.query(
      'SELECT id FROM users WHERE phone = $1',
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
    if (email) {
      const checkEmail = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (checkEmail.rows.length > 0) {
        client.release();
        return NextResponse.json(
          { message: 'This email is already registered' },
          { status: 400 }
        );
      }
    }

    // Insert new user with gender
    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, address, gender, course, experience, registered_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [firstName, lastName, email || null, phone, address, gender, course, experience || '']
    );
    
    client.release();

    return NextResponse.json(
      { 
        message: 'Registration successful! Welcome to DreamMore!', 
        userId: result.rows[0].id 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}