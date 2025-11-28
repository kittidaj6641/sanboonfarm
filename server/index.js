import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/devices.js";
import sensorRoutes from "./routes/sensor.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: "*" }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/sensor", sensorRoutes);

// Serve Frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "client_build");

app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
    // ป้องกัน Error กรณีไม่มีโฟลเดอร์ build
    if (req.accepts('html')) {
        res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
            if (err) res.status(500).send("Server Error: Frontend build not found.");
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
