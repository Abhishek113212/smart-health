import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "hospital-secret-key";

app.use(express.json());

// --- Mock Database ---
const users: any[] = [
  { id: "1", name: "John Doe", email: "patient@example.com", password: "", role: "patient" },
  { id: "2", name: "Dr. Smith", email: "doctor@example.com", password: "", role: "doctor", specialization: "Cardiology", hospitalId: "h1" }
];

const hospitals = [
  { id: "h1", name: "City General Hospital", location: "Downtown" },
  { id: "h2", name: "St. Mary's Medical Center", location: "Uptown" }
];

const doctors = [
  { id: "d1", name: "Dr. Alice Smith", specialization: "Cardiology", hospitalId: "h1", rating: 4.8, reviews: 120, availability: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  { id: "d2", name: "Dr. Bob Johnson", specialization: "Pediatrics", hospitalId: "h1", rating: 4.5, reviews: 85, availability: ["10:00", "11:00", "12:00", "15:00", "16:00"] },
  { id: "d3", name: "Dr. Charlie Brown", specialization: "Dermatology", hospitalId: "h2", rating: 4.9, reviews: 210, availability: ["09:00", "10:00", "13:00", "14:00"] }
];

const appointments: any[] = [];
const medicalRecords: any[] = [
  { id: "r1", patientId: "1", doctorId: "d1", date: "2024-03-15", diagnosis: "Mild Hypertension", prescription: "Amlodipine 5mg", hospital: "City General" }
];

// Queue state
const queues: Record<string, { currentToken: number, waiting: number, activeToken: number | null }> = {
  "d1": { currentToken: 5, waiting: 3, activeToken: 2 },
  "d2": { currentToken: 12, waiting: 5, activeToken: 7 },
  "d3": { currentToken: 3, waiting: 1, activeToken: 2 }
};

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API Routes ---

// Auth
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "User not found" });
  // In a real app, use bcrypt.compare
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Doctors & Hospitals
app.get("/api/doctors", (req, res) => {
  res.json(doctors.map(d => ({
    ...d,
    hospital: hospitals.find(h => h.id === d.hospitalId)?.name
  })));
});

app.get("/api/hospitals", (req, res) => res.json(hospitals));

// Appointments
app.get("/api/appointments", authenticate, (req: any, res) => {
  const userAppointments = appointments.filter(a => a.patientId === req.user.id || a.doctorId === req.user.id);
  res.json(userAppointments);
});

app.post("/api/appointments", authenticate, (req: any, res) => {
  const { doctorId, date, time } = req.body;
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  const tokenNumber = queues[doctorId].currentToken + 1;
  queues[doctorId].currentToken = tokenNumber;
  queues[doctorId].waiting += 1;

  const appointment = {
    id: Math.random().toString(36).substr(2, 9),
    patientId: req.user.id,
    doctorId,
    doctorName: doctor.name,
    hospitalName: hospitals.find(h => h.id === doctor.hospitalId)?.name,
    date,
    time,
    tokenNumber,
    status: "scheduled"
  };
  appointments.push(appointment);

  // Notify doctor and patient via socket
  io.emit(`queue-update-${doctorId}`, queues[doctorId]);

  res.json(appointment);
});

// Queue Tracking
app.get("/api/queue/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  res.json(queues[doctorId] || { currentToken: 0, waiting: 0, activeToken: null });
});

// Medical Records
app.get("/api/medical-records", authenticate, (req: any, res) => {
  const records = medicalRecords.filter(r => r.patientId === req.user.id || (req.user.role === 'doctor' && r.patientId === req.query.patientId));
  res.json(records);
});

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
