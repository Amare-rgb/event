import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  address: string;
  gender: string;
  course: string;
  experience: string;
  registered_at: Date;
  updated_at: Date;
}

// ===== GET HANDLER =====
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseFilter = searchParams.get('course');
    const searchTerm = searchParams.get('search');

    console.log('GET /api/admin/users - Fetching users...');

    let query = `
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        gender,
        course,
        experience,
        registered_at,
        updated_at
      FROM users
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramCounter = 1;

    if (courseFilter && courseFilter !== '') {
      conditions.push(`
        (
          course ILIKE $${paramCounter} 
          OR course ILIKE $${paramCounter + 1}
          OR course ILIKE $${paramCounter + 2}
          OR course = $${paramCounter + 3}
        )
      `);

      params.push(`${courseFilter},%`);
      params.push(`%, ${courseFilter},%`);
      params.push(`%, ${courseFilter}`);
      params.push(courseFilter);

      paramCounter += 4;
    }

    if (searchTerm && searchTerm !== '') {
      const searchConditions: string[] = [];
      const searchPattern = `%${searchTerm}%`;

      searchConditions.push(`first_name ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      searchConditions.push(`last_name ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      searchConditions.push(`email ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      searchConditions.push(`phone ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      searchConditions.push(`address ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      searchConditions.push(`course ILIKE $${paramCounter}`);
      params.push(searchPattern);
      paramCounter++;

      conditions.push(`(${searchConditions.join(' OR ')})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY registered_at DESC`;

    // Direct pool query automatically manages connection acquisition & release
    const result = await pool.query<UserRow>(query, params);

    const users = result.rows.map((row) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      gender: row.gender,
      course: row.course || 'Not Specified',
      experience: row.experience,
      registered_at: row.registered_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      users: users,
      count: users.length,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        message: 'Error fetching users',
        error: String(error),
        users: [],
        success: false,
      },
      { status: 500 }
    );
  }
}

// ===== POST HANDLER =====
export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let client: any = undefined;

  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, gender, course, experience } = body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return NextResponse.json({ message: 'First name is required' }, { status: 400 });
    }
    if (!/^[A-Za-z\s]+$/.test(firstName)) {
      return NextResponse.json({ message: 'First name should only contain letters' }, { status: 400 });
    }

    if (!lastName || !lastName.trim()) {
      return NextResponse.json({ message: 'Last name is required' }, { status: 400 });
    }
    if (!/^[A-Za-z\s]+$/.test(lastName)) {
      return NextResponse.json({ message: 'Last name should only contain letters' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }
    if (!/^[\+\d\s\-()]{7,20}$/.test(phone)) {
      return NextResponse.json({ message: 'Please enter a valid phone number' }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ message: 'Address is required' }, { status: 400 });
    }

    if (!gender || !gender.trim()) {
      return NextResponse.json({ message: 'Please select your gender' }, { status: 400 });
    }

    if (!course || !course.trim()) {
      return NextResponse.json({ message: 'Please select a course' }, { status: 400 });
    }

    client = await pool.connect();

    // Check existing phone
    const checkPhone = await client.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (checkPhone.rows.length > 0) {
      return NextResponse.json(
        { message: 'This phone number is already registered' },
        { status: 400 }
      );
    }

    // Check existing email
    if (email) {
      const checkEmail = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        return NextResponse.json(
          { message: 'This email is already registered' },
          { status: 400 }
        );
      }
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, address, gender, course, experience, registered_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [firstName, lastName, email || null, phone, address, gender, course, experience || '']
    );

    const userId = result.rows[0].id;

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'user_courses'
      )
    `);

    const hasUserCourses = tableCheck.rows[0].exists;

    if (hasUserCourses && course) {
      const courseNames = course.split(',').map((c: string) => c.trim()).filter(Boolean);

      for (const courseName of courseNames) {
        if (!courseName) continue;

        const courseResult = await client.query(
          'SELECT id FROM courses WHERE LOWER(name) = LOWER($1)',
          [courseName]
        );

        let courseId: number;
        if (courseResult.rows.length === 0) {
          const newCourse = await client.query(
            'INSERT INTO courses (name) VALUES ($1) RETURNING id',
            [courseName]
          );
          courseId = newCourse.rows[0].id;
        } else {
          courseId = courseResult.rows[0].id;
        }

        await client.query(
          `INSERT INTO user_courses (user_id, course_id, enrolled_at) 
           VALUES ($1, $2, CURRENT_TIMESTAMP) 
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [userId, courseId]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json(
      {
        message: 'Registration successful! Welcome to DreamMore!',
        userId: userId,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back:', rollbackError);
      }
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ===== DELETE HANDLER =====
export async function DELETE(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let client: any = undefined;

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    client = await pool.connect();

    const checkUser = await client.query('SELECT id FROM users WHERE id = $1', [userId]);

    if (checkUser.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'user_courses'
      )
    `);

    const hasUserCourses = tableCheck.rows[0].exists;

    await client.query('BEGIN');

    if (hasUserCourses) {
      await client.query('DELETE FROM user_courses WHERE user_id = $1', [userId]);
    }

    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    return NextResponse.json({
      message: 'User deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Delete error:', error);

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back delete:', rollbackError);
      }
    }

    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}