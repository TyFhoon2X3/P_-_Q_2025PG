const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const candidatePaths = [
  path.resolve(__dirname, '..', '..', 'PQ 2026.sql'),
  path.resolve(__dirname, '..', '..', '..', 'Desktop', 'PQ 2026.sql'),
  path.resolve(__dirname, '..', '..', '..', '..', 'Desktop', 'PQ 2026.sql'),
  path.resolve(__dirname, '..', '..', 'PQ 2026.sql')
];
const sqlFile = candidatePaths.find((p) => fs.existsSync(p));
const dbName = process.env.DB_DATABASE || 'p_and_q_db';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || '';

if (!sqlFile) {
  console.error('SQL file not found. Expected PQ 2026.sql in the project root or Desktop.');
  process.exit(1);
}

const env = { ...process.env };
if (password) env.PGPASSWORD = password;

const args = ['-h', host, '-p', port, '-U', user, '-d', dbName, '-f', sqlFile];

try {
  execFileSync('psql', args, { stdio: 'inherit', env });
  console.log('Database imported successfully');
} catch (error) {
  console.error('Failed to import database');
  process.exit(1);
}
