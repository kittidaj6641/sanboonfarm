import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        // 1. ดึงค่าจาก Header (รองรับทั้งตัวเล็กและตัวใหญ่)
        let token = req.header("Authorization") || req.header("authorization");

        // 2. ถ้าไม่มี Token ส่งมาเลย
        if (!token) {
            return res.status(403).json({ msg: "Access Denied: No Token Provided" });
        }

        // 3. ตัดคำว่า "Bearer " ออกถ้ามี (เพื่อให้ได้ Token เพียวๆ)
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        // 4. ตรวจสอบความถูกต้องกับ Secret Key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // เก็บข้อมูล User ที่แกะได้ลงใน req
        next(); // ไปทำงานต่อในฟังก์ชันถัดไป

    } catch (err) {
        res.status(500).json({ error: "Invalid Token: " + err.message });
    }
};
