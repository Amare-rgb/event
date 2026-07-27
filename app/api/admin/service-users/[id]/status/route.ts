// app/api/admin/service-users/[id]/status/route.ts

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    console.log('📝 PATCH status request - params:', { id });
    
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;
    
    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be active, inactive, or pending' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check if service user exists in service_users table
    const checkUser = await client.query(
      'SELECT id, user_id FROM service_users WHERE id = $1',
      [userId]
    );
    
    if (checkUser.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, message: 'Service user not found' },
        { status: 404 }
      );
    }

    const userRecord = checkUser.rows[0];

    await client.query('BEGIN');

    // Update status in service_users table
    const result = await client.query(
      `UPDATE service_users 
       SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
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
      [status, userId]
    );
    
    // Also update status in users table if linked
    if (userRecord.user_id) {
      await client.query(
        `UPDATE users 
         SET 
          status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_type = 'service'`,
        [status, userRecord.user_id]
      );
    }
    
    await client.query('COMMIT');
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
      message: 'Status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating status:', error);
    
    if (client) {
      try {
        await client.query('ROLLBACK');
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating status', 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}