import express from "express"
import memberRoutes from "./routes/member.js"
import registerRoutes from "./routes/register.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const port = 8080

app.use(cors())
app.use(express.json())

app.use("/member", memberRoutes)
app.use("/register", registerRoutes)

app.get("/api", (req, res) => {
  res.json({ message: "hello KSU YES I CAN" })
})

// สำหรับใช้ path แบบ __dirname ใน ES Module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🔁 Serve static files from React build folder (login-react/build)
app.use(express.static(path.join(__dirname, "../../login-react/build")))

// 🔁 สำหรับทุกเส้นทาง (เช่น /, /login, /dashboard) ส่ง index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../login-react/build/index.html"))
})

app.listen(port, () => {
  console.log("server running at port " + port)
})
