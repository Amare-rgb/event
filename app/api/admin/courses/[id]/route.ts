import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await context.params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('DELETE FROM courses WHERE id = $1', [courseId]);
    client.release();
    return NextResponse.json({ message: 'Course deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (client) client.release();
    return NextResponse.json({ message: 'Error deleting course' }, { status: 500 });
  }
}