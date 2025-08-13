import express from "express"
import memberRoutes from "./routes/member.js"
import registerRoutes from "./routes/register.js"
import cors from "cors";


const app = express()
const port = 8080

app.use(cors())
 
app.use(express.json())
app.use("/member", memberRoutes)
app.use('/register', registerRoutes);





app.get("/", (req, res) => {
    res.json({ message: "hello KSU YES I CAN" })
})


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log("server running at port " + port)
})
