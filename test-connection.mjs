// Run with: node test-connection.mjs
// Isolates whether the timeout is your Next.js app or the raw network/Neon connection.

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import pkg from 'pg';
const { Client } = pkg;

import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

console.log('Attempting connection...');
console.time('connect');

client
  .connect()
  .then(async () => {
    console.timeEnd('connect');
    console.log('✅ Connected successfully');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  })
  .catch((err) => {
    console.timeEnd('connect');
    console.error('❌ Connection failed:', err.message);
    console.error(err);
  });
