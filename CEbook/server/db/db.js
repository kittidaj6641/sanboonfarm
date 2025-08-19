import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// หา path ของไฟล์ .env ตาม NODE_ENV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === "production" ? ".env.remote" : ".env.local";
dotenv.config({ path: path.join(__dirname, envFile) }); // ปรับ path ให้ชัดเจน

const { Pool } = pkg;

// กำหนดการตั้งค่า Pool ตามสภาพแวดล้อม
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // ใช้ใน Railway หรือ development
      },
    }
  : {
      user: process.env.DB_USER || 'postgres', // Default สำหรับท้องถิ่น
      host: process.env.DB_HOST || 'postgres.railway.internal', // Default สำหรับท้องถิ่น
      database: process.env.DB_NAME || 'railway', // Default สำหรับท้องถิ่น
      password: process.env.DB_PASSWORD || 'ZcwNndUCiShSkCqcUKYhIhZsKyhoDUZd', // เปลี่ยนเป็นรหัสจริง
      port: process.env.DB_PORT || 5432, // Default port
    };

const pool = new Pool(dbConfig);

// ตรวจสอบการเชื่อมต่อ (เฉพาะ development)
if (process.env.NODE_ENV !== "production") {
  pool.connect()
    .then(() => console.log("✅ เชื่อมต่อ Database สำเร็จ"))
    .catch((err) => console.error("❌ เชื่อมต่อ Database ผิดพลาด:", err));
}

// จัดการข้อผิดพลาดทั่วไป
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

export default pool;
