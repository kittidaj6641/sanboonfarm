// index.js
import express from "express"
import memberRoutes from "./routes/member.js"
import registerRoutes from "./routes/register.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const port = process.env.PORT || 8080

// ✅ แก้ไข CORS: ยอมรับทุกโดเมน (เพื่อให้ localhost ยิงเข้า Railway ได้)
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

// ✅ Log Request: ดูว่ามีอะไรยิงเข้ามาที่ Server บ้าง
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

app.use("/member", memberRoutes)
app.use("/register", registerRoutes)

app.get("/api", (req, res) => {
  res.json({ message: "Hello from Sanboon Farm API" })
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve React Build (ถ้ามี)
app.use(express.static(path.join(__dirname, "../../login-react/build")))
app.get("*", (req, res) => {
    // เช็คก่อนว่าไฟล์ index.html มีอยู่จริงไหม เพื่อกัน Error เวลาหาไม่เจอ
    const indexPath = path.join(__dirname, "../../login-react/build", "index.html");
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(500).send("Server Error: React build not found.");
        }
    });
})

app.listen(port, () => {
  console.log("Server running at port " + port)
})
