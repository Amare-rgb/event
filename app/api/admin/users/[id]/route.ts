import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE user by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await context.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check if user exists
    const checkUser = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (checkUser.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    await client.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    
    client.release();

    return NextResponse.json({
      message: 'User deleted successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { message: 'Error deleting user', success: false },
      { status: 500 }
    );
  }
}