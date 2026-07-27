// app/api/admin/service-users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface ServiceUserRow {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  course: string;
  organization: string;
  experience: string;
  status: string;
  registered_at: Date;
  created_at: Date;
  updated_at: Date;
}

// GET - Fetch ALL service users
export async function GET(request: NextRequest) {
  let client;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseFilter = searchParams.get('course');
    const searchTerm = searchParams.get('search');
    const statusFilter = searchParams.get('status');

    console.log('GET /api/admin/service-users - Fetching ALL service users...');
    client = await pool.connect();
    
    let query = `
      SELECT 
        id, 
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
      FROM service_users
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramCounter = 1;

    if (courseFilter && courseFilter !== '') {
      conditions.push(`
        (
          course ILIKE $${paramCounter} 
          OR course ILIKE $${paramCounter + 1}
          OR course ILIKE $${paramCounter + 2}
          OR course = $${paramCounter + 3}
        )
      `);
      
      params.push(`${courseFilter},%`);
      params.push(`%, ${courseFilter},%`);
      params.push(`%, ${courseFilter}`);
      params.push(courseFilter);
      
      paramCounter += 4;
    }

    if (searchTerm && searchTerm !== '') {
      const searchConditions: string[] = [];
      const searchPattern = `%${searchTerm}%`;
      
      searchConditions.push(`first_name ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`last_name ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`email ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`phone ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`address ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`course ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      searchConditions.push(`organization ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;
      
      conditions.push(`(${searchConditions.join(' OR ')})`);
    }

    if (statusFilter && statusFilter !== '') {
      conditions.push(`status = $${paramCounter}`);
      params.push(statusFilter);
      paramCounter++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY registered_at DESC`;

    console.log('Executing query with params:', params);
    const result = await client.query(query, params);
    client.release();
    
    const users = result.rows.map((row: ServiceUserRow) => ({
      id: row.id,
      user_id: row.user_id,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      gender: row.gender || '',
      course: row.course || '',
      organization: row.organization || '',
      experience: row.experience || '',
      status: row.status || 'pending',
      registered_at: row.registered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    
    return NextResponse.json({ 
      users: users,
      total: users.length,
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching service users:', error);
    
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { message: 'Error fetching service users', error: String(error), users: [], success: false },
      { status: 500 }
    );
  }
}

// POST - Create a new service user
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      address, 
      gender, 
      course, 
      organization,
      experience,
      status 
    } = body;

    // Validation
    if (!first_name || !first_name.trim()) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!last_name || !last_name.trim()) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check for duplicate email in service_users
    const checkEmail = await client.query(
      'SELECT id FROM service_users WHERE email = $1',
      [email]
    );
    
    if (checkEmail.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { message: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Check for duplicate phone in service_users
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

    await client.query('BEGIN');

    // Insert into service_users with NULL user_id
    const result = await client.query(
      `INSERT INTO service_users (
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
      RETURNING id, user_id, first_name, last_name, email, phone, address, gender, course, organization, experience, status, registered_at, created_at, updated_at`,
      [
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        gender, 
        course,
        organization || '', 
        experience || '', 
        status || 'active'
      ]
    );
    
    const newServiceUser = result.rows[0];

    await client.query('COMMIT');
    client.release();

    return NextResponse.json(
      { 
        user: {
          id: newServiceUser.id,
          user_id: newServiceUser.user_id,
          first_name: newServiceUser.first_name || '',
          last_name: newServiceUser.last_name || '',
          email: newServiceUser.email || '',
          phone: newServiceUser.phone || '',
          address: newServiceUser.address || '',
          gender: newServiceUser.gender || '',
          course: newServiceUser.course || '',
          organization: newServiceUser.organization || '',
          experience: newServiceUser.experience || '',
          status: newServiceUser.status || 'pending',
          registered_at: newServiceUser.registered_at,
          created_at: newServiceUser.created_at,
          updated_at: newServiceUser.updated_at,
        },
        message: 'Service user created successfully!', 
        success: true
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Creation error:', error);
    
    if (client) {
      try {
        await client.query('ROLLBACK');
        client.release();
      } catch (releaseError) {
        console.error('Error rolling back:', releaseError);
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}