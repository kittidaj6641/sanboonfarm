import pkg from 'pg'

import dotenv from 'dotenv'



dotenv.config()

const { Pool } = pkg



//สร้างคอนเนคชั่น

const pool = new Pool({

  user: process.env.DB_USER,

  host: process.env.DB_HOST,

  database: process.env.DB_NAME,

  password: process.env.DB_PASSWORD,

  port: process.env.DB_PORT

})



//ตรวจสอบ

pool.connect()

    .then( () => console.log("เชื่อมต่อ Database สำเร็จ") )

    .catch( err => console.log("เชื่อมต่อ Database ผิดพลาด ", err) )

export default pool