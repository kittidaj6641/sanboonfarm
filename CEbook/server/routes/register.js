import express from "express";
import pool from "../db/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // ตรวจสอบว่าข้อมูลครบถ้วน
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        // ตรวจสอบว่า email ซ้ำหรือไม่
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ msg: "Email นี้มีการใช้งานแล้ว" });
        }

        // แฮชรหัสผ่าน
        const hashedPass = await bcrypt.hash(password, 10);

        // เพิ่มผู้ใช้ใหม่
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING name, email",
            [name, email, hashedPass]
        );

        res.status(201).json({ msg: "สมัครสมาชิกสำเร็จ", user: newUser.rows[0] });
    } catch (err) {
        console.error('User registration error:', err);
        res.status(500).json({ msg: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
});

export default router;