// lib/db.ts

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Define types for user data
interface UserBackup {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  gender: string | null;
  course: string | null;
  organization: string | null;
  experience: string | null;
  status: string | null;
  user_type: string | null;
  registered_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface ColumnInfo {
  column_name: string;
  is_nullable: string;
}

// Create a pool for the default postgres database to create databases
const adminPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD || 'alemu@12',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Create the database if it doesn't exist
async function ensureDatabaseExists(): Promise<void> {
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

// ===== INITIALIZATION CONTROL =====
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

// Initialize database tables
export async function initDatabase(): Promise<void> {
  // If already initialized, skip
  if (isInitialized) {
    return;
  }

  // If already initializing, wait for the existing promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  isInitializing = true;
  
  initializationPromise = (async () => {
    let client;
    try {
      await ensureDatabaseExists();

      console.log('🔄 Initializing database tables...');
      client = await pool.connect();
      
      // ===== CHECK AND CREATE USERS TABLE =====
      const tableCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'users'
        )
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('🔄 Creating users table...');
        await client.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            gender VARCHAR(20),
            course VARCHAR(255),
            experience TEXT,
            status VARCHAR(20) DEFAULT 'active',
            user_type VARCHAR(50) DEFAULT 'student',
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Users table created');
      } else {
        console.log('✅ Users table already exists');
      }

      // ===== CREATE SERVICE_USERS TABLE WITH ORGANIZATION =====
      console.log('🔄 Checking service_users table...');
      const serviceTableCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'service_users'
        )
      `);
      
      if (!serviceTableCheck.rows[0].exists) {
        console.log('🔄 Creating service_users table...');
        await client.query(`
          CREATE TABLE service_users (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            gender VARCHAR(20),
            course VARCHAR(255),
            organization VARCHAR(255),
            experience TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ service_users table created with organization column');
      } else {
        console.log('✅ service_users table already exists');
        
        // Check if organization column exists, if not add it
        const orgColumnCheck = await client.query<{ exists: boolean }>(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'service_users' AND column_name = 'organization'
          )
        `);
        
        if (!orgColumnCheck.rows[0].exists) {
          console.log('🔄 Adding organization column to service_users table...');
          await client.query(`
            ALTER TABLE service_users ADD COLUMN organization VARCHAR(255)
          `);
          console.log('✅ Organization column added to service_users table');
        } else {
          console.log('✅ Organization column already exists');
        }
        
        // Check and fix the user_id column to allow NULL
        const checkConstraint = await client.query<{ is_nullable: string }>(`
          SELECT is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'service_users' AND column_name = 'user_id'
        `);
        
        // Make sure user_id can be NULL (for standalone service users)
        if (checkConstraint.rows.length > 0) {
          if (checkConstraint.rows[0].is_nullable === 'NO') {
            console.log('🔄 Fixing user_id column to allow NULL...');
            await client.query(`
              ALTER TABLE service_users ALTER COLUMN user_id DROP NOT NULL;
            `);
            console.log('✅ user_id column now allows NULL');
          }
        }
      }

      // ===== CREATE SERVICE_USER_COURSES TABLE =====
      console.log('🔄 Checking service_user_courses table...');
      
      const coursesTableCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'courses'
        )
      `);
      
      if (!coursesTableCheck.rows[0].exists) {
        console.log('🔄 Creating courses table...');
        await client.query(`
          CREATE TABLE courses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ courses table created');
      }
      
      const serviceUserCoursesCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'service_user_courses'
        )
      `);
      
      if (!serviceUserCoursesCheck.rows[0].exists) {
        console.log('🔄 Creating service_user_courses table...');
        await client.query(`
          CREATE TABLE service_user_courses (
            service_user_id INTEGER NOT NULL REFERENCES service_users(id) ON DELETE CASCADE,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (service_user_id, course_id)
          )
        `);
        console.log('✅ service_user_courses table created');
      } else {
        console.log('✅ service_user_courses table already exists');
      }

      // ===== CREATE ADMINS TABLE =====
      const adminsCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'admins'
        )
      `);
      
      if (!adminsCheck.rows[0].exists) {
        console.log('🔄 Creating admins table...');
        await client.query(`
          CREATE TABLE admins (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ admins table created');
      }

      // ===== CREATE USER_COURSES TABLE =====
      const userCoursesCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'user_courses'
        )
      `);
      
      if (!userCoursesCheck.rows[0].exists) {
        console.log('🔄 Creating user_courses table...');
        await client.query(`
          CREATE TABLE user_courses (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, course_id)
          )
        `);
        console.log('✅ user_courses table created');
      }

      // ===== CREATE COMMENTS TABLE =====
      const commentsCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'comments'
        )
      `);
      
      if (!commentsCheck.rows[0].exists) {
        console.log('🔄 Creating comments table...');
        await client.query(`
          CREATE TABLE comments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ comments table created');
      }

      // ===== CREATE BROADCAST_LOGS TABLE WITH IMAGE SUPPORT =====
      console.log('🔄 Checking broadcast_logs table...');
      const broadcastLogsCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'broadcast_logs'
        )
      `);
      
      if (!broadcastLogsCheck.rows[0].exists) {
        console.log('🔄 Creating broadcast_logs table...');
        await client.query(`
          CREATE TABLE broadcast_logs (
            id SERIAL PRIMARY KEY,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            course_filter VARCHAR(100),
            recipient_count INTEGER,
            sent_count INTEGER,
            failed_emails TEXT,
            total_emails INTEGER,
            from_database INTEGER,
            from_excel INTEGER,
            duplicates_removed INTEGER,
            pdf_attached BOOLEAN DEFAULT FALSE,
            pdf_name VARCHAR(255),
            image_attached BOOLEAN DEFAULT FALSE,
            image_name VARCHAR(255),
            image_url TEXT,
            target_type VARCHAR(50) DEFAULT 'users',
            target_filter VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ broadcast_logs table created with image support');
      } else {
        console.log('✅ broadcast_logs table already exists');
        
        // Check and add image columns if they don't exist
        const imageColumns = [
          { name: 'image_attached', type: 'BOOLEAN DEFAULT FALSE' },
          { name: 'image_name', type: 'VARCHAR(255)' },
          { name: 'image_url', type: 'TEXT' },
          { name: 'target_type', type: 'VARCHAR(50) DEFAULT \'users\'' },
          { name: 'target_filter', type: 'VARCHAR(255)' }
        ];
        
        for (const col of imageColumns) {
          const columnCheck = await client.query<{ exists: boolean }>(`
            SELECT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'broadcast_logs' AND column_name = $1
            )
          `, [col.name]);
          
          if (!columnCheck.rows[0].exists) {
            console.log(`🔄 Adding ${col.name} column to broadcast_logs table...`);
            await client.query(`
              ALTER TABLE broadcast_logs ADD COLUMN ${col.name} ${col.type}
            `);
            console.log(`✅ ${col.name} column added to broadcast_logs table`);
          }
        }
      }

      // ===== CREATE SERVICES TABLE WITH CATEGORY =====
      console.log('🔄 Checking services table...');
      const servicesTableCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'services'
        )
      `);
      
      if (!servicesTableCheck.rows[0].exists) {
        console.log('🔄 Creating services table...');
        await client.query(`
          CREATE TABLE services (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            category VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ services table created with category column');
      } else {
        console.log('✅ services table already exists');
        
        // Check if category column exists, if not add it
        const categoryColumnCheck = await client.query<{ exists: boolean }>(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'services' AND column_name = 'category'
          )
        `);
        
        if (!categoryColumnCheck.rows[0].exists) {
          console.log('🔄 Adding category column to services table...');
          await client.query(`
            ALTER TABLE services ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'TECHNOLOGY & SOFTWARE'
          `);
          console.log('✅ Category column added to services table');
        } else {
          console.log('✅ Category column already exists');
        }
      }

      // ===== CREATE ADMIN USERS =====
      const adminUsers: Array<{ username: string; password: string }> = [
        { username: 'admin@dreammore.com', password: 'admin123' },
        { username: 'dreammore1@gmail.com', password: 'dream@1234' },
      ];

      for (const admin of adminUsers) {
        const adminCheck = await client.query<{ id: number }>(
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
        }
      }

      // ===== INSERT DEFAULT COURSES =====
      const defaultCourses: string[] = [
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
        const courseCheck = await client.query<{ id: number }>(
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

      // ===== UPDATE SERVICES - Using UPSERT to avoid duplicates =====
      console.log('🔄 Updating services with your categories...');
      
      // Your services with categories (NO GENERAL)
      const yourServices = [
        // TECHNOLOGY & SOFTWARE
        { name: 'Custom Software Development', category: 'TECHNOLOGY & SOFTWARE' },
        { name: 'Website & Mobile App Development', category: 'TECHNOLOGY & SOFTWARE' },
        { name: 'Startup Tech Solution', category: 'TECHNOLOGY & SOFTWARE' },
        { name: 'Business Automation & IT Consultation', category: 'TECHNOLOGY & SOFTWARE' },
        
        // CREATIVE & BRANDING
        { name: 'Brand Identity Design', category: 'CREATIVE & BRANDING' },
        { name: 'Graphic Design', category: 'CREATIVE & BRANDING' },
        { name: 'Content Creation', category: 'CREATIVE & BRANDING' },
        
        // DIGITAL BUSINESS
        { name: 'Digital Transformation & Consulting', category: 'DIGITAL BUSINESS' },
        { name: 'Digital Strategy Development', category: 'DIGITAL BUSINESS' },
        { name: 'Business Process Improvement', category: 'DIGITAL BUSINESS' },
        { name: 'Project Management Support', category: 'DIGITAL BUSINESS' },
        
        // DIGITAL MARKETING
        { name: 'Social Media Management', category: 'DIGITAL MARKETING' },
        { name: 'Digital Marketing Strategy & Ads', category: 'DIGITAL MARKETING' },
        { name: 'Video Production & Editing', category: 'DIGITAL MARKETING' },
        { name: 'Photography & Drone Services', category: 'DIGITAL MARKETING' }
      ];

      // Use UPSERT (INSERT ON CONFLICT) to avoid duplicate key errors
      for (const service of yourServices) {
        await client.query(
          `INSERT INTO services (name, description, category, created_at, updated_at) 
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (name) DO UPDATE SET
             description = EXCLUDED.description,
             category = EXCLUDED.category,
             updated_at = CURRENT_TIMESTAMP`,
          [service.name, '', service.category]
        );
        // Removed console.log to reduce noise during build
      }
      
      client.release();
      console.log('✅ Database initialization complete!');
      console.log('✅ Broadcast logs now support image attachments');
      
    } catch (error: unknown) {
      console.error('❌ Database initialization error:', error);
      if (client) {
        try { client.release(); } catch (e) {}
      }
      throw error;
    } finally {
      isInitializing = false;
      isInitialized = true;
    }
  })();

  return initializationPromise;
}

// ===== ONLY RUN INITIALIZATION ONCE =====
let isDatabaseInitialized = false;

// Initialize on first import - but only once and only on server
if (typeof window === 'undefined' && !isDatabaseInitialized) {
  isDatabaseInitialized = true;
  
  // Check if we should skip initialization during build
  // During Next.js build, we want to skip heavy DB operations
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (!isBuildTime) {
    // Only run during runtime, not during build
    initDatabase().catch((err) => {
      console.error('❌ Failed to initialize database:', err);
    });
  } else {
    console.log('⏭️ Skipping database initialization during build...');
  }
}

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err.message);
});

export default pool;