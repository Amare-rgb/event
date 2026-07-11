import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'eventattndce',
  password: 'alemu@12',
  port: 5432,
});

async function updateGender() {
  try {
    console.log('🔍 Connecting to database...');
    const client = await pool.connect();
    
    // Check how many users have NULL gender
    const nullCheck = await client.query(
      "SELECT COUNT(*) FROM users WHERE gender IS NULL"
    );
    console.log(`📊 Found ${nullCheck.rows[0].count} users with NULL gender`);
    
    // Update NULL genders to 'prefer-not-to-say'
    const result = await client.query(
      "UPDATE users SET gender = 'prefer-not-to-say' WHERE gender IS NULL"
    );
    
    console.log(`✅ Updated ${result.rowCount} users with NULL gender to 'prefer-not-to-say'`);
    
    // Show sample of updated users
    const sample = await client.query(
      "SELECT id, first_name, last_name, gender FROM users LIMIT 5"
    );
    console.log('\n👤 Sample users after update:');
    sample.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Gender: ${user.gender}`);
    });
    
    client.release();
    await pool.end();
    console.log('\n✅ Done! Refresh your admin dashboard.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateGender();