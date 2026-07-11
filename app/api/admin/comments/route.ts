// app/api/admin/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all comments for admin
export async function GET() {
  console.log('📥 GET /api/admin/comments - Fetching admin comments');
  
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
    console.log(`✅ Found ${result.rows.length} admin comments`);
    
    return NextResponse.json({ 
      comments: result.rows || [] 
    });
  } catch (error) {
    console.error('❌ Error fetching admin comments:', error);
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

// DELETE a comment by ID
export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE /api/admin/comments - Deleting comment');
  
  let client;
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const commentId = pathParts[pathParts.length - 1];
    
    if (!commentId || commentId === 'comments') {
      return NextResponse.json(
        { success: false, message: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(commentId);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check if comment exists
    const commentCheck = await client.query(
      'SELECT id FROM comments WHERE id = $1',
      [id]
    );

    if (commentCheck.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete the comment
    await client.query(
      'DELETE FROM comments WHERE id = $1',
      [id]
    );
    
    client.release();
    console.log(`✅ Comment ${id} deleted successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    if (client) client.release();
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error deleting comment' 
      },
      { status: 500 }
    );
  }
}