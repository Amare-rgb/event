// app/api/admin/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🗑️ DELETE /api/admin/comments/${params.id} - Deleting comment`);
  
  let client;
  try {
    const commentId = parseInt(params.id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { message: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    
    // Check if comment exists
    const commentCheck = await client.query(
      'SELECT id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete the comment
    await client.query(
      'DELETE FROM comments WHERE id = $1',
      [commentId]
    );
    
    client.release();
    console.log(`✅ Comment ${commentId} deleted successfully`);
    
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