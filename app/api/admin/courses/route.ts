import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM courses ORDER BY created_at DESC
    `);
    client.release();
    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    if (client) client.release();
    return NextResponse.json({ message: 'Error fetching courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Course name is required' }, { status: 400 });
    }

    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO courses (name, description) VALUES ($1, $2) RETURNING *`,
      [name.trim(), description || '']
    );
    client.release();
    return NextResponse.json({ course: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding course:', error);
    if (client) client.release();
    return NextResponse.json({ message: 'Error adding course' }, { status: 500 });
  }
}