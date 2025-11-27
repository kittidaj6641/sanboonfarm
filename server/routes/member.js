import express from "express";
import pool from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// ✅ แก้ไข: Import เฉพาะ verifyToken ให้ถูกต้อง (ลบ auth ที่ไม่ได้ใช้ออก)
import { verifyToken } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

const genToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// --- 1. ส่วนจัดการสมาชิก (Auth) ---

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(400).json({ msg: "ไม่พบ Email" });
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(400).json({ msg: "Password ไม่ถูกต้อง" });
        
        const token = genToken(user.rows[0]);
        await pool.query("INSERT INTO login_logs (email, login_time, status) VALUES ($1, NOW(), $2)", [email, "online"]);
        
        res.json({ msg: "เข้าสู่ระบบสำเร็จ", token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// Logout
router.post("/logout", verifyToken, async (req, res) => {
    const email = req.user.email;
    try {
        await pool.query(
            "UPDATE login_logs SET status = $1 WHERE email = $2 AND id = (SELECT id FROM login_logs WHERE email = $2 ORDER BY login_time DESC LIMIT 1)",
            ["offline", email]
        );
        res.json({ msg: "ออกจากระบบสำเร็จ" });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// Profile
router.get("/", verifyToken, async (req, res) => {
    const userid = req.user.id;
    try {
        const user = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [userid]);
        res.json(user.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
});

// Register (เพิ่ม user ใหม่)
router.post("/", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) return res.json({ msg: "Email นี้มีการใช้งานแล้ว" });
        
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING name, email", [name, email, hashedPass]);
        
        res.status(201).json({ msg: "สมัครสมาชิกสำเร็จ", user: newUser.rows[0] });
    } catch (err) {
        console.error('User registration error:', err);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
});

// Login Logs
router.get("/login-logs", verifyToken, async (req, res) => {
    try {
        const logs = await pool.query("SELECT email, login_time, status FROM login_logs WHERE email = $1 ORDER BY login_time DESC", [req.user.email]);
        res.json(logs.rows);
    } catch (err) {
        console.error('Login logs error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// --- 2. ส่วนจัดการคุณภาพน้ำ ---

router.get("/water-quality", verifyToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM water_quality ORDER BY recorded_at DESC LIMIT 8");
        res.json(result.rows);
    } catch (err) {
        console.error('Water quality fetch error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

router.post('/water-quality-sensor', async (req, res) => {
  const { dissolved_oxygen, ph, temperature, turbidity } = req.body;
  if (!dissolved_oxygen || !ph || !temperature || !turbidity) {
    return res.status(400).json({ msg: "Missing sensor values" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO water_quality (dissolved_oxygen, ph, temperature, turbidity) VALUES ($1, $2, $3, $4) RETURNING *",
      [dissolved_oxygen, ph, temperature, turbidity]
    );
    console.log('Data saved:', result.rows[0]);
    res.status(201).json({ msg: "Data saved successfully", data: result.rows[0] });
  } catch (err) {
    console.error('Sensor error:', err);
    res.status(500).json({ error: "Server Error " + err.message });
  }
});

// --- 3. ส่วนจัดการอุปกรณ์ (Device Management) ---

// ✅ แก้ไข: ใช้ verifyToken แทน auth (ที่เคยผิด)
router.post('/devices/add', verifyToken, async (req, res) => {
    const { deviceName, deviceId, location } = req.body;

    // ตรวจสอบข้อมูล
    if (!deviceName || !deviceId) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อและรหัสอุปกรณ์' });
    }

    try {
        // 1. ตรวจสอบว่ามี Device ID นี้อยู่แล้วหรือไม่
        const checkQuery = 'SELECT * FROM devices WHERE device_id = $1';
        const checkResult = await pool.query(checkQuery, [deviceId]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'รหัสอุปกรณ์นี้ (Device ID) มีอยู่ในระบบแล้ว' });
        }

        // 2. บันทึกข้อมูล
        const insertQuery = `
            INSERT INTO devices (device_name, device_id, location, status, added_at)
            VALUES ($1, $2, $3, 'active', NOW())
            RETURNING *
        `;
        const values = [deviceName, deviceId, location];
        const result = await pool.query(insertQuery, values);

        console.log('Device added:', result.rows[0]);
        res.status(201).json({ 
            message: 'เพิ่มอุปกรณ์สำเร็จ', 
            device: result.rows[0] 
        });

    } catch (err) {
        console.error('Error adding device:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดทางเทคนิค' });
    }
});

// ✅ GET Devices
router.get('/devices', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM devices ORDER BY added_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching devices' });
    }
});

export default router;
