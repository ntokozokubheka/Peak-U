// Creates the tables and loads demo data.  npm run db:setup   (add --reset to wipe first)
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { seed } from '../db/seed.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
await client.connect();
if (process.argv.includes('--reset')) {
  await client.query('drop schema public cascade; create schema public;');
  console.log('Schema wiped.');
}
await client.query(fs.readFileSync(path.join(dir, '../db/schema.sql'), 'utf8'));
await seed(client);
await client.end();
console.log('Done. Demo login: demo@peaku.test / demo1234');
