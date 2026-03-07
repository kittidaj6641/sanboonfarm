import express from "express";
import pool from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

// แสดงโปรไฟล์ member
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

// สมัครสมาชิก
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

// ดึง login logs
router.get("/login-logs", verifyToken, async (req, res) => {
    try {
        const logs = await pool.query("SELECT email, login_time, status FROM login_logs WHERE email = $1 ORDER BY login_time DESC", [req.user.email]);
        res.json(logs.rows);
    } catch (err) {
        console.error('Login logs error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// ดึงข้อมูล water_quality 8 ตัวล่าสุด
router.get("/water-quality", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM water_quality ORDER BY recorded_at DESC LIMIT 8");
        res.json(result.rows);
    } catch (err) {
        console.error('Water quality fetch error:', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// รับข้อมูลจากเซ็นเซอร์และบันทึกใน water_quality
router.post('/water-quality-sensor', async (req, res) => {
    const { dissolved_oxygen, ph, temperature, turbidity } = req.body;

    if (!dissolved_oxygen || !ph || !temperature || !turbidity) {
        return res.status(400).json({ msg: "Missing dissolved_oxygen, ph, temperature, or turbidity value" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO water_quality (dissolved_oxygen, ph, temperature, turbidity) VALUES ($1, $2, $3, $4) RETURNING *",
            [dissolved_oxygen, ph, temperature, turbidity]
        );
        console.log('Water quality data saved at', new Date().toISOString(), ':', result.rows[0]);
        res.status(201).json({ msg: "Data saved successfully", data: result.rows[0] });
    } catch (err) {
        console.error('Water quality sensor error at', new Date().toISOString(), ':', err);
        res.status(500).json({ error: "Server Error " + err.message });
    }
});

// ==========================================
// 🚀 Device Management Routes
// ==========================================

// 🔥 GET /member/devices - ดึงข้อมูลอุปกรณ์ทั้งหมด
router.get('/devices', async (req, res) => {
    console.log('📥 GET /member/devices');
    try {
        const result = await pool.query('SELECT * FROM devices ORDER BY added_at DESC');
        console.log(`✅ Found ${result.rows.length} devices`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error fetching devices:', err);
        res.status(500).json({ error: 'Error fetching devices' });
    }
});

// 🔥 POST /member/devices/add - เพิ่มอุปกรณ์ใหม่
router.post('/devices/add', verifyToken, async (req, res) => {
    console.log('='.repeat(50));
    console.log('📥 POST /member/devices/add - Request received');
    console.log('📦 Request body:', req.body);
    console.log('👤 User from token:', req.user);
    console.log('='.repeat(50));
    
    const { deviceName, deviceId, location } = req.body;
    const userId = req.user?.id || null;

    // Validation
    if (!deviceName || !deviceId) {
        console.log('❌ Validation failed: Missing required fields');
        return res.status(400).json({ 
            msg: "กรุณากรอกชื่อและรหัสอุปกรณ์",
            error: "กรุณากรอกชื่อและรหัสอุปกรณ์"
        });
    }

    try {
        // 1. ตรวจสอบว่ามี Device ID ซ้ำหรือไม่
        console.log('🔍 Checking duplicate device_id:', deviceId);
        const deviceExists = await pool.query(
            "SELECT * FROM devices WHERE device_id = $1", 
            [deviceId]
        );
        
        if (deviceExists.rows.length > 0) {
            console.log('❌ Device ID already exists:', deviceId);
            return res.status(400).json({ 
                msg: "รหัสอุปกรณ์นี้มีอยู่แล้วในระบบ",
                error: "รหัสอุปกรณ์นี้มีอยู่แล้วในระบบ",
                existingDevice: deviceExists.rows[0]
            });
        }

        console.log('✅ Device ID is unique, proceeding to insert...');

        // 2. บันทึกลงฐานข้อมูล
        const query = `
            INSERT INTO devices (device_name, device_id, location, user_id, status, added_at)
            VALUES ($1, $2, $3, $4, 'active', NOW())
            RETURNING *
        `;
        
        const values = [
            deviceName.trim(), 
            deviceId.trim(), 
            location?.trim() || null, 
            userId
        ];
        
        console.log('💾 Executing query with values:', values);
        
        const newDevice = await pool.query(query, values);

        console.log('✅ Device added successfully!');
        console.log('📄 New device data:', newDevice.rows[0]);
        console.log('='.repeat(50));
        
        res.status(201).json({ 
            msg: "เพิ่มอุปกรณ์สำเร็จ", 
            message: "เพิ่มอุปกรณ์สำเร็จ",
            device: newDevice.rows[0] 
        });
        
    } catch (err) {
        console.error('='.repeat(50));
        console.error("❌ ERROR OCCURRED:");
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        console.error("Error detail:", err.detail);
        console.error("Full error:", err);
        console.error('='.repeat(50));
        
        let errorMsg = "เกิดข้อผิดพลาดทางเทคนิค";
        
        if (err.code === '23505') {
            errorMsg = "รหัสอุปกรณ์นี้มีอยู่แล้วในระบบ";
        } else if (err.code === '23503') {
            errorMsg = "ไม่พบข้อมูล User";
        } else if (err.code === '42703') {
            errorMsg = "โครงสร้างตารางไม่ถูกต้อง - กรุณาตรวจสอบฐานข้อมูล";
        } else if (err.code === '42P01') {
            errorMsg = "ไม่พบตาราง devices - กรุณาสร้างตารางก่อน";
        }
        
        res.status(500).json({ 
            error: errorMsg,
            msg: errorMsg,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// 🔥 ต้องมีบรรทัดนี้ท้ายไฟล์!
export default router;
