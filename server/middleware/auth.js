import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ msg: "ไม่ได้รับอนุญาต (Unauthorized)" });
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // เก็บข้อมูลผู้ใช้ไว้ใน req
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Token ไม่ถูกต้อง (Forbidden)" });
    }
};
