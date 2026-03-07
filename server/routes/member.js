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

// ======================
// LOGIN
// ======================

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0)
            return res.status(400).json({ msg: "ไม่พบ Email" });

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword)
            return res.status(400).json({ msg: "Password ไม่ถูกต้อง" });

        const token = genToken(user.rows[0]);

        res.json({
            msg: "เข้าสู่ระบบสำเร็จ",
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ======================
// REGISTER
// ======================

router.post("/", async (req, res) => {

    const { name, email, password } = req.body;

    try {

        const userExists = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userExists.rows.length > 0)
            return res.json({ msg: "Email นี้มีการใช้งานแล้ว" });

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
            [name, email, hashedPass]
        );

        res.status(201).json(newUser.rows[0]);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

// ======================
// GET PROFILE
// ======================

router.get("/", verifyToken, async (req, res) => {

    try {

        const user = await pool.query(
            "SELECT id,name,email FROM users WHERE id=$1",
            [req.user.id]
        );

        res.json(user.rows[0]);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

// ======================
// GET DEVICES
// ======================

router.get("/devices", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM devices ORDER BY added_at DESC"
        );

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

// ======================
// ADD DEVICE
// ======================

router.post("/devices/add", verifyToken, async (req, res) => {

    const { deviceName, deviceId, location } = req.body;

    try {

        const exists = await pool.query(
            "SELECT * FROM devices WHERE device_id=$1",
            [deviceId]
        );

        if (exists.rows.length > 0)
            return res.status(400).json({ msg: "Device ซ้ำ" });

        const newDevice = await pool.query(
            `INSERT INTO devices(device_name,device_id,location,user_id,status,added_at)
             VALUES($1,$2,$3,$4,'active',NOW()) RETURNING *`,
            [deviceName, deviceId, location, req.user.id]
        );

        res.json(newDevice.rows[0]);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

// ======================
// GET WATER QUALITY
// ======================

router.get("/water-quality", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM water_quality ORDER BY recorded_at DESC LIMIT 8"
        );

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

// ======================
// POST SENSOR DATA
// ======================

router.post("/water-quality-sensor", async (req, res) => {

    const {
        device_id,
        dissolved_oxygen,
        ph,
        temperature,
        turbidity
    } = req.body;

    if (!device_id)
        return res.status(400).json({ msg: "device_id required" });

    try {

        const result = await pool.query(
            `INSERT INTO water_quality
            (device_id,dissolved_oxygen,ph,temperature,turbidity)
            VALUES($1,$2,$3,$4,$5) RETURNING *`,
            [
                device_id,
                dissolved_oxygen,
                ph,
                temperature,
                turbidity
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

export default router;
