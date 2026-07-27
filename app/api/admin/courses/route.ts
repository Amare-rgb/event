// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM courses 
      WHERE name IS NOT NULL 
      AND name != '' 
      AND name != 'Not Specified'
      ORDER BY created_at DESC
    `);
    client.release();
    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    if (client) client.release();
    return NextResponse.json({ 
      message: 'Error fetching courses',
      courses: [] 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        message: 'Course name is required' 
      }, { status: 400 });
    }

    const cleanName = name.trim().replace(/\s+/g, ' ');

    client = await pool.connect();
    
    const existingCourse = await client.query(
      'SELECT id, name FROM courses WHERE LOWER(name) = LOWER($1)',
      [cleanName]
    );
    
    if (existingCourse.rows.length > 0) {
      client.release();
      return NextResponse.json({ 
        message: 'Course already exists',
        course: existingCourse.rows[0],
        duplicate: true
      }, { status: 409 });
    }
    
    const result = await client.query(
      `INSERT INTO courses (name, description) VALUES ($1, $2) RETURNING *`,
      [cleanName, description || '']
    );
    client.release();
    return NextResponse.json({ 
      course: result.rows[0],
      message: 'Course added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding course:', error);
    if (client) client.release();
    return NextResponse.json({ 
      message: 'Error adding course' 
    }, { status: 500 });
  }
}

// ===== FIXED: DELETE with manual URL parsing =====
export async function DELETE(request: NextRequest) {
  let client;
  try {
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        message: 'Invalid course ID' 
      }, { status: 400 });
    }

    client = await pool.connect();
    
    const checkCourse = await client.query(
      'SELECT id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (checkCourse.rows.length === 0) {
      client.release();
      return NextResponse.json({ 
        message: 'Course not found' 
      }, { status: 404 });
    }
    
    const checkUsers = await client.query(
      'SELECT COUNT(*) FROM user_courses WHERE course_id = $1',
      [courseId]
    );
    
    if (parseInt(checkUsers.rows[0].count) > 0) {
      client.release();
      return NextResponse.json({ 
        message: 'Cannot delete course as it is assigned to users' 
      }, { status: 400 });
    }
    
    await client.query('DELETE FROM courses WHERE id = $1', [courseId]);
    client.release();
    
    return NextResponse.json({ 
      message: 'Course deleted successfully', 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (client) client.release();
    return NextResponse.json({ 
      message: 'Error deleting course' 
    }, { status: 500 });
  }
}