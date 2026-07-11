// lib/db.ts
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Create a pool for the default postgres database to create databases
const adminPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD || 'alemu@12',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Create the database if it doesn't exist
async function ensureDatabaseExists() {
  const client = await adminPool.connect();
  try {
    const dbName = process.env.DB_NAME || 'eventattndce';
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (result.rows.length === 0) {
      console.log(`🔄 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error ensuring database exists:', error.message);
    } else {
      console.error('❌ Error ensuring database exists:', error);
    }
  } finally {
    client.release();
    await adminPool.end();
  }
}

// Main pool for the application database
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eventattndce',
  password: process.env.DB_PASSWORD || 'alemu@12',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log database configuration
console.log('🔧 Database Configuration:');
console.log('  DB_USER:', process.env.DB_USER || 'postgres');
console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('  DB_NAME:', process.env.DB_NAME || 'eventattndce');
console.log('  DB_PORT:', process.env.DB_PORT || '5432');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ NOT SET');

// Initialize database tables
export async function initDatabase() {
  let client;
  try {
    await ensureDatabaseExists();

    console.log('🔄 Initializing database tables...');
    client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        gender VARCHAR(20),
        course VARCHAR(255) NOT NULL,
        experience TEXT,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Check if gender column exists
    const checkGender = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='gender'
    `);
    
    if (checkGender.rows.length === 0) {
      await client.query(`
        ALTER TABLE users ADD COLUMN gender VARCHAR(20)
      `);
      console.log('✅ Gender column added to users table');
    }

    // Check if created_at and updated_at exist
    const checkCreatedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='created_at'
    `);
    
    if (checkCreatedAt.rows.length === 0) {
      await client.query(`
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ created_at and updated_at columns added to users table');
    }

    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admins table created/verified');

    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Courses table created/verified');

    // ===== UPDATED: Create comments table with name and email (NO user_id) =====
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Comments table created/verified');

    // ===== Check if old comments table has user_id and migrate data =====
    const checkUserId = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='comments' AND column_name='user_id'
    `);
    
    if (checkUserId.rows.length > 0) {
      console.log('🔄 Migrating old comments data...');
      
      // Copy user names and emails from users table to comments
      await client.query(`
        UPDATE comments c 
        SET name = u.first_name || ' ' || u.last_name,
            email = u.email
        FROM users u 
        WHERE c.user_id = u.id AND c.name IS NULL
      `);
      console.log('✅ Old comments data migrated');
      
      // Drop the user_id column
      await client.query(`
        ALTER TABLE comments DROP COLUMN user_id
      `);
      console.log('✅ user_id column removed from comments table');
    }

    // Admin users to create
    const adminUsers = [
      { username: 'admin@dreammore.com', password: 'admin123' },
      { username: 'dreammore1@gmail.com', password: 'dream@1234' },
    ];

    // Create admin users
    for (const admin of adminUsers) {
      const adminCheck = await client.query(
        'SELECT id FROM admins WHERE username = $1',
        [admin.username]
      );
      
      if (adminCheck.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await client.query(
          'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
          [admin.username, hashedPassword]
        );
        console.log(`✅ Admin created: ${admin.username} / ${admin.password}`);
      } else {
        console.log(`✅ Admin already exists: ${admin.username}`);
      }
    }

    // Insert default courses if they don't exist
    const defaultCourses = [
      'Digital Marketing',
      'Programming Language C++',
      'Mobile Maintenance',
      'Sales & Career Development',
      'AI-Powered Freelancing',
      'Graphics Designing',
      'Cinematography',
      'Basic Computer Skills',
      'AI for Business',
      'Robotics & Drone Technology',
      '3D Modeling & Product Prototyping',
      'Video Editing',
      'Web and Mobile App Development',
      'Computer Maintenance',
      'Cybersecurity & Data Safety',
      'English Language'
    ];

    for (const courseName of defaultCourses) {
      const courseCheck = await client.query(
        'SELECT id FROM courses WHERE name = $1',
        [courseName]
      );
      
      if (courseCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO courses (name) VALUES ($1)',
          [courseName]
        );
        console.log(`✅ Course created: ${courseName}`);
      }
    }
    
    client.release();
    console.log('✅ Database initialization complete!');
    console.log(`✅ Database: ${process.env.DB_NAME || 'eventattndce'}`);
    console.log(`✅ Tables: users, admins, courses, comments`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Database initialization error:', error.message);
    } else {
      console.error('❌ Database initialization error:', error);
    }
    if (client) {
      try { client.release(); } catch (e) {}
    }
  }
}

// Initialize on first import
initDatabase();

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err.message);
});

export default pool;