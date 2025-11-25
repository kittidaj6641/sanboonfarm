import express from 'express';
import db from '../db/db.js'; // ต้องใส่นามสกุล .js ด้วยใน ES Module

const router = express.Router();

// POST /api/devices/add - เพิ่มอุปกรณ์ใหม่
router.post('/add', async (req, res) => {
    const { deviceName, deviceId, location } = req.body;

    // ตรวจสอบค่าว่าง
    if (!deviceName || !deviceId) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อและรหัสอุปกรณ์' });
    }

    try {
        // 1. ตรวจสอบว่ามี Device ID นี้อยู่แล้วหรือไม่
        const checkQuery = 'SELECT * FROM devices WHERE device_id = $1';
        const checkResult = await db.query(checkQuery, [deviceId]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'รหัสอุปกรณ์นี้ (Device ID) มีอยู่ในระบบแล้ว' });
        }

        // 2. บันทึกลงฐานข้อมูล
        const insertQuery = `
            INSERT INTO devices (device_name, device_id, location, status, added_at)
            VALUES ($1, $2, $3, 'active', NOW())
            RETURNING *
        `;
        const values = [deviceName, deviceId, location];
        const result = await db.query(insertQuery, values);

        console.log('Device added:', result.rows[0]);
        res.status(201).json({ 
            message: 'เพิ่มอุปกรณ์สำเร็จ', 
            device: result.rows[0] 
        });

    } catch (err) {
        console.error('Error adding device:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดทางเทคนิค ไม่สามารถบันทึกข้อมูลได้' });
    }
});

// GET /api/devices - ดึงรายชื่ออุปกรณ์ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM devices ORDER BY added_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching devices' });
    }
});

// ✅ ใช้ export default เพื่อให้ index.js สามารถ import ได้ถูกต้อง
export default router;
