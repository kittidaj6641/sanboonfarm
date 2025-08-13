import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// โหลด env ทั้งสองชุด
dotenv.config({ path: '.env.local' });
const localPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

dotenv.config({ path: '.env.remote' });
const remotePool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  const localClient = await localPool.connect();
  const remoteClient = await remotePool.connect();

  try {
    console.log('🔌 เชื่อมต่อฐานข้อมูลเรียบร้อย');

    const resTables = await localClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type='BASE TABLE'
    `);

    const tables = resTables.rows.map(row => row.table_name);
    console.log('📋 ตารางที่พบ:', tables);

    for (const table of tables) {
      console.log(`🚚 กำลังคัดลอก: ${table}`);

      const tableCreateRes = await localClient.query(`
        SELECT 'CREATE TABLE ' || relname || E'\n(\n' ||
        array_to_string(
          array_agg(
            '    ' || column_name || ' ' || type ||
            CASE 
              WHEN column_default IS NOT NULL AND column_default NOT LIKE 'nextval%' 
              THEN ' DEFAULT ' || column_default 
              ELSE '' 
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
          )
          , E',\n'
        ) || E'\n);' as create_table_sql
        FROM (
          SELECT 
            c.relname,
            a.attname as column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) as type,
            a.attnotnull as not_null,
            pg_get_expr(ad.adbin, ad.adrelid) as column_default,
            a.attnum,
            CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable
          FROM pg_class c
          JOIN pg_attribute a ON a.attrelid = c.oid
          LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
          WHERE c.relname = '${table}' AND a.attnum > 0 AND NOT a.attisdropped
          ORDER BY a.attnum
        ) as sub
        GROUP BY relname
      `);

      const createTableSQL = tableCreateRes.rows[0]?.create_table_sql;

      await remoteClient.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      await remoteClient.query(createTableSQL);

      const dataRes = await localClient.query(`SELECT * FROM "${table}"`);

      for (const row of dataRes.rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const insertSQL = `INSERT INTO "${table}" (${columns.join(',')}) VALUES (${placeholders.join(',')})`;
        await remoteClient.query(insertSQL, values);
      }

      console.log(`✅ สำเร็จ: ${table}`);
    }

    console.log('\n🎉 ย้ายข้อมูลสำเร็จทั้งหมด');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    localClient.release();
    remoteClient.release();
    process.exit();
  }
}

migrate();
