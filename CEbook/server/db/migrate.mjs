import dotenv from 'dotenv';
import pkg from 'pg';
import fs from 'fs';

const { Pool } = pkg;

// โหลด ENV สำหรับ Local
const localEnv = dotenv.config({ path: '../.env.local' }).parsed;
const localPool = new Pool({
  user: localEnv.DB_USER,
  host: localEnv.DB_HOST,
  database: localEnv.DB_NAME,
  password: localEnv.DB_PASSWORD,
  port: Number(localEnv.DB_PORT),
});

// โหลด ENV สำหรับ Remote แบบ manual
const remoteRaw = fs.readFileSync('../.env.remote', 'utf8');  // ✅ แก้ path ตรงนี้
const remoteEnv = dotenv.parse(remoteRaw);

// ตรวจสอบค่าที่โหลดมา
console.log('🔍 ตรวจสอบรหัสผ่าน remote:', JSON.stringify(remoteEnv.DB_PASSWORD));
console.log('ชนิดข้อมูล:', typeof remoteEnv.DB_PASSWORD);

// ถ้า password ผิดพลาด
if (!remoteEnv.DB_PASSWORD || typeof remoteEnv.DB_PASSWORD !== 'string') {
  console.error('❌ รหัสผ่าน remote ไม่ถูกต้อง');
  process.exit(1);
}

const remotePool = new Pool({
  user: remoteEnv.DB_USER,
  host: remoteEnv.DB_HOST,
  database: remoteEnv.DB_NAME,
  password: remoteEnv.DB_PASSWORD.trim(),
  port: Number(remoteEnv.DB_PORT),
});

// ฟังก์ชัน import SQL
async function importSQLFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  try {
    console.log(`📂 เริ่มนำเข้าไฟล์ SQL: ${filePath}`);
    await client.query(sql);
    console.log('✅ นำเข้าข้อมูลสำเร็จแล้ว!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดขณะ import SQL:', err.message);
  }
}

// ฟังก์ชันหลัก
async function migrate() {
  const localClient = await localPool.connect();
  const remoteClient = await remotePool.connect();

  try {
    console.log('🔌 เชื่อมต่อฐานข้อมูลเรียบร้อย');
    await importSQLFile(remoteClient, './db/pgAdmin4.sql');
    console.log('\n🎉 การย้ายข้อมูลเสร็จสมบูรณ์');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    localClient.release();
    remoteClient.release();
    process.exit();
  }
}

migrate();
