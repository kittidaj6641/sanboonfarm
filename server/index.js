import express from "express"
import memberRoutes from "./routes/member.js"
import registerRoutes from "./routes/register.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"


const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use("/member", memberRoutes)
app.use("/register", registerRoutes)

app.get("/api", (req, res) => {
  res.json({ message: "hello KSU YES I CAN" })
})

// ✅ ใช้ __dirname แบบ ES Module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ เปลี่ยน path ให้ถูกต้อง: login-react อยู่นอก CEbook ต้องถอย 2 ขั้น
app.use(express.static(path.join(__dirname, "../../login-react/build")))
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../login-react/build", "index.html"))
})

app.listen(port, () => {
  console.log("server running at port " + port)
})
