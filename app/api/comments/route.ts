// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  console.log('📥 GET /api/comments - Fetching comments');
  
  let client;
  try {
    client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        id,
        name,
        email,
        comment,
        created_at
      FROM comments
      ORDER BY created_at DESC
    `);
    
    client.release();
    console.log(`✅ Found ${result.rows.length} comments`);
    
    return NextResponse.json({ 
      comments: result.rows || [] 
    });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    if (client) client.release();
    return NextResponse.json(
      { 
        comments: [], 
        message: 'Error fetching comments' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('📤 POST /api/comments - Adding new comment (NO REGISTRATION)');
  
  let client;
  try {
    const body = await request.json();
    const { name, email, comment } = body;

    console.log('📝 Comment data:', { name, email, comment: comment?.substring(0, 50) });

    // Validate inputs
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: 'Comment is required' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Comment must be at least 3 characters long' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Insert comment directly - NO USER CREATION
    const result = await client.query(
      `INSERT INTO comments (name, email, comment, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING id, name, email, comment, created_at`,
      [name.trim(), email?.trim() || null, comment.trim()]
    );

    client.release();

    console.log('✅ Comment added successfully (NO USER CREATED)');

    return NextResponse.json({
      success: true,
      comment: result.rows[0],
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    if (client) client.release();
    return NextResponse.json(
      { 
        success: false,
        message: 'Error adding comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}