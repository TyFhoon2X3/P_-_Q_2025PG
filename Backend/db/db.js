const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

if (fs.existsSync(envPath)) {
  const rawEnv = fs.readFileSync(envPath, 'utf8');
  const bareUrl = rawEnv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && /^postgres(?:ql)?:\/\//i.test(line));

  if (bareUrl && !process.env.DATABASE_URL && !process.env.DB_CONNECTION_STRING) {
    process.env.DATABASE_URL = bareUrl;
  }
}

const connectionString = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : undefined,
  database: process.env.DB_DATABASE,
};

if (connectionString) {
  config.connectionString = connectionString;
}

const useSSL = process.env.DB_SSL === 'true' || (connectionString && /supabase|pooler|azure|neon|render|railway/i.test(connectionString));
if (useSSL) {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);
module.exports = pool;