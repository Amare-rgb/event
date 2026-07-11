// app/api/admin/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`🗑️ DELETE /api/admin/comments - Deleting comment`);
  
  let client;
  try {
    // Await the params since they're now a Promise
    const { id } = await params;
    const commentId = parseInt(id);
    
    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID' },
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
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete the comment with RETURNING to confirm
    const deleteResult = await client.query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [commentId]
    );
    
    client.release();
    
    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Comment could not be deleted' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Comment ${commentId} deleted successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comment deleted successfully',
      deletedId: commentId
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