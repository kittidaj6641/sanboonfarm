import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { Pool } = pkg;

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

// ตรวจสอบค่า
console.log('DB Config:', dbConfig);

const pool = new Pool(dbConfig);

if (process.env.NODE_ENV !== "production") {
  pool.connect()
    .then(() => console.log("✅ เชื่อมต่อ Database สำเร็จ"))
    .catch((err) => console.error("❌ เชื่อมต่อ Database ผิดพลาด:", err));
}

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

export default pool;
