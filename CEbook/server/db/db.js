import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// หา path ของไฟล์ .env ตาม NODE_ENV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === "production" ? ".env.remote" : ".env.local";
dotenv.config({ path: path.join(__dirname, "..", "..", envFile) });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// ตรวจสอบการเชื่อมต่อ
pool.connect()
  .then(() => console.log("✅ เชื่อมต่อ Database สำเร็จ"))
  .catch((err) => console.error("❌ เชื่อมต่อ Database ผิดพลาด:", err));

export default pool;
