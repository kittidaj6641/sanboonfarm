import express from "express"
import memberRoutes from "./routes/member.js"  // 🔥 สำคัญมาก!
import registerRoutes from "./routes/register.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const port = process.env.PORT || 8080

console.log('='.repeat(60));
console.log('🚀 Starting Server...');
console.log('='.repeat(60));

// ✅ CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ✅ Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
})

// ✅ Routes - สำคัญมาก!
app.use("/member", memberRoutes)      // 🔥 ต้องมีบรรทัดนี้!
app.use("/register", registerRoutes)

console.log('✅ Routes registered:');
console.log('   - /member/* -> memberRoutes');
console.log('   - /register/* -> registerRoutes');

// ✅ Test Endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    routes: [
      'GET  /api',
      'GET  /health',
      'POST /member/login',
      'POST /member/logout',
      'GET  /member/',
      'GET  /member/devices',
      'POST /member/devices/add',
      'GET  /member/water-quality',
      'POST /member/water-quality-sensor'
    ]
  })
})

app.get("/api", (req, res) => {
  res.json({ 
    message: "hello KSU YES I CAN",
    status: "Server is running",
    timestamp: new Date().toISOString()
  })
})

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    port: port,
    timestamp: new Date().toISOString()
  })
})

// ✅ Test route สำหรับทดสอบว่า /member/devices/add ทำงานหรือไม่
app.get("/test-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.toString()
            .replace('/^\\', '')
            .replace('\\/?(?=\\/|$)/i', '');
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
})

// ✅ ES Module __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Static files (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../../login-react/build")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../login-react/build", "index.html"))
  })
}

// ✅ 404 Handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      'GET  /api',
      'GET  /health',
      'POST /member/login',
      'GET  /member/devices',
      'POST /member/devices/add'
    ]
  })
})

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:');
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  })
})

// ✅ Start Server
app.listen(port, () => {
  console.log('='.repeat(60));
  console.log(`✅ Server is running!`);
  console.log(`📡 Port: ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log('Available endpoints:');
  console.log('   GET  http://localhost:' + port + '/api');
  console.log('   GET  http://localhost:' + port + '/health');
  console.log('   POST http://localhost:' + port + '/member/login');
  console.log('   GET  http://localhost:' + port + '/member/devices');
  console.log('   POST http://localhost:' + port + '/member/devices/add');
  console.log('='.repeat(60));
})
