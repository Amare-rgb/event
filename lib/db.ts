import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';

// The serverless driver needs a WebSocket implementation in Node
// (it's built for edge/browser environments by default).
neonConfig.webSocketConstructor = ws;

// ============================================
// Singleton pool — prevents Next.js dev hot-reload
// from spawning a new Pool on every file save.
// ============================================
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool: Pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}

console.log('🔧 Database Configuration initialized (Neon serverless driver)');

let isInitializing = false;
let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;
  if (isInitializing && initializationPromise) return initializationPromise;

  isInitializing = true;

  initializationPromise = (async () => {
    let client;
    try {
      console.log('🔄 Initializing database tables on Neon...');
      client = await pool.connect();

      // 1. USERS TABLE
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
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20) UNIQUE NOT NULL,
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
      }

      // 2. SERVICE_USERS TABLE
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
            email VARCHAR(255) UNIQUE,
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
        console.log('✅ service_users table created');
      }

      // 3. COURSES TABLE
      const coursesTableCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'courses'
        )
      `);

      if (!coursesTableCheck.rows[0].exists) {
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

      // 4. USER_COURSES TABLE
      const userCoursesCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_courses'
        )
      `);

      if (!userCoursesCheck.rows[0].exists) {
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

      // 5. ADMINS TABLE
      const adminsCheck = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'admins'
        )
      `);

      if (!adminsCheck.rows[0].exists) {
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

      // DEFAULT ADMIN SEEDING
      const adminUsers = [
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
        }
      }

      console.log('✅ Database initialization complete!');
    } catch (error: unknown) {
      console.error('❌ Database initialization error:', error);
    } finally {
      if (client) {
        client.release();
      }
      isInitializing = false;
      isInitialized = true;
    }
  })();

  return initializationPromise;
}

if (typeof window === 'undefined') {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  if (!isBuildTime) {
    initDatabase().catch((err) => {
      console.error('❌ Failed to initialize database:', err);
    });
  }
}

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

export default pool;