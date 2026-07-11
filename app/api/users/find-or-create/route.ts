// app/api/users/find-or-create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('📤 POST /api/users/find-or-create - Finding or creating user');
  
  let client;
  try {
    const body = await request.json();
    const { name, email } = body;

    console.log('📝 User data:', { name, email });

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let user = null;

    // Try to find user by email first
    if (email && email.trim()) {
      const result = await client.query(
        'SELECT id, first_name, last_name, email FROM users WHERE email = $1',
        [email.trim()]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
        console.log('✅ User found by email:', user);
      }
    }

    // If not found by email, try by name
    if (!user) {
      const result = await client.query(
        'SELECT id, first_name, last_name, email FROM users WHERE first_name = $1 AND last_name = $2',
        [firstName, lastName]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
        console.log('✅ User found by name:', user);
      }
    }

    // If user doesn't exist, create new user
    if (!user) {
      console.log('🆕 Creating new user...');
      
      // Generate a unique temp phone number (max 20 characters)
      // Using timestamp (10 digits) + random 4 chars = 14 chars, well within 20 limit
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const randomStr = Math.random().toString(36).substring(2, 6); // 4 chars
      const tempPhone = `T${timestamp}${randomStr}`; // ~13 characters
      
      // Alternative: Even simpler
      // const tempPhone = `TEMP${Date.now().toString().slice(-6)}`; // ~10 characters
      
      const tempAddress = 'Temporary address';
      const tempCourse = 'Not specified';

      const result = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, address, course) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, first_name, last_name, email`,
        [firstName, lastName, email?.trim() || null, tempPhone, tempAddress, tempCourse]
      );
      user = result.rows[0];
      console.log('✅ New user created:', user);
    }

    client.release();
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error finding/creating user:', error);
    if (client) client.release();
    
    // Check if it's a duplicate phone error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('duplicate key') && errorMessage.includes('phone')) {
      // Retry with a different phone number
      try {
        client = await pool.connect();
        const body = await request.json();
        const { name, email } = body;
        
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Generate a unique temp phone with timestamp
        const tempPhone = `TEMP${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5)}`;
        const tempAddress = 'Temporary address';
        const tempCourse = 'Not specified';

        const result = await client.query(
          `INSERT INTO users (first_name, last_name, email, phone, address, course) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING id, first_name, last_name, email`,
          [firstName, lastName, email?.trim() || null, tempPhone, tempAddress, tempCourse]
        );
        
        client.release();
        
        return NextResponse.json({ 
          success: true, 
          user: {
            id: result.rows[0].id,
            name: `${result.rows[0].first_name} ${result.rows[0].last_name}`.trim(),
            email: result.rows[0].email
          }
        });
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError);
        if (client) client.release();
        return NextResponse.json(
          { 
            success: false,
            message: 'Failed to create user after retry',
            error: retryError instanceof Error ? retryError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error processing request',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}