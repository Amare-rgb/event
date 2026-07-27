// app/api/admin/service-users/[id]/route.ts

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

// GET - Fetch a single service user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    console.log('📝 GET single request - params:', { id });
    
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
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
      WHERE id = $1`,
      [userId]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service user not found' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        user_id: user.user_id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        course: user.course || '',
        organization: user.organization || '',
        experience: user.experience || '',
        status: user.status || 'pending',
        registered_at: user.registered_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    });
    
  } catch (error) {
    console.error('Error fetching service user:', error);
    
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
        message: 'Error fetching service user',
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

// PUT - Update a service user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    console.log('📝 PUT request - params:', { id });
    
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

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

    client = await pool.connect();
    
    const checkUser = await client.query(
      'SELECT id FROM service_users WHERE id = $1',
      [userId]
    );
    
    if (checkUser.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, message: 'Service user not found' },
        { status: 404 }
      );
    }

    const result = await client.query(
      `UPDATE service_users 
       SET 
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        address = $5,
        gender = $6,
        course = $7,
        organization = $8,
        experience = $9,
        status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 
      RETURNING 
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
        updated_at`,
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
        status || 'pending',
        userId
      ]
    );
    
    client.release();
    
    const updatedUser = result.rows[0];
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        user_id: updatedUser.user_id,
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        gender: updatedUser.gender || '',
        course: updatedUser.course || '',
        organization: updatedUser.organization || '',
        experience: updatedUser.experience || '',
        status: updatedUser.status || 'pending',
        registered_at: updatedUser.registered_at,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
      message: 'Service user updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating service user:', error);
    
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
        message: 'Error updating service user',
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    console.log('📝 DELETE request received');
    
    const { id } = await params;
    console.log('📝 params.id:', id);
    console.log('📝 request.url:', request.url);
    
    if (!id) {
      console.log('❌ No ID found in params');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);
    console.log('📝 Parsed userId:', userId);
    
    if (isNaN(userId)) {
      console.log('❌ Invalid ID - not a number');
      return NextResponse.json(
        { success: false, message: 'Invalid user ID. ID must be a number.' },
        { status: 400 }
      );
    }

    console.log('✅ Valid ID:', userId);

    client = await pool.connect();
    
    const checkUser = await client.query(
      'SELECT id FROM service_users WHERE id = $1',
      [userId]
    );
    
    if (checkUser.rows.length === 0) {
      console.log('❌ Service user not found with ID:', userId);
      client.release();
      return NextResponse.json(
        { success: false, message: 'Service user not found' },
        { status: 404 }
      );
    }

    console.log('✅ Service user found, deleting...');

    await client.query(
      'DELETE FROM service_users WHERE id = $1',
      [userId]
    );
    
    client.release();

    console.log('✅ Service user deleted successfully:', userId);

    return NextResponse.json({
      success: true,
      message: 'Service user deleted successfully',
      deletedId: userId
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    
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
        message: 'Error deleting service user', 
        error: String(error)
      },
      { status: 500 }
    );
  }
}